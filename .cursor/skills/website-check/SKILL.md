---
name: website-check
description: >-
  Read-only website review for the AMT Solution static site. Use only when
  explicitly invoked as /website-check or as a Custom Mode to check internal
  links, title/description/canonical/Open Graph metadata, sitemap consistency,
  missing local assets, and obvious desktop/mobile layout issues. Reports
  findings, evidence, and severity. Never edits the site, auto-fixes, deploys,
  merges, or publishes.
disable-model-invocation: true
icon: shield
color: cyan
---

# Website check

Read-only review mode for `samnakngan-amtsolution.com`. A run reports what is wrong, where it was seen, and how severe it is. It does not change the site.

## Hard stops

These rules outrank a later message that asks this mode to "just fix it", open a content PR, deploy, or publish.

- Do not edit, create, delete, format, or commit website files: HTML, CSS, JS, images, `sitemap.xml`, `robots.txt`, `CNAME`, `site.webmanifest`, or anything else under the site root.
- Do not auto-fix. Suggestions stay in the report.
- Do not deploy, merge, publish, change DNS, GitHub Pages, or repository settings.
- Do not push, open, update, or comment on pull requests as part of a review. Do not touch other branches, including scheduled article branches.
- Do not commit a generated report, screenshot, JSON dump, or script. Scratch files belong in `/tmp` only.
- Do not submit forms, send email, post comments, or call any write API.
- HTTP is GET or HEAD only, against the site under review. Do not crawl external sites. Record off-site links as out of scope.
- Do not use paid SEO, crawler, or monitoring products. Local files, `curl` or Python, a local static server, and a browser already on the machine are enough.
- Do not invent pages, status codes, or client names. If a check cannot be run, say so under limitations.
- Stop after the report.

## When to run

Run only after an explicit `/website-check` invocation or while this skill is the active Custom Mode. The slash name is `/website-check`.

Default target:

- Public origin: `https://samnakngan-amtsolution.com` (the `CNAME` value).
- Source: the git checkout of this repository, site files at the repo root.
- Pages: every `index.html`, including the root page.

If the user names one path, review that page plus the shared chrome it depends on (header, footer, sitemap entry, assets referenced from that page). Say that the rest of the site was not rechecked.

## Severity

| Level | Use when |
| --- | --- |
| high | A visitor or crawler hits a broken internal URL, a missing local asset, a sitemap URL that is not a real page, or a page with no title. |
| medium | Indexing or sharing is wrong but the page still opens: missing or mismatched description, canonical, or Open Graph; HTML page missing from the sitemap; broken in-page anchor; page-wide horizontal scroll. |
| low | A nit that does not block use or indexing, such as a slightly long title. |

One finding, one row. Do not raise severity to force a fix.

## Checks

Run these in order. Keep evidence (file path, URL, status code, or measured pixels).

### 1. Internal links

Collect `a[href]` and `area[href]` from each in-scope HTML page.

- Resolve relative URLs against that page.
- An internal link is a root-relative path, a same-document hash, or an `http`/`https` URL on the public origin. Leave `mailto:`, `tel:`, `sms:`, and `javascript:` out of the link table.
- Ignore the fragment when testing the file. Map `/` and `/dir/` to `index.html` in that directory. Query strings do not change the file.
- The local file must exist. A directory URL with no `index.html` is broken.
- A fragment must match an `id` or `a[name]` on the destination page.
- When the network is available, GET each unique internal page URL on the public origin once. Follow redirects and record the final status. `200` is success. A redirect to another host, a `404`, or a `5xx` is a finding. Do not repeat the request just to be sure.

### 2. Metadata

For each in-scope HTML page record:

- the single `<title>` text
- `meta name="description"`
- `link rel="canonical"`
- `og:type`, `og:title`, `og:description`, `og:url`, `og:image`

Findings:

