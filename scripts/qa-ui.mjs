// Read-only browser checks. Requires a production build and local Chrome.
// Starts isolated server/browser processes; never submits forms or changes CMS data.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3112";
const output = await mkdtemp(path.join(tmpdir(), "gap-ui-qa-"));
const browserPath =
  process.env.QA_BROWSER_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const server = process.env.QA_BASE_URL
  ? null
  : spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        "3112",
      ],
      { windowsHide: true, stdio: "ignore" },
    );
const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=9227",
    `--user-data-dir=${path.join(output, "profile")}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
let sequence = 0;
const pending = new Map();
const errors = [];
let optionsAttempts = 0;
async function until(fn, label, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const result = await fn();
      if (result) return result;
    } catch {}
    await pause(100);
  }
  throw new Error(`Timed out: ${label}`);
}
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 20000);
    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails)
    throw new Error(
      result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text,
    );
  return result.result?.value;
}
async function click(expression) {
  await evaluate(
    `(${expression})?.scrollIntoView({block:'center',behavior:'instant'})`,
  );
  const rect = await evaluate(
    `(()=>{const e=(${expression});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`,
  );
  assert.ok(rect, `Missing click target: ${expression}`);
  await command("Input.dispatchMouseEvent", {
    type: "mousePressed",
    ...rect,
    button: "left",
    clickCount: 1,
  });
  await command("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    ...rect,
    button: "left",
    clickCount: 1,
  });
}
async function escape() {
  await command("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await command("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
}
async function navigate(route, ready) {
  await evaluate("window.__qaNavigationPending = true");
  await command("Page.navigate", { url: base + route });
  await until(
    () =>
      evaluate(
        `!window.__qaNavigationPending && location.pathname === ${JSON.stringify(route)} && (${ready})`,
      ),
    route,
  );
  await until(
    () =>
      evaluate(
        "!document.querySelector('button[aria-label=\"Dark mode\"]') || Object.keys(document.querySelector('button[aria-label=\"Dark mode\"]')).some(key=>key.startsWith('__reactProps'))",
      ),
    "interactive hydration",
  );
  await pause(450);
}
async function screenshot(name) {
  const shot = await command("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(
    path.join(output, name + ".png"),
    Buffer.from(shot.data, "base64"),
  );
}

try {
  await until(
    async () => (await fetch(base, { signal: AbortSignal.timeout(1000) })).ok,
    "production server",
  );
  const tabs = await until(async () => {
    const result = await fetch("http://127.0.0.1:9227/json");
    return result.ok && (await result.json());
  }, "Chrome");
  socket = new WebSocket(
    tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl,
  );
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const promise = pending.get(message.id);
      pending.delete(message.id);
      message.error
        ? promise.reject(new Error(message.error.message))
        : promise.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown")
      errors.push(
        message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text,
      );
    if (
      message.method === "Runtime.consoleAPICalled" &&
      message.params.type === "error"
    )
      errors.push(
        message.params.args
          .map((arg) => arg.value || arg.description || "")
          .join(" "),
      );
    if (message.method === "Fetch.requestPaused") {
      const failed = optionsAttempts++ === 0;
      const body = failed
        ? { error: "Synthetic QA failure" }
        : { countries: [{ id: 1, name: "Australia" }], universities: [] };
      void command("Fetch.fulfillRequest", {
        requestId: message.params.requestId,
        responseCode: failed ? 503 : 200,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }],
        body: Buffer.from(JSON.stringify(body)).toString("base64"),
      });
    }
  });
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  if (process.argv.includes("--globe-fixture")) {
    await navigate(
      "/qa-globe-local",
      "!!document.querySelector('canvas[tabindex=\"0\"]')",
    );
    const canvas = "document.querySelector('[data-hero-globe] canvas')";
    await until(
      () =>
        evaluate(
          "[...document.querySelectorAll('[data-hero-globe] a')].some(a=>getComputedStyle(a).visibility==='visible')",
        ),
      "visible country labels",
    );
    const seen = new Set();
    for (let step = 0; step < 12; step++) {
      await evaluate(
        `${canvas}.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`,
      );
      await pause(100);
      const visible = await evaluate(
        "[...document.querySelectorAll('[data-hero-globe] a')].filter(a=>getComputedStyle(a).visibility==='visible').map(a=>({name:a.textContent,href:a.getAttribute('href'),rect:a.getBoundingClientRect().toJSON(),shift:parseFloat(a.style.getPropertyValue('--label-shift'))||0,anchor:document.querySelector('[style*=\"anchor-name: '+a.style.positionAnchor+';\"]')?.getBoundingClientRect().toJSON()}))",
      );
      for (const item of visible) {
        seen.add(item.name);
        assert.ok(item.anchor, `${item.name} anchor exists`);
        assert.ok(
          Math.abs(item.rect.x + item.rect.width / 2 - item.anchor.x - 0.5) < 3,
          `${item.name} horizontal anchor alignment`,
        );
        assert.ok(
          Math.abs(item.rect.bottom - item.shift - item.anchor.top) < 3,
          `${item.name} vertical anchor alignment`,
        );
        assert.ok(item.href.startsWith("/country/"));
      }
    }
    for (const width of [320, 768, 1440]) {
      await command("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await pause(300);
      await screenshot(`globe-fixture-${width}`);
      assert.ok(
        await evaluate(
          "document.documentElement.scrollWidth<=document.documentElement.clientWidth",
        ),
        "Fixture overflow",
      );
      assert.ok(
        await evaluate(
          "(()=>{const r=[...document.querySelectorAll('[data-hero-globe] a')].filter(a=>getComputedStyle(a).visibility==='visible').map(a=>a.getBoundingClientRect());return r.every((a,i)=>r.slice(i+1).every(b=>a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom))})()",
        ),
        "Country labels do not overlap",
      );
    }
    assert.ok(seen.size >= 5, `Rotated countries: ${[...seen]}`);
    assert.deepEqual(errors, [], "Populated globe runtime errors");
    console.log(
      `PASS populated globe: ${[...seen].join(", ")}. Screenshots: ${output}`,
    );
  } else if (process.argv.includes("--globe")) {
    await navigate(
      "/",
      "!!document.querySelector('[data-hero-globe] canvas[tabindex=\"0\"]')",
    );
    assert.equal(
      await evaluate("document.querySelectorAll('#process canvas').length"),
      0,
    );
    const label = "document.querySelector('[data-hero-globe] canvas')";
    const before = await evaluate(`${label}.dataset.rotation`);
    const point = await evaluate(
      "(()=>{const r=document.querySelector('[data-hero-globe] canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()",
    );
    await command("Input.dispatchMouseEvent", {
      type: "mousePressed",
      ...point,
      button: "left",
      clickCount: 1,
    });
    await command("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: point.x + 80,
      y: point.y,
      button: "left",
      buttons: 1,
    });
    await command("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: point.x + 80,
      y: point.y,
      button: "left",
      clickCount: 1,
    });
    await until(
      () => evaluate(`${label}.dataset.rotation !== ${JSON.stringify(before)}`),
      "globe drag rotates markers",
    );
    for (const width of [320, 768, 1440]) {
      await command("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await evaluate(
        "document.querySelector('[data-hero-globe]').scrollIntoView({behavior:'instant',block:'center'})",
      );
      await pause(500);
      assert.ok(
        await evaluate(
          "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
        ),
        `globe overflow ${width}`,
      );
      await screenshot(`hero-globe-${width}`);
    }
    await command("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: 0,
      y: 0,
    });
    const autoBefore = await evaluate(`${label}.dataset.rotation`);
    await until(
      () =>
        evaluate(`${label}.dataset.rotation !== ${JSON.stringify(autoBefore)}`),
      "globe automatic rotation",
    );
    const cms = await evaluate(
      "fetch('/api/countries?limit=300&depth=0').then(r=>r.json()).then(r=>r.docs.map(d=>d.slug).sort())",
    );
    const rendered = await evaluate(
      "[...document.querySelectorAll('[aria-label=\"Explore study destinations\"] a')].map(a=>a.getAttribute('href').split('/').pop()).sort()",
    );
    assert.deepEqual(rendered, cms, "Globe destinations match CMS countries");
    console.log(`CMS destinations verified: ${cms.length}`);
    assert.deepEqual(errors, [], "Globe browser errors");
    console.log(
      `PASS hero globe drag, autoplay, CMS destination parity and responsive widths. Screenshots: ${output}`,
    );
  } else if (process.argv.includes("--carousel")) {
    await navigate(
      "/",
      "!!document.querySelector('[aria-roledescription=carousel]')",
    );
    const track =
      "document.querySelector('[aria-roledescription=carousel] > div')";
    await evaluate(
      `${track}.scrollIntoView({behavior:'instant',block:'center'})`,
    );
    await command("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: 0,
      y: 0,
    });
    const initialPosition = await evaluate(`${track}.scrollLeft`);
    await until(
      () => evaluate(`${track}.scrollLeft > ${initialPosition} + 50`),
      "carousel autoplay",
    );
    assert.equal(
      await evaluate(
        "document.querySelectorAll('[aria-roledescription=carousel] button').length",
      ),
      0,
      "No carousel controls",
    );
    await evaluate(
      `${track}.querySelector('[role=group]:not([inert]) a').focus({preventScroll:true})`,
    );
    await pause(700);
    const stopped = await evaluate(`${track}.scrollLeft`);
    await pause(5000);
    assert.equal(
      await evaluate(`${track}.scrollLeft`),
      stopped,
      "Focus stops autoplay",
    );
    await evaluate("document.activeElement.blur()");
    await evaluate(
      `${track}.scrollTo({left:${track}.children[12].offsetLeft,behavior:'instant'})`,
    );
    await until(
      () =>
        evaluate(
          `Math.abs(${track}.scrollLeft - ${track}.children[6].offsetLeft) < 5`,
        ),
      "seamless clone boundary reset",
    );
    for (const width of [320, 768, 1440]) {
      await command("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await pause(300);
      if (width === 320) {
        await evaluate(
          `${track}.scrollIntoView({behavior:'instant',block:'center'})`,
        );
        const beforeSwipe = await evaluate(`${track}.scrollLeft`);
        const point = await evaluate(
          `(()=>{const r=${track}.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(Math.max(100,r.top+100))}})()`,
        );
        await command("Input.synthesizeScrollGesture", {
          ...point,
          xDistance: -180,
          yDistance: 0,
          gestureSourceType: "touch",
          speed: 400,
        });
        await until(
          () => evaluate(`Math.abs(${track}.scrollLeft - ${beforeSwipe}) > 50`),
          "mobile finger swipe",
        );
      }
      const dimensions = await evaluate(
        '({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,wide:[...document.querySelectorAll("body *")].filter(e=>!e.closest("[aria-roledescription=carousel]") && e.getBoundingClientRect().right>innerWidth+2).slice(0,8).map(e=>({tag:e.tagName,classes:e.className,right:e.getBoundingClientRect().right}))})',
      );
      assert.ok(
        dimensions.scroll <= dimensions.width,
        `carousel overflow ${width}: ${JSON.stringify(dimensions)}`,
      );
      await screenshot(`carousel-${width}`);
    }
    await command("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await pause(700);
    const reducedPosition = await evaluate(`${track}.scrollLeft`);
    await pause(5000);
    assert.equal(
      await evaluate(`${track}.scrollLeft`),
      reducedPosition,
      "Reduced motion stops autoplay",
    );
    assert.deepEqual(errors, [], "Carousel browser errors");
    console.log(
      `PASS carousel autoplay, pause, wrap, responsive widths and reduced motion. Screenshots: ${output}`,
    );
  } else if (process.argv.includes("--responsive")) {
    for (const width of [320, 768, 1440]) {
      await command("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      for (const route of [
        "/",
        "/about",
        "/services",
        "/country/australia",
        "/news",
        "/universities",
        "/apply",
      ]) {
        await navigate(route, "!!document.querySelector('main h1')");
        const dimensions = await evaluate(
          "({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})",
        );
        assert.ok(
          dimensions.scroll <= dimensions.width,
          `${route} overflows at ${width}px: ${JSON.stringify(dimensions)}`,
        );
        if (route === "/apply") {
          console.log(
            "Application page check",
            await evaluate(
              "({url:location.href,title:document.title,forms:document.forms.length,main:document.querySelector('main')?.innerText.slice(0,1000)})",
            ),
          );
          await until(
            () => evaluate("!!document.querySelector('form')"),
            "application form",
          );
          await evaluate(
            "document.querySelector('form').scrollIntoView({behavior:'instant',block:'start'})",
          );
        }
        await screenshot(
          `responsive-${width}-${route.replaceAll("/", "-") || "home"}`,
        );
      }
      console.log(`PASS public routes at ${width}px`);
    }
    await command("Fetch.enable", {
      patterns: [{ urlPattern: "*api/application-options*" }],
    });
    await navigate("/apply", "!!document.querySelector('form')");
    await until(
      () =>
        evaluate(
          "document.querySelector('[role=alert]')?.textContent.includes('load the study destinations')",
        ),
      "options failure feedback",
    );
    await click(
      "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Try again'))",
    );
    await until(
      () =>
        evaluate(
          "document.querySelector('#application-country') && !document.querySelector('#application-country').disabled",
        ),
      "options retry succeeds",
    );
    await command("Fetch.disable");
    assert.deepEqual(errors, [], "Responsive browser errors");
    console.log(
      `PASS application options error/retry without submitting data. Screenshots: ${output}`,
    );
  } else if (process.argv.includes("--admin")) {
    assert.ok(
      process.env.QA_AUTH_TOKEN,
      "Temporary QA authentication required",
    );
    await command("Network.setCookie", {
      name: "payload-token",
      value: process.env.QA_AUTH_TOKEN,
      url: base,
      httpOnly: true,
      sameSite: "Lax",
    });
    await navigate("/admin", "!!document.querySelector('.gap-nav')");
    await until(
      () => evaluate("!!document.querySelector('.nav--nav-hydrated')"),
      "Admin hydration",
    );
    if (!(await evaluate("!!document.querySelector('.nav--nav-open')"))) {
      await click("document.querySelector('button.nav-toggler')");
      await until(
        () => evaluate("!!document.querySelector('.nav--nav-open')"),
        "open sidebar",
      );
    }
    await pause(500);
    assert.equal(
      await evaluate(
        "document.querySelectorAll('.gap-nav a[id^=nav-]').length",
      ),
      12,
    );
    assert.equal(
      await evaluate("document.querySelectorAll('.nav-group__toggle').length"),
      0,
    );
    await screenshot("admin-dashboard");
    for (const collection of [
      "website-content",
      "media",
      "countries",
      "universities",
      "services",
      "testimonials",
      "news",
      "site-settings",
      "users",
      "leads",
      "applications",
      "documents",
    ]) {
      await navigate(
        `/admin/collections/${collection}`,
        "!!document.querySelector('.collection-list')",
      );
    }
    const sectionId = await evaluate(
      "fetch('/api/website-content?where[key][equals]=home-hero&limit=1').then(r=>r.json()).then(r=>r.docs[0].id)",
    );
    await navigate(
      `/admin/collections/website-content/${sectionId}`,
      "!!document.querySelector('input[name=title]')",
    );
    assert.ok(
      await evaluate("document.body.textContent.includes('Your next chapter')"),
      "Editable hero fields render",
    );
    await screenshot("admin-website-content");
    await click("document.querySelector('#nav-countries')");
    await until(
      () =>
        evaluate(
          "location.pathname.endsWith('/collections/countries') && !!document.querySelector('.collection-list')",
        ),
      "countries list",
    );
    await pause(700);
    assert.ok(
      await evaluate("!!document.querySelector('.nav--nav-open')"),
      "Desktop sidebar stays open",
    );
    await screenshot("admin-countries");
    await navigate(
      "/admin/collections/countries/create",
      "!!document.querySelector('input[name=name]')",
    );
    await screenshot("admin-country-form");
    for (const width of [390, 320]) {
      await command("Emulation.setDeviceMetricsOverride", {
        width,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await pause(500);
      await screenshot(`admin-form-${width}`);
      const overflow = await evaluate(
        "[...document.querySelectorAll('main *, .template-default__wrap *')].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1 && e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,class:e.className,width:Math.round(e.getBoundingClientRect().width)})).slice(0,15)",
      );
      console.log(
        "Admin form viewport",
        width,
        await evaluate(
          "({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,inner:window.innerWidth})",
        ),
        overflow,
      );
      assert.ok(
        await evaluate(
          "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
        ),
        `Admin form overflow at ${width}px`,
      );
    }
    await navigate(
      "/admin/collections/countries",
      "!!document.querySelector('.collection-list')",
    );
    assert.ok(
      await evaluate(
        "document.documentElement.scrollWidth <= window.innerWidth",
      ),
      "Admin collection mobile overflow",
    );
    await screenshot("admin-list-mobile");
    console.log(
      "PASS Admin flat navigation, persistent desktop sidebar, collection list and form at 320/390px",
    );
    assert.deepEqual(errors, [], "Admin browser errors");
    console.log(`Screenshots: ${output}`);
  } else {
    await navigate(
      "/",
      "document.querySelector('header button[aria-haspopup=menu]') && document.querySelector('h1')?.textContent.includes('Your next chapter')",
    );
    if (process.argv.includes("--hydration")) {
      await pause(4000);
      console.log("Hydration console:", JSON.stringify(errors));
      assert.deepEqual(errors, []);
      process.exitCode = 0;
    } else {
      await until(
        () => evaluate("!!document.querySelector('[data-hero-globe] canvas')"),
        "hero globe",
      );
      await screenshot("home-desktop");
      await command("Network.setCookie", {
        name: "gap-theme",
        value: "light",
        url: base,
      });
      await navigate(
        "/",
        "document.documentElement.dataset.theme === 'dark' && !!document.querySelector('main h1')",
      );
      assert.equal(
        await evaluate(
          "document.querySelector('button[aria-label=\"Dark mode\"]')",
        ),
        null,
      );
      assert.equal(
        await evaluate("getComputedStyle(document.body).backgroundColor"),
        "rgb(17, 26, 22)",
      );
      console.log("PASS permanent dark theme despite old light preference");
      await until(
        () =>
          evaluate(
            "document.getAnimations().some(a=>a.id==='gap-section-reveal' && a.playState==='paused')",
          ),
        "offscreen reveals prepared",
      );
      await evaluate(
        "document.querySelector('#process').scrollIntoView({behavior:'instant',block:'center'})",
      );
      await until(
        () =>
          evaluate(
            "document.querySelector('#process > div').getAnimations().some(a=>a.id==='gap-section-reveal' && a.playState==='running')",
          ),
        "section reveal starts on scroll",
      );
      await evaluate(
        "Promise.all(document.querySelector('#process > div').getAnimations().map(a=>a.finished))",
      );
      assert.equal(
        await evaluate(
          "getComputedStyle(document.querySelector('#process > div')).opacity",
        ),
        "1",
      );
      await command("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await until(
        () =>
          evaluate(
            "!document.getAnimations().some(a=>a.id==='gap-section-reveal')",
          ),
        "reduced motion exposes all content",
      );
      await command("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
      });
      await evaluate(
        "window.__gapRouteSeen=false; let checks=0; function sample(){if(document.getAnimations().some(a=>a.id==='gap-route-enter'))window.__gapRouteSeen=true; if(checks++<600&&!window.__gapRouteSeen)requestAnimationFrame(sample)} requestAnimationFrame(sample)",
      );
      await click("document.querySelector('header a[href=\"/services\"]')");
      await until(
        () => evaluate("window.__gapRouteSeen === true"),
        "client navigation fade",
      );
      await navigate(
        "/",
        "!!document.querySelector('header button[aria-haspopup=menu]')",
      );
      console.log(
        "PASS scroll reveal, live reduced-motion preference, and route fade",
      );
      await click(
        "document.querySelector('header button[aria-haspopup=menu]')",
      );
      await until(
        () =>
          evaluate(
            "document.querySelector('[role=menu]')?.textContent.includes('New Zealand')",
          ),
        "country dropdown",
      );
      await escape();
      await until(
        () => evaluate("!document.querySelector('[role=menu]')"),
        "menu closes",
      );
      assert.equal(
        await evaluate("document.activeElement?.getAttribute('aria-haspopup')"),
        "menu",
      );
      await click(
        "[...document.querySelectorAll('header button')].find(b=>b.textContent.includes('Apply Now'))",
      );
      await until(
        () => evaluate("!!document.querySelector('[role=dialog]')"),
        "apply dialog",
      );
      assert.notEqual(
        await evaluate(
          "getComputedStyle(document.querySelector('[role=dialog]')).animationName",
        ),
        "none",
      );
      assert.equal(
        await evaluate("document.activeElement?.tagName"),
        "H2",
        "Dialog focuses its heading without opening the keyboard",
      );
      await command("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      await command("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      assert.equal(
        await evaluate("document.activeElement?.getAttribute('aria-label')"),
        "Full name",
        "Tab enters the form",
      );
      await click("document.querySelector('[role=dialog] [role=combobox]')");
      await until(
        () => evaluate("!!document.querySelector('[role=option]')"),
        "country select",
      );
      await click(
        "[...document.querySelectorAll('[role=option]')].find(e=>e.textContent==='Canada')",
      );
      await until(
        () =>
          evaluate(
            "document.querySelector('[role=dialog] [role=combobox]')?.textContent.includes('Canada')",
          ),
        "selected country",
      );
      await until(
        () => evaluate("!document.querySelector('[role=listbox]')"),
        "select exit transition",
      );
      await screenshot("apply-dialog");
      await escape();
      await until(
        () => evaluate("!document.querySelector('[role=dialog]')"),
        "dialog closes",
      );
      assert.ok(
        await evaluate(
          "document.activeElement?.textContent.includes('Apply Now')",
        ),
        "Dialog restores trigger focus",
      );
      for (let cycle = 0; cycle < 3; cycle++) {
        await click(
          "[...document.querySelectorAll('header button')].find(b=>b.textContent.includes('Apply Now'))",
        );
        await until(
          () => evaluate("!!document.querySelector('[role=dialog]')"),
          "repeat open",
        );
        await escape();
        await until(
          () => evaluate("!document.querySelector('[role=dialog]')"),
          "repeat close",
        );
      }
      assert.equal(
        await evaluate("getComputedStyle(document.body).pointerEvents"),
        "auto",
        "No stranded modal interaction lock",
      );
      await click(
        "[...document.querySelectorAll('#process button')].find(b=>b.textContent.includes('Fly'))",
      );
      assert.ok(
        await evaluate(
          "document.querySelector('#process [aria-live]')?.textContent.includes('Prepare for departure')",
        ),
      );
      await screenshot("journey-globe");
      console.log(
        "PASS desktop dropdown, Escape/focus return, dialog animation, nested select, interactive journey",
      );

      await command("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await navigate(
        "/",
        "!!document.querySelector('nav[aria-label=\"Mobile navigation\"]')",
      );
      assert.ok(
        await evaluate(
          "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
        ),
        "Mobile horizontal overflow",
      );
      await screenshot("home-mobile");
      await click(
        "document.querySelector('nav[aria-label=\"Mobile navigation\"] button[aria-haspopup=menu]')",
      );
      await until(
        () => evaluate("!!document.querySelector('[role=menu]')"),
        "mobile destinations",
      );
      await escape();
      await command("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await click(
        "[...document.querySelectorAll('header button')].find(b=>b.textContent.includes('Apply Now'))",
      );
      await until(
        () => evaluate("!!document.querySelector('[role=dialog]')"),
        "reduced-motion dialog",
      );
      assert.equal(
        await evaluate(
          "getComputedStyle(document.querySelector('[role=dialog]')).animationName",
        ),
        "none",
      );
      await escape();
      console.log(
        "PASS mobile width, mobile destinations, and reduced-motion overlay",
      );

      await command("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await command("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-reduced-motion", value: "no-preference" },
          { name: "prefers-color-scheme", value: "light" },
        ],
      });
      await navigate(
        "/admin/login",
        "!!document.querySelector('.gap-admin-brand')",
      );
      assert.ok(
        await evaluate(
          "document.documentElement.classList.contains('gap-admin')",
        ),
      );
      assert.ok(
        await evaluate(
          "getComputedStyle(document.body).fontFamily.includes('Manrope')",
        ),
        "Admin Manrope font",
      );
      assert.equal(
        await evaluate("document.documentElement.dataset.theme"),
        "dark",
      );
      assert.equal(
        await evaluate(
          "getComputedStyle(document.documentElement).backgroundColor",
        ),
        "rgb(20, 33, 27)",
      );
      await screenshot("admin-login");
      await command("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      assert.ok(
        await evaluate(
          "document.documentElement.scrollWidth <= window.innerWidth",
        ),
        "Admin mobile overflow",
      );
      await screenshot("admin-login-mobile");
      console.log(
        "PASS GAP Admin login branding, typography, palette and mobile width",
      );
      assert.deepEqual(errors, [], "Browser runtime errors");
      console.log(`Screenshots: ${output}`);
    }
  }
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      await command("Browser.close");
    } catch {}
    socket.close();
  }
  if (browser.exitCode === null) browser.kill();
  if (server?.exitCode === null) server.kill();
}
