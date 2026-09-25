# Editing the GAP website

Open `/admin`. **Website Content** contains 25 section records, grouped by page in their titles.

- Expand a content row and edit **Website content**. The original text remains underneath as a reference. Save to update the website. Empty text intentionally clears a phrase.
- For images, paste a URL or choose an upload from **Media**. An uploaded image takes priority over the URL. Clear the upload to use the URL again.
- In each Home section, use **Show section on homepage** and **Sort order** to control visibility and order. Lower numbers appear first.
- Keep `{country}` in the country journey sentence: the site substitutes the destination name.

## Content collections

| Collection | Controls |
| --- | --- |
| Countries | Navigation/globe destinations, introduction, highlights, rich body, gallery, journey steps, selected universities/articles and SEO |
| Universities | Profiles, country, city, logos, website links, highlights, SEO and publication status; featured published universities appear as homepage partners |
| Services | Titles, icons, summaries, detailed introductions, checklists, images and ordering |
| Testimonials | Real student stories, photos, ratings, country/university relationships and publishing |
| News | Articles, rich text formatting, cover images, summaries, SEO and scheduling; only published articles whose publication time has arrived are public |
| Site Settings | Site name, default SEO, favicon, contact details, social links and maintenance mode/message |
| Media | Public website images; copy their URLs into country/service/university/article image fields |
| Leads / Applications / Documents | Enquiries, student workflow and private application documents |
| Users | Staff accounts and roles |

Header, footer and journey-diagram logos can be edited in their respective Website Content records. Navigation destinations come from Countries. The enquiry form uses that same list.

An empty selection of related universities uses the destination's published universities. Country articles use **Related news**; draft and scheduled articles stay hidden. Unpublished testimonials and universities stay hidden. There are no fictional review or partner fallbacks.

Admin and Editor roles can manage content. Only admins can delete records or change maintenance mode. Site Settings and Website Content records cannot be deleted accidentally. Saving public content invalidates the website cache; refresh the public page after saving.

## Setup and verification

Public CMS reads are cached across requests for five minutes and invalidated when their collection changes. Admin, student records, authentication and submissions are never placed in this shared cache. A refreshed browser page sees saved content; an already-open tab can retain prefetched content until refreshed.

Normal development requests no longer inspect or push the PostgreSQL schema. After changing collection fields, run `npm run cms:sync` once, then restart the development server. `cms:initialize` also syncs the development schema. You can explicitly opt into automatic development sync with `PAYLOAD_PUSH_SCHEMA=true`.

`npm run cms:initialize` adds missing section records and default service/country content without replacing existing edits. It has already been run for the configured development database.

`npm run cms:verify` exercises all collections in a disposable PostgreSQL schema and removes that schema and its uploaded fixtures afterward. It does not modify existing website records or send email.

For deployment, apply the corresponding Payload database schema changes before starting production. Media uploads use `public/uploads`; provide persistent storage for that directory (or configure a Payload storage adapter) on hosts with ephemeral filesystems. Private application files remain separate in `private-uploads`.
