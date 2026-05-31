// projects.js
let filter = 'all';
let fileData = null, fileName = null, fileType = null;

function render() {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  let p = getProjects();
  if (filter !== 'all') p = p.filter(x => x.tag === filter);
  if (!p.length) { grid.innerHTML = ''; empty.hidden = false; }
  else { empty.hidden = true; grid.innerHTML = p.map(x => projectCardHTML(x, true)).join(''); }
}

window.deleteProject = function(id, e) {
  e.stopPropagation();
  if (!confirm('Delete this project?')) return;
  saveProjects(getProjects().filter(x => x.id !== id));
  render();
};

window.openModal = function(id) {
  const p = getProjects().find(x => x.id === id);
  if (!p) return;

  // If project has a file, open the dedicated notebook viewer
  if (p.fileContent) {
    window.location.href = 'notebook.html?id=' + p.id;
    return;
  }

  // Otherwise show info modal
  document.getElementById('modal-body').innerHTML = `
    <div class="project-tag ${tagCls(p.tag)}" style="margin-bottom:1rem">${p.tag||'Project'}</div>
    <h2>${p.title}</h2>
    ${p.status ? `<div style="margin:0.5rem 0"><span class="status-badge ${statusCls(p.status)}">${p.status}</span></div>` : ''}
    <p>${p.description}</p>
    ${p.highlight ? `<div class="project-highlight" style="margin:0.75rem 0">${p.highlight}</div>` : ''}
    ${p.tech ? `<div class="modal-label">Technologies</div><div class="project-meta" style="margin-bottom:1rem">${techBadges(p.tech)}</div>` : ''}
    <div class="project-links" style="margin-bottom:1rem">
      ${p.github ? `<a href="${p.github}" target="_blank">GitHub ↗</a>` : ''}
      ${p.demo ? `<a href="${p.demo}" target="_blank">Demo ↗</a>` : ''}
    </div>`;
  document.getElementById('modal-bg').hidden = false;
  document.body.style.overflow = 'hidden';
};

function closeModal() {
  document.getElementById('modal-bg').hidden = true;
  document.body.style.overflow = '';
}
document.getElementById('modal-x').onclick = closeModal;
document.getElementById('modal-bg').addEventListener('click', function(e) { if (e.target === this) closeModal(); });

// File upload
const dz = document.getElementById('drop-zone');
const fi = document.getElementById('file-input');
const fp = document.getElementById('file-picked');

function handleFile(f) {
  if (!f) return;
  if (!f.name.endsWith('.ipynb') && !f.name.endsWith('.py')) { alert('Please upload .ipynb or .py'); return; }
  if (f.size > 10485760) { alert('File too large (max 10 MB).'); return; }
  fileName = f.name;
  fileType = f.name.endsWith('.ipynb') ? '.ipynb' : '.py';
  const r = new FileReader();
  r.onload = e => { fileData = e.target.result; fp.textContent = '✓ ' + f.name; fp.hidden = false; };
  r.readAsText(f);
}
fi.onchange = e => handleFile(e.target.files[0]);
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); handleFile(e.dataTransfer.files[0]); });
dz.addEventListener('click', e => { if (e.target.tagName !== 'LABEL') fi.click(); });

// Form
document.getElementById('project-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const t = document.getElementById('p-title').value.trim();
  const tag = document.getElementById('p-tag').value;
  const d = document.getElementById('p-desc').value.trim();
  if (!t || !tag || !d) return;
  const proj = {
    id: 'p_' + Date.now(), title: t, tag, description: d,
    tech: document.getElementById('p-tech').value.trim(),
    status: document.getElementById('p-status').value,
    github: document.getElementById('p-github').value.trim(),
    demo: document.getElementById('p-demo').value.trim(),
    highlight: document.getElementById('p-highlight').value.trim(),
    fileName, fileType, fileContent: fileData,
    date: new Date().toISOString(),
  };
  const all = getProjects(); all.unshift(proj); saveProjects(all);
  this.reset(); fileData = fileName = fileType = null; fp.hidden = true;
  render();
  document.getElementById('grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.getElementById('clear-btn').onclick = () => { document.getElementById('project-form').reset(); fileData = fileName = fileType = null; fp.hidden = true; };

// Toggle
document.getElementById('toggle-form').addEventListener('click', function() {
  document.getElementById('add-panel').classList.toggle('collapsed');
  this.textContent = document.getElementById('add-panel').classList.contains('collapsed') ? 'Expand ↓' : 'Collapse ↑';
});

// Filters
document.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', function() {
  document.querySelectorAll('.fbtn').forEach(x => x.classList.remove('on'));
  this.classList.add('on');
  filter = this.dataset.f;
  render();
}));

render();
document.addEventListener('data-loaded', render);