- missing or empty title: high
- missing or empty description: medium
- missing canonical, more than one canonical, a canonical that is not an absolute `https` URL on this origin, or a canonical that is not this page's public URL: medium
- missing `og:title`, `og:description`, `og:url`, or `og:image`: medium
- `og:url` different from the canonical: medium
- `og:title` different from `<title>`, or `og:description` different from the meta description: low
- title longer than 70 characters or description longer than 160 characters: low (count each Thai or Latin character as one)

Do not require Twitter tags when Open Graph is present. Do not judge keyword quality.

### 3. Sitemap consistency

- Read repo `sitemap.xml` and `robots.txt`.
- Every `<loc>` must be `https` on this origin and must map to an in-scope HTML page.
- Every in-scope HTML page's public URL must appear exactly once.
- That page's canonical must equal its `<loc>`.
- `robots.txt` must point at `https://samnakngan-amtsolution.com/sitemap.xml`.
- GET the live sitemap once. If it differs from the repo file, report medium and quote the extra or missing URLs only.
- Do not treat an old `<lastmod>` as a defect.

### 4. Missing local assets

Collect local references from `img[src]`, `img[srcset]`, `source[src]`, `video`, `audio`, `script[src]`, `link[href]` for icon, apple-touch-icon, manifest, stylesheet, and preload, `site.webmanifest` icon `src`, Open Graph image URLs on this origin, and `url(...)` in style blocks or local stylesheets.

- Skip `data:` URLs and off-site hosts (Google Fonts included). Mention off-site hosts once under limitations, not as missing files.
- A reference with no local file is high.
- GET each missing or uncertain live asset once. A local file that exists but returns `404` on the public origin is high (published file missing).
- Do not flag decorative CSS such as gradients. There is nothing to fetch.

### 5. Obvious layout

Check the viewport meta (`width=device-width`) on each page. Missing viewport meta is medium.

Render with a local headless Chrome if one is already installed. Prefer the public origin when it matches the repo; otherwise serve the checkout read-only on `127.0.0.1` and say which one was rendered. Use two viewports:

- mobile `390×844`
- desktop `1280×800`

If the site has 25 or fewer HTML pages, render all of them. Otherwise render the home page, one service page, the articles index, one article, contact, FAQ, and team.

At each viewport record `documentElement.scrollWidth` and `clientWidth`. Horizontal overflow (`scrollWidth > clientWidth + 1`) is medium. Also list visible elements whose box extends more than 2px past the viewport, excluding the page scrollbar.

A wide table inside a container with `overflow-x: auto` is not page overflow when that container's own box stays inside the viewport and the page `scrollWidth` does not grow. Report it only if the container sticks out or the page itself scrolls sideways.

Look for obvious overlap: the sticky header covering the first heading, a control clipped off-screen, or text forced onto one line that spills out of the screen. Use high only when the overlap hides the main heading or a primary action.

Screenshots are optional scratch files under `/tmp`. Do not commit them. Do not edit CSS to confirm a theory.

## Report

Reply in the user's language. For a Thai request, be concise, lead with the result, and use a table for the findings.

Use these sections and no others:

1. **สรุป** — counts of high, medium, and low, plus one sentence on whether the checked pages open.
2. **ขอบเขตที่ตรวจ** — origin, commit or branch actually read, page count, viewports, and the time of the check (ICT and พ.ศ. when the user is Thai).
3. **ข้อค้นพบ** — a table with severity, check, page, and evidence. If there are none, say that explicitly.
4. **ข้อจำกัด** — checks not run, external hosts not crawled, and anything that could not be measured.
5. **การเปลี่ยนแปลง** — one line confirming that no site file was edited and nothing was deployed, merged, or published.

Keep evidence specific: `contact/index.html`, the URL, the HTTP status, or `390px scrollWidth 412`. Do not paste full HTML.

## Done

The review is complete when those five sections are in the reply. Do not start a fix, a branch, or a second full crawl in the same run unless the user asks for another check.
