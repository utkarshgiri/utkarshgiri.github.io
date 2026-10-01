# Utkarsh Giri — portfolio & project journal

A minimal academic website for a postdoctoral cosmologist, built for GitHub Pages. The design uses a compact portrait, restrained typography, and straightforward research and publication pages. The site is static, fast, and self-contained. All styling, scripts, the portrait, and the Markdown parser are included locally. There are no third-party font, JavaScript, analytics, or backend services to configure.

## Start here

1. Unzip the package. Open **index.html** to browse the finished website. Open **editor.html** for the writing desk. A local HTTP preview is also available below.
2. Copy the contents of this folder into your existing `utkarshgiri.github.io` repository. Include the `.github` folder; it contains the publishing workflow. Keep your existing `.git` folder and any custom `CNAME` file.
3. Commit and push to `main`.
4. In your repository, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**. If the first workflow ran before you selected this setting, open **Actions → Build and publish website → Run workflow**.
5. After the workflow succeeds, visit **https://utkarshgiri.github.io/**.

The workflow builds and deploys after each push to `main`. It does not require a personal access token or a paid service. If your default branch has another name, change `branches: [main]` in `.github/workflows/deploy.yml`.

GitHub's instructions: [Custom workflows for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Using Git on your computer

Run these commands **inside your existing repository**, after copying in the new files:

```sh
git add .
git commit -m "Redesign portfolio and add project journal"
git push
```

The zip contains the contents to copy into your repository root. Do not put the whole `utkarshgiri.github.io` folder inside another folder in the repository. When copying from Finder or another file manager, make sure `.github` is included.

## Write a project post

### Option A: use the writing desk

1. Open `editor.html` locally or at `https://utkarshgiri.github.io/editor.html` after deployment.
2. Enter the title, description, date, category, and article. The preview updates as you write. **Load example** demonstrates code blocks and tables; the example is marked as a draft.
3. Optionally attach the filename of an `.ipynb` notebook or `.py` script, and add code/demo URLs.
4. Uncheck **Keep unpublished (draft)** when your article is ready.
5. Click **Download post**. Save the downloaded `.md` file in `content/posts/`.
6. If you attached a notebook, copy the original notebook into `content/notebooks/`. The editor reads it locally but does not upload it to GitHub.
7. Commit and push. GitHub builds the article page, journal listing, homepage excerpt, and sitemap automatically.

You can do steps 5–7 in GitHub's web interface: open the relevant repository folder, choose **Add file → Upload files**, and commit. To edit a post later, use **Open Markdown** in the writing desk, or edit its source file directly on GitHub.

The writing desk is a local drafting tool, not an account or CMS. It cannot change the live site on its own. Browser drafts are device-local; downloaded files and commits are the durable copies. Anyone can use the public writing desk, but only someone with write access to your repository can publish to your website. The editor is omitted from navigation and marked `noindex`.

### Option B: write Markdown directly

Copy `docs/post-template.md` into `content/posts/your-project-name.md`. Its header is **JSON between `---` lines**, not YAML. Keep double quotes and valid JSON; the build reports a useful error if the metadata is invalid. Filenames must use lowercase letters, numbers, and single hyphens.

```markdown
---
{
  "title": "A descriptive project title",
  "description": "The question, method, and main takeaway in one sentence.",
  "date": "2026-09-30",
  "category": "Data Science",
  "tags": ["Python", "Statistics"],
  "draft": false
}
---

## The question

Your article begins here.
```

Optional header fields:

| Field | Value |
| --- | --- |
| `github` | Full HTTP(S) URL to the project source |
| `demo` | Full HTTP(S) URL to a demo or Colab notebook |
| `notebook` | Filename in `content/notebooks/`, e.g. `analysis.ipynb` |
| `draft` | Boolean `true` hides the post; `false` publishes it |

Posts support headings, emphasis, lists, blockquotes, tables, links, images, and fenced code blocks. Python code receives syntax highlighting. Published articles have reading time, an on-page contents list, code-copy buttons, and a reading-progress bar. Text-based equations can be written as Unicode or code; this version does not include a TeX math renderer.

### Figures

Place figures in `assets/images/`. Reference them from a post with:

```markdown
![A useful description of what the figure shows](assets/images/residuals.png)
```

