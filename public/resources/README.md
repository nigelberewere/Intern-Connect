# Resources Folder — InternConnect

This folder is the canonical place to store downloadable and on-site educational resources for students and companies. It includes guidance on what to store, suggested subfolders, and recommended naming conventions and metadata so resources are easy to manage and consume.

---

## Suggested folder structure

- `public/resources/guides/` — PDF guides, how-tos, checklists (resume guides, interview prep)
- `public/resources/templates/` — editable templates (.docx, .pptx, .xlsx) for resumes, cover letters, project plans
- `public/resources/slides/` — presentation decks (.pdf, .pptx) from webinars or events
- `public/resources/videos/` — recorded webinars or short explainer videos (mp4/webm)
- `public/resources/images/` — images used inside resource pages or thumbnails
- `public/resources/code-samples/` — zipped example projects or single-file samples with readme
- `public/resources/datasets/` — CSV/JSON datasets used for examples or workshops
- `public/resources/links/` — curated link lists (JSON or MD)
- `public/resources/meta/` — metadata files (index.json) describing resources

You can create an `index.json` in `public/resources/meta/` that lists all resources with titles, descriptions, filename, type, tags, and permissions.

---

## Resource types (what to put)

- Guides: step-by-step PDFs (e.g., "Resume Guide", "How to Apply for Internships")
- Templates: Resume templates, cover letters, email templates, project templates
- Slides & decks: Event or workshop slide decks, exported as PDF for easy viewing
- Videos: Short explainers, recorded webinars, interview tips (keep files optimized)
- Images/Thumbnails: Small preview images, logos, and diagrams used in guides
- Code Samples: Minimal demos, starter projects, or snippets with a short README
- Datasets: Small CSV/JSON files used in tutorials or example projects
- Curated Links: JSON or Markdown lists of external resources (articles, official docs)
- Case Studies & Testimonials: PDF/PPT case studies showing success stories

---

## Naming conventions (recommended)

Use predictable, lowercase, hyphen-separated filenames, include resource-type prefix, ISO date, slug, and optional version.

Pattern:

    <type>-<slug>-<YYYYMMDD>-v<MAJOR>.<MINOR>.<PATCH>.<ext>

Where:
- `<type>`: short type prefix (see list below)
- `<slug>`: short human-readable identifier (hyphen-separated)
- `<YYYYMMDD>`: optional publication or upload date (ISO style)
- `vX.Y.Z`: optional semantic version
- `<ext>`: file extension (`pdf`, `docx`, `pptx`, `mp4`, `zip`, `csv`, `json`)

Type prefixes (recommendations):
- `guide` — guides and how-tos (PDF)
- `template` — templates (docx/pptx)
- `slides` — slide decks (pdf/pptx)
- `video` — recordings (mp4/webm)
- `img` — images (jpg/png/webp)
- `sample` — code samples or zips
- `data` — datasets (csv/json)
- `links` — curated links list (json/md)
- `case` — case studies or testimonials

Examples:
- `guide-resume-writing-20251115-v1.pdf`
- `template-resume-20251115-v2.docx`
- `slides-interview-workshop-20251101.pdf`
- `video-webinar-how-to-apply-20251030.mp4`
- `sample-js-auth-boilerplate-v1.zip`
- `data-job-listings-20251001.csv`
- `img-resume-thumbnail-480w.jpg`

Rules:
- All filenames lowercase, use hyphens, no spaces.
- Avoid special characters other than `-` and `_` if needed.
- Keep slugs concise and descriptive.
- Include date when relevant to surface freshness.
- Use semantic versioning for iterative updates.

---

## Metadata (optional but recommended)

Keep a `meta/index.json` file to list and describe resources for rendering on the site. Example entry:

```json
{
  "resources": [
    {
      "id": "guide-resume-writing-20251115-v1",
      "title": "Resume Writing Guide",
      "description": "A practical guide to writing an internship-ready resume.",
      "type": "guide",
      "filename": "guides/guide-resume-writing-20251115-v1.pdf",
      "tags": ["resume","students","application"],
      "date": "2025-11-15",
      "author": "InternConnect",
      "license": "CC-BY-4.0",
      "visibility": "public"
    }
  ]
}
```

Your frontend can fetch `public/resources/meta/index.json` to dynamically render the resources page with titles, descriptions, thumbnails, and download links.

---

## Practical tips

- Keep videos compressed (720p) to limit bandwidth.
- Use thumbnails (`public/resources/images/`) for each resource to improve discoverability.
- Prefer PDF for guides/slides to ensure consistent rendering across browsers/devices.
- For code samples, include a small `README.md` inside the zip explaining how to run the sample.
- If resources are large or numerous, consider hosting on a CDN or external storage (Firebase Storage / S3) and keep only metadata and thumbnails in the repo.

---

If you want, I can:

- Create an initial `meta/index.json` with a couple of example entries.
- Add a simple UI on `resources.html` that reads `meta/index.json` and renders the list.

Which of these would you like next?