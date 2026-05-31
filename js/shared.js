// shared.js

// Edit mode: append ?edit=true to any page URL to show forms and delete buttons
const isEditMode = new URLSearchParams(window.location.search).get('edit') === 'true';

// ─── Published data (loaded from data.json, visible to all visitors) ───
let _published = { projects: [], posts: [] };

// Fetch published data, then fire 'data-loaded' so pages can re-render
fetch('data.json')
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(d => {
    _published.projects = d.projects || [];
    _published.posts = d.posts || [];
    document.dispatchEvent(new Event('data-loaded'));
  })
  .catch(() => {
    // No data.json yet — that's fine, everything stays empty for visitors
    document.dispatchEvent(new Event('data-loaded'));
  });

// Hide all .edit-only elements unless in edit mode
document.addEventListener('DOMContentLoaded', () => {
  if (!isEditMode) {
    document.querySelectorAll('.edit-only').forEach(el => el.style.display = 'none');
  }
});

// ─── Data access ───
// Edit mode  → read/write localStorage (your drafts)
// Visitor    → read from data.json (published content)

function getProjects() {
  if (isEditMode) {
    try { return JSON.parse(localStorage.getItem('ug_projects') || '[]'); } catch(e) { return []; }
  }
  return _published.projects;
}
function saveProjects(a) { localStorage.setItem('ug_projects', JSON.stringify(a)); }

function getPosts() {
  if (isEditMode) {
    try { return JSON.parse(localStorage.getItem('ug_posts') || '[]'); } catch(e) { return []; }
  }
  return _published.posts;
}
function savePosts(a) { localStorage.setItem('ug_posts', JSON.stringify(a)); }

// ─── Export: download localStorage as data.json ───
// Run exportData() from the browser console, or call it from a button
function exportData() {
  const data = {
    projects: JSON.parse(localStorage.getItem('ug_projects') || '[]').map(p => {
      // Strip fileContent to keep data.json small — notebook files should be
      // committed separately or linked via GitHub URL
      const copy = Object.assign({}, p);
      if (copy.fileContent) {
        copy.hasFile = true;
        delete copy.fileContent;
      }
      return copy;
    }),
    posts: JSON.parse(localStorage.getItem('ug_posts') || '[]'),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Export with notebook content included (larger file, but notebooks render for visitors)
function exportDataFull() {
  const data = {
    projects: JSON.parse(localStorage.getItem('ug_projects') || '[]'),
    posts: JSON.parse(localStorage.getItem('ug_posts') || '[]'),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function tagCls(tag) {
  if (!tag) return 'tag-other';
  const t = tag.toLowerCase();
  if (t.includes('vision') || t.includes('cv')) return 'tag-cv';
  if (t.includes('nlp') || t.includes('llm') || t.includes('language')) return 'tag-nlp';
  if (t.includes('data') || t.includes('bayes') || t.includes('stat')) return 'tag-ds';
  if (t.includes('multi') || t.includes('foundation')) return 'tag-mm';
  return 'tag-other';
}

function statusCls(s) {
  if (!s) return '';
  const t = s.toLowerCase();
  if (t.includes('complete')) return 's-complete';
  if (t.includes('progress')) return 's-progress';
  return 's-archived';
}

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch(e) { return iso; }
}

function techBadges(s) {
  if (!s) return '';
  return s.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="tech-badge">${t}</span>`).join('');
}

function projectCardHTML(p, canDelete) {
  const del = (canDelete && isEditMode) ? `<button class="del" onclick="deleteProject('${p.id}',event)">Delete</button>` : '';
  const viewNb = p.fileContent ? `<a href="notebook.html?id=${p.id}" onclick="event.stopPropagation()">View notebook →</a>` : '';
  return `
    <div class="project-card" data-tag="${p.tag||''}" onclick="openModal('${p.id}')">
      ${p.fileType ? `<div class="file-badge">${p.fileType}</div>` : ''}
      <div class="project-tag ${tagCls(p.tag)}">${p.tag||'Project'}</div>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      ${p.highlight ? `<div class="project-highlight">${p.highlight}</div>` : ''}
      <div class="project-meta">
        ${techBadges(p.tech)}
        ${p.status ? `<span class="status-badge ${statusCls(p.status)}">${p.status}</span>` : ''}
      </div>
      <div class="project-links">
        ${viewNb}
        ${p.github ? `<a href="${p.github}" target="_blank" onclick="event.stopPropagation()">GitHub ↗</a>` : ''}
        ${p.demo ? `<a href="${p.demo}" target="_blank" onclick="event.stopPropagation()">Demo ↗</a>` : ''}
        ${del}
      </div>
    </div>`;
}

function mdToHtml(md) {
  if (!md) return '';
  let h = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return '<p>' + h + '</p>';
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const tog = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (tog && links) {
    tog.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      if (!open) {
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '54px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'var(--bg)';
        links.style.borderBottom = '1px solid var(--border)';
        links.style.padding = '0.5rem 2rem 1rem';
        links.style.zIndex = '99';
      }
    });
  }
});
