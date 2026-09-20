// Pure HTML for the emails. No imports, so it can be previewed without running the site.

const COLORS = {
  page: "#0f1814", // page background
  card: "#15201b", // card background
  border: "#253530",
  text: "#ecf1ee",
  muted: "#9fb0a7",
  mint: "#a9d6bb", // brand accent
  mintDark: "#0f1814", // text on mint buttons
};

// Georgia is the closest widely-available serif to the site's heading font
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Everything a visitor typed is escaped before it goes into an email. */
export const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/** [label, value, optional link] */
export type Row = [label: string, value: unknown, href?: string];

export const filled = (rows: Row[]) =>
  rows.filter(
    ([, v]) => v !== undefined && v !== null && String(v).trim() !== "",
  );

export function renderEmail(opts: {
  siteUrl: string;
  logoUrl: string;
  title: string;
  intro: string;
  rows: Row[];
  preheader?: string;
  highlight?: { label: string; value: string };
  action?: { label: string; href: string };
}) {
  const { siteUrl, logoUrl, title, intro, rows, preheader, highlight, action } =
    opts;

  const detail = filled(rows)
    .map(([label, value, href]) => {
      const text = esc(value);
      const cell = href
        ? `<a href="${esc(href)}" style="color:${COLORS.mint};text-decoration:none">${text}</a>`
        : text;
      return `<tr>
<td style="padding:10px 16px 10px 0;border-top:1px solid ${COLORS.border};font:600 11px/1.4 ${SANS};letter-spacing:1.4px;text-transform:uppercase;color:${COLORS.muted};vertical-align:top;white-space:nowrap">${esc(label)}</td>
<td style="padding:10px 0;border-top:1px solid ${COLORS.border};font:15px/1.5 ${SANS};color:${COLORS.text};white-space:pre-wrap">${cell}</td>
</tr>`;
    })
    .join("");

  const highlightBlock = highlight
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr><td style="border:1px solid ${COLORS.mint};border-radius:12px;padding:16px 20px" bgcolor="#1a2a22">
<div style="font:600 11px/1.4 ${SANS};letter-spacing:1.4px;text-transform:uppercase;color:${COLORS.muted}">${esc(highlight.label)}</div>
<div style="margin-top:6px;font:26px/1.2 ${SERIF};color:${COLORS.mint};letter-spacing:0.5px">${esc(highlight.value)}</div>
</td></tr></table>`
    : "";

  const button = action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0"><tr><td bgcolor="${COLORS.mint}" style="border-radius:999px">
<a href="${esc(action.href)}" style="display:inline-block;padding:13px 26px;font:700 15px/1 ${SANS};color:${COLORS.mintDark};text-decoration:none;border-radius:999px">${esc(action.label)}</a>
</td></tr></table>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.page}" bgcolor="${COLORS.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORS.page}">${esc(preheader ?? intro)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${COLORS.page}" style="background:${COLORS.page}">
<tr><td align="center" style="padding:32px 16px">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 4px 20px">
<a href="${esc(siteUrl)}" style="text-decoration:none"><img src="${esc(logoUrl)}" alt="Global Admission Platform" height="48" style="display:block;height:48px;width:auto;border:0;font:700 18px/1 ${SERIF};color:${COLORS.mint}"></a>
</td></tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:20px" bgcolor="${COLORS.card}">
<tr><td style="padding:36px 32px 32px">
<div style="font:700 11px/1.4 ${SANS};letter-spacing:2px;text-transform:uppercase;color:${COLORS.mint}">Global Admission Platform</div>
<h1 style="margin:12px 0 0;font:400 32px/1.1 ${SERIF};letter-spacing:-0.5px;color:${COLORS.text}">${esc(title)}</h1>
<p style="margin:16px 0 24px;font:16px/1.6 ${SANS};color:${COLORS.muted}">${esc(intro)}</p>
${highlightBlock}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${detail}</table>
${button}
</td></tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td align="center" style="padding:20px 16px 0;font:12px/1.6 ${SANS};color:${COLORS.muted}">
Global education guidance, from first conversation to final departure.<br>
<a href="${esc(siteUrl)}" style="color:${COLORS.mint};text-decoration:none">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a>
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>`;
}

export const renderPlain = (intro: string, rows: Row[], link?: string) =>
  [
    intro,
    "",
    ...filled(rows).map(([l, v]) => `${l}: ${v}`),
    ...(link ? ["", link] : []),
  ].join("\n");
