# Utkarsh Giri — Portfolio

Dark, minimal personal portfolio for a cosmologist. Built for GitHub Pages.

## Deploy to GitHub Pages

1. Create a repo named **`utkarshgiri.github.io`**
2. Upload all files from this folder into the repo root
3. Go to **Settings → Pages → Source: Deploy from branch → main / root**
4. Your site will be live at `https://utkarshgiri.github.io` within minutes

## Structure

```
├── index.html          ← Home: hero, experience, education, software, projects
├── projects.html       ← Side projects with .ipynb / .py upload
├── notebook.html       ← Full notebook viewer (syntax highlighting, outputs)
├── publications.html   ← Static publication list
├── blog.html           ← Blog with Markdown support
├── contact.html        ← Contact info + form
├── assets/photo.jpg    ← Profile photo
├── css/style.css
├── js/
│   ├── shared.js       ← Helpers, localStorage, edit mode logic
│   └── projects.js     ← Project upload, filter, modal
└── README.md
```

## Edit mode

The upload forms and delete buttons are hidden from visitors by default. To access them, append `?edit=true` to any page URL:

- **Add a project:** `https://utkarshgiri.github.io/projects.html?edit=true`
  — Shows the "Add a project" panel with title, category, description, file upload, etc.
  — Delete buttons appear on each project card.

- **Write a blog post:** `https://utkarshgiri.github.io/blog.html?edit=true`
  — Shows the "Write a post" panel with Markdown support.
  — Delete buttons appear on each post.

- **Normal visitor view:** `https://utkarshgiri.github.io/projects.html`
  — No forms, no delete buttons. Clean read-only portfolio.

**Note:** Data is stored in your browser's localStorage. This means:
- Only you (in your browser) can see the projects/posts you add via the forms.
- Visitors won't see your content until you publish it (see below).
- Nobody can modify your content even if they find the `?edit=true` parameter.

## Publishing your projects and posts

When you add projects or blog posts via the edit mode forms, they live in your browser's localStorage — invisible to visitors. To make them visible on the live site, you **export** them to a `data.json` file and commit it to your repo. Here's the full workflow:

### Step 1: Add your content in edit mode

Open your site with `?edit=true`, add projects (with notebooks) and blog posts using the forms. Preview everything locally until you're happy.

### Step 2: Export to data.json

Open your browser console (`Cmd+Option+J` on Mac, `Ctrl+Shift+J` on Windows) and run one of these commands:

```js
// Option A: lightweight export (strips notebook file content to keep the file small)
exportData()

// Option B: full export (includes notebook content so visitors can read your code)
exportDataFull()
```

This downloads a `data.json` file to your computer.

- **Use `exportData()`** if your notebooks are large and you'd rather link to them on GitHub. Project cards will still show, but the "View notebook" link won't render the code inline.
- **Use `exportDataFull()`** if you want visitors to read your notebook cells directly on the site. The file will be larger but the experience is better.

### Step 3: Commit data.json to your repo

Move the downloaded `data.json` into your repo root (next to `index.html`) and push:

```bash
cp ~/Downloads/data.json /path/to/utkarshgiri.github.io/
cd /path/to/utkarshgiri.github.io
git add data.json
git commit -m "publish projects and posts"
git push
```

Your projects and blog posts are now live for all visitors.

### Updating content

Repeat the same cycle: edit in `?edit=true` mode → export → commit. Each export overwrites the previous `data.json` with your full current set of projects and posts.

## Personalise

- **"Download CV" link** → host your CV as `cv.pdf` in the repo root and update the `href` in `index.html`
- **Publication links** → update the `href` values on `publications.html` with real arXiv / DOI URLs
- **Email** → search for `ugiri@caltech.edu` and update if needed

## Contact form (Formspree — free)

1. Sign up at https://formspree.io
2. Create a form, copy the endpoint URL
3. In `contact.html`, change:
   ```html
   <form class="form-body" id="contact-form" ...>
   ```
   to:
   ```html
   <form class="form-body" action="https://formspree.io/f/YOUR_ID" method="POST" ...>
   ```
   Then remove the JS submit handler at the bottom.

## Notebook viewer

On the Projects page (in edit mode), upload a `.ipynb` or `.py` file with your project. Clicking the project card opens `notebook.html`, which renders:

- Markdown cells as formatted HTML (headings, lists, bold, tables, etc.)
- Code cells with Python syntax highlighting (highlight.js)
- Outputs: text, images (base64 PNG/JPEG), HTML tables (pandas DataFrames), SVG
- Auto-generated table of contents from markdown headings

For `.py` files, the full script is syntax-highlighted.

## Fonts

- **Bricolage Grotesque** — headings & UI (Google Fonts CDN)
- **Source Serif 4** — body serif, blog posts
- **JetBrains Mono** — code, labels, metadata