The builder resolves this path correctly from the nested article page. Keep all article figures under `assets/` for a consistent local preview and published result.

### Notebooks and Python scripts

The builder renders saved Markdown and code cells, text output, and PNG/JPEG output. The original file is downloadable from its article. Cells never execute on the website. HTML-only output is shown as source; interactive widgets and SVG outputs are not rendered. Most pandas outputs also include a text representation, which is displayed. Export an interactive figure to PNG for a reliable public preview.

Only files referenced by published posts are copied into the deployed notebooks directory.

### Remove or unpublish a post

Set `"draft": true` or remove its source file, then commit. The next build removes the generated article and its listing. Draft source files in a **public GitHub repository remain visible on GitHub** even though the website does not publish them.

## Edit the rest of the site

| What to change | Source file |
| --- | --- |
| Biography, email, profiles, experience, education | `content/site.json` |
| Publications and paper links | `content/publications.json` |
| Software descriptions and repository links | `content/projects.json` |
| Article text and metadata | `content/posts/*.md` |
| Portrait | `assets/images/portrait.jpg` |
| Colors, spacing, typography, mobile layouts | `assets/css/style.css` |
| Page structure and introductory headings | `scripts/build.mjs` |
| Menu, publication filters, contact form, code buttons | `assets/js/site.js` |
| Writing desk | `assets/js/editor.js` |

If you change the domain, update `url` in `content/site.json` for canonical links and the sitemap. The included configuration targets the root of `utkarshgiri.github.io`. The generated HTML at the repository root is a convenient initial preview; GitHub Actions always generates fresh deployment output from the source. After source edits, rebuild locally to update that local preview.

## Local build and preview

Use Node.js 22 or later. No `npm install` is required; the Markdown parser is vendored with its license.

```sh
npm run build
npm run check
npm run preview
```

Open `http://localhost:8080`. Stop the preview with Ctrl+C. Re-run the build and reload after source edits. For a portable preview using the generated files at the repository root:

```sh
npm run build:root
```

You can also deploy the already generated root files with GitHub Pages' **Deploy from a branch → main → / (root)** option. In that mode, run `npm run build:root` and commit the resulting HTML after every source change. Use the Actions option above for automatic publishing.

## Pages

- `index.html` — academic introduction, research, selected papers, and background
- `about.html` — biography, experience, education
- `projects.html` — project journal and all four original software entries
- `publications.html` — all 11 supplied papers, with topic filters
- `contact.html` — contact details and an email-draft form
- `editor.html` — Markdown writing desk
- `posts/<filename>.html` — automatically generated article pages
- `404.html` — custom missing-page screen
- `blog.html` and `notebook.html` — useful entry points for legacy URLs

The contact form opens a draft in the visitor's email application. It does not claim to send mail from a static website.

## Content preservation and corrections

The supplied biography, both research positions, both degrees and their thesis/advisor details, 11 publications, four software descriptions, portrait, and contact profiles are retained. The original archive contained no `data.json`, project articles, or notebook files, so there were no published posts to migrate. No completed projects or results have been invented. A starter template is included outside the published journal.

Generic arXiv and DOI homepage links have been replaced with specific paper links. The incomplete article number for *Constraining f_NL using large-scale modulation of small-scale statistics* has been corrected to **123544** using its arXiv record. *Sub-second periodicity in a fast radio burst* remains listed, with Nature's retraction status and date (23 June 2026). All other supplied bibliographic descriptions are preserved; this was not a comprehensive bibliography update.

The LinkedIn link now uses the actual profile path displayed in the original site. Software links resolve to the corresponding repositories on the public GitHub profile.

Sources for these corrections:

- [arXiv:2305.03070](https://arxiv.org/abs/2305.03070)
- [Nature: Sub-second periodicity in a fast radio burst](https://www.nature.com/articles/s41586-022-04841-8)
- [Utkarsh Giri on GitHub](https://github.com/utkarshgiri)
- [Utkarsh Giri on LinkedIn](https://www.linkedin.com/in/utkarshgiri/)

The original HTML5 UP theme, jQuery, webfont payloads, and unused stock images are replaced by the new design. Marked 17.0.5 is included under its MIT license in `assets/vendor/MARKED-LICENSE.md`.
