import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { getPayload } from "payload";
import sharp from "sharp";
import catalog from "../lib/website-content-defaults.json";
import { sectionReader, contentKey } from "../lib/website-content";
import type { WebsiteContent } from "../payload-types";

// All writes use a disposable schema, never the site's records. No email is sent.
const schema = `gap_cms_qa_${randomUUID().replaceAll("-", "")}`;
process.env.DATABASE_SCHEMA = schema;
process.env.PAYLOAD_PUSH_SCHEMA = "true";
process.env.SMTP_HOST = "";
const { default: config } = await import("../payload/payload.config");
const payload = await getPayload({ config });
const context = { disableRevalidate: true };
const uploadIds: { collection: "media" | "documents"; id: number }[] = [];
try {
  const admin = await payload.create({
    collection: "users",
    data: {
      email: "admin@example.invalid",
      password: randomUUID(),
      role: "admin",
    },
    context,
  });
  const user = { ...admin, collection: "users" as const };
  const editor = await payload.create({
    collection: "users",
    user,
    overrideAccess: false,
    data: {
      email: "editor@example.invalid",
      password: randomUUID(),
      role: "editor",
    },
    context,
  });
  const editorUser = { ...editor, collection: "users" as const };
  const staff = { user: editorUser, overrideAccess: false, context };
  for (const collection of [
    "users",
    "leads",
    "applications",
    "documents",
  ] as const) {
    await assert.rejects(payload.find({ collection, overrideAccess: false }));
  }
  await payload.update({
    collection: "users",
    id: editor.id,
    data: { role: "admin" },
    ...staff,
  });
  assert.equal(
    (await payload.findByID({ collection: "users", id: editor.id })).role,
    "editor",
  );
  console.log("PASS admin/editor permissions and private collection access");

  for (const section of catalog) {
    const created = await payload.create({
      collection: "website-content",
      data: { key: section.key as WebsiteContent["key"] },
      ...staff,
    });
    assert.equal(
      created.entries?.length,
      section.entries.length,
      section.title,
    );
    assert.equal(
      new Set(created.entries?.map((e) => e.key)).size,
      section.entries.length,
      "Unique content keys",
    );
    if (section.key === "home-hero") {
      const entries = created.entries!.map((entry, i) =>
        i === 0 ? { ...entry, value: "CMS edited headline" } : entry,
      );
      const saved = await payload.update({
        collection: "website-content",
        id: created.id,
        data: { enabled: false, sortOrder: 99, entries },
        ...staff,
      });
      const read = await payload.findByID({
        collection: "website-content",
        id: saved.id,
        overrideAccess: false,
      });
      assert.equal(
        sectionReader(read)(section.entries[0].value),
        "CMS edited headline",
      );
      assert.equal(read.enabled, false);
      assert.equal(read.sortOrder, 99);
      const cleared = await payload.update({
        collection: "website-content",
        id: created.id,
        data: {
          entries: entries.map((e, i) => (i === 0 ? { ...e, value: "" } : e)),
        },
        ...staff,
      });
      assert.equal(sectionReader(cleared)(section.entries[0].value), "");
      await assert.rejects(
        payload.update({
          collection: "website-content",
          id: created.id,
          data: { enabled: true },
          overrideAccess: false,
        }),
      );
    }
    if (section.key === "header") {
      await assert.rejects(
        payload.update({
          collection: "website-content",
          id: created.id,
          data: {
            entries: created.entries!.map((e) =>
              e.kind === "image" ? { ...e, value: "javascript:alert(1)" } : e,
            ),
          },
          ...staff,
        }),
      );
    }
  }
  assert.equal(
    sectionReader({
      key: "test",
      entries: [{ key: contentKey("Hello "), value: "Welcome" }],
    })("Hello "),
    "Welcome ",
  );
  console.log(
    `PASS ${catalog.length} content sections, editing, clearing, visibility, ordering and URL validation`,
  );

  const country = await payload.create({
    collection: "countries",
    data: {
      name: "QA Destination",
      slug: "",
      introduction: "Editable introduction",
      highlights: [{ text: "Editable highlight" }],
      gallery: [
        { imageUrl: "/images/gap-logo.webp", caption: "Editable caption" },
      ],
      steps: [{ title: "First step", text: "Editable route" }],
    },
    ...staff,
  });
  assert.equal(country.slug, "qa-destination");
  const university = await payload.create({
    collection: "universities",
    data: {
      name: "QA University",
      slug: "",
      country: country.id,
      description: "Editable profile",
      status: "draft",
    },
    ...staff,
  });
  assert.equal(
    (await payload.find({ collection: "universities", overrideAccess: false }))
      .totalDocs,
    0,
  );
  await payload.update({
    collection: "universities",
    id: university.id,
    data: { status: "published", featured: true },
    ...staff,
  });
  assert.equal(
    (await payload.find({ collection: "universities", overrideAccess: false }))
      .totalDocs,
    1,
  );
  const news = await payload.create({
    collection: "news",
    data: {
      title: "QA Article",
      slug: "",
      publishedDate: new Date().toISOString(),
      shortBlurb: "Editable summary",
      status: "draft",
      content: {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              version: 1,
              direction: "ltr",
              children: [
                {
                  type: "text",
                  text: "Rich CMS article",
                  format: 1,
                  detail: 0,
                  mode: "normal",
                  style: "",
                  version: 1,
                },
              ],
            },
          ],
        },
      },
    },
    ...staff,
  });
  assert.equal(
    (await payload.find({ collection: "news", overrideAccess: false }))
      .totalDocs,
    0,
  );
  await payload.update({
    collection: "news",
    id: news.id,
    data: {
      status: "published",
      publishedDate: new Date(Date.now() + 86400000).toISOString(),
    },
    ...staff,
  });
  assert.equal(
    (await payload.find({ collection: "news", overrideAccess: false }))
      .totalDocs,
    0,
  );
  await payload.update({
    collection: "news",
    id: news.id,
    data: { publishedDate: new Date(Date.now() - 60000).toISOString() },
    ...staff,
  });
  assert.equal(
    (await payload.find({ collection: "news", overrideAccess: false }))
      .totalDocs,
    1,
  );
  const linked = await payload.update({
    collection: "countries",
    id: country.id,
    data: { relatedNews: [news.id], relatedUniversities: [university.id] },
    ...staff,
  });
  assert.equal(linked.relatedNews?.length, 1);
  const service = await payload.create({
    collection: "services",
    data: {
      title: "QA Service",
      shortDescription: "Summary",
      introduction: "Detailed service",
      points: [{ text: "Checklist item" }],
      imageUrl: "/images/gap-logo.webp",
    },
    ...staff,
  });
  assert.equal(service.points?.[0].text, "Checklist item");
  const review = await payload.create({
    collection: "testimonials",
    data: {
      studentName: "QA Student",
      quote: "Editable review",
      university: university.id,
      country: country.id,
      published: false,
    },
    ...staff,
  });
  assert.equal(
    (await payload.find({ collection: "testimonials", overrideAccess: false }))
      .totalDocs,
    0,
  );
  await payload.update({
    collection: "testimonials",
    id: review.id,
    data: { published: true },
    ...staff,
  });
  assert.equal(
    (await payload.find({ collection: "testimonials", overrideAccess: false }))
      .totalDocs,
    1,
  );
  console.log(
    "PASS country fields, relationships, services, draft/published universities, scheduled articles and testimonials",
  );

  const settings = await payload.create({
    collection: "site-settings",
    data: {
      siteName: "QA Website",
      socialLinks: [
        { platform: "youtube", url: "https://example.com/channel" },
      ],
    },
    ...staff,
  });
  await assert.rejects(
    payload.create({
      collection: "site-settings",
      data: { siteName: "Duplicate" },
      ...staff,
    }),
  );
  await payload.update({
    collection: "site-settings",
    id: settings.id,
    data: { maintenanceMode: true },
    ...staff,
  });
  assert.equal(
    (await payload.findByID({ collection: "site-settings", id: settings.id }))
      .maintenanceMode,
    false,
  );
  console.log(
    "PASS singleton settings, social links and admin-only maintenance control",
  );

  const lead = await payload.create({
    collection: "leads",
    data: { name: "QA Lead", email: "lead@example.invalid", status: "new" },
    ...staff,
  });
  assert.equal(lead.status, "new");
  const application = await payload.create({
    collection: "applications",
    data: {
      reference: "",
      status: "submitted",
      studentName: "QA Student",
      email: "student@example.invalid",
      country: country.id,
      university: university.id,
      studyLevel: "Undergraduate",
    },
    ...staff,
  });
  assert.match(application.reference, /^GAP-/);
  const progressed = await payload.update({
    collection: "applications",
    id: application.id,
    data: { status: "profile-review" },
    ...staff,
  });
  assert.equal(progressed.statusHistory?.length, 2);
  await assert.rejects(
    payload.delete({ collection: "leads", id: lead.id, ...staff }),
  );
  const png = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  const document = await payload.create({
    collection: "documents",
    data: {
      application: application.id,
      documentType: "other",
      uploadedBy: editor.id,
    },
    file: {
      data: png,
      name: `cms-qa-${randomUUID()}.png`,
      mimetype: "image/png",
      size: png.length,
    },
    ...staff,
  });
  uploadIds.push({ collection: "documents", id: document.id });
  await assert.rejects(
    payload.findByID({
      collection: "documents",
      id: document.id,
      overrideAccess: false,
    }),
  );
  const media = await payload.create({
    collection: "media",
    data: { alt: "QA image" },
    file: {
      data: png,
      name: `cms-qa-${randomUUID()}.png`,
      mimetype: "image/png",
      size: png.length,
    },
    ...staff,
  });
  uploadIds.push({ collection: "media", id: media.id });
  assert.ok(
    (
      await payload.findByID({
        collection: "media",
        id: media.id,
        overrideAccess: false,
      })
    ).url,
  );
  const section = (
    await payload.find({
      collection: "website-content",
      where: { key: { equals: "home-about" } },
    })
  ).docs[0];
  const imageEntry = section.entries!.find((e) => e.kind === "image")!;
  await payload.update({
    collection: "website-content",
    id: section.id,
    data: {
      entries: section.entries!.map((e) =>
        e.key === imageEntry.key ? { ...e, image: media.id } : e,
      ),
    },
    ...staff,
  });
  const populated = await payload.findByID({
    collection: "website-content",
    id: section.id,
    depth: 1,
    overrideAccess: false,
  });
  assert.equal(
    typeof populated.entries?.find((e) => e.key === imageEntry.key)?.image,
    "object",
  );
  console.log(
    "PASS CRM create/update, application history, private documents, public media and content image relationships",
  );
  console.log("PASS all 12 CMS collections");
} finally {
  for (const record of uploadIds.reverse())
    await payload.delete({ ...record, overrideAccess: true, context });
  await payload.destroy();
  assert.match(schema, /^gap_cms_qa_[a-f0-9]{32}$/);
  const { Client } = createRequire(import.meta.url)("pg");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`DROP SCHEMA "${schema}" CASCADE`);
  } finally {
    await client.end();
  }
  console.log("Removed the disposable QA schema and uploaded fixtures.");
}
