(() => {
  'use strict';
  const form=document.querySelector('#editor-form');
  const preview=document.querySelector('#editor-preview');
  const status=document.querySelector('#editor-status');
  const storageKey='utkarsh-writing-desk-v1';
  const fields=['title','description','date','category','tags','slug','github','demo','notebook','draft','body'];
  const input=name=>form.elements.namedItem(name);
  const say=message=>status.textContent=message;
  let lastAutoSlug='';
  let restoring=false;
  let downloadURL='';
  const downloadLink=document.querySelector('#download-post');
  function prepareDownload(){
    const d=snapshot();
    const meta={title:d.title.trim(),description:d.description.trim(),date:d.date,category:d.category,tags:d.tags.split(',').map(x=>x.trim()).filter(Boolean),draft:d.draft};
    for(const k of ['github','demo','notebook'])if(d[k].trim())meta[k]=d[k].trim();
    const text='---\n'+JSON.stringify(meta,null,2)+'\n---\n\n'+d.body.trim()+'\n';
    if(downloadURL)URL.revokeObjectURL(downloadURL);
    downloadURL=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));
    downloadLink.href=downloadURL;downloadLink.download=(d.slug||'project-post')+'.md';
  }
  const slugify=text=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const today=new Date();
  const localDate=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  input('date').value=localDate;
  function snapshot(){return Object.fromEntries(fields.map(k=>[k,k==='draft'?input(k).checked:input(k).value]));}
  function fill(data){
    restoring=true;
    if(data.category && ![...input('category').options].some(o=>o.value===data.category))input('category').add(new Option(data.category,data.category));
    for(const key of fields){if(key==='draft')input(key).checked=data[key]===true;else input(key).value=String(data[key]??(key==='date'?localDate:key==='category'?'Data Science':''));}
    lastAutoSlug=slugify(input('title').value);restoring=false;render();
  }
  function render(){
    const data=snapshot();
    if(!restoring && (!data.slug||data.slug===lastAutoSlug)){const slug=slugify(data.title);input('slug').value=slug;lastAutoSlug=slug;}
    const body=input('body').value;
    const e=SiteMarkdown.escapeHTML;
    preview.innerHTML=`<div class="post-meta"><span class="tag">${e(data.category)}</span></div><h1>${e(data.title||'Your next project')}</h1>${data.description?`<p class="editor-preview-description">${e(data.description)}</p><hr>`:''}${body?SiteMarkdown.render(body):'<p>Start writing to see your article here.</p>'}`;
    const words=body.trim()?body.trim().split(/\s+/).length:0;
    document.querySelector('#word-count').textContent=`${words} words · ${Math.max(1,Math.ceil(words/220))} min`;
    prepareDownload();
  }
  function save(){render();try{localStorage.setItem(storageKey,JSON.stringify(snapshot()));say('Draft saved in this browser. Download a copy to keep your work.');}catch{say('Browser storage is unavailable or full. Download your post to save your work.');}}
  let timer;form.addEventListener('input',()=>{clearTimeout(timer);render();timer=setTimeout(save,350);});
  form.addEventListener('change',save);form.addEventListener('submit',e=>e.preventDefault());
  try{const saved=localStorage.getItem(storageKey);if(saved){fill(JSON.parse(saved));say('Restored your draft from this browser.');}else render();}catch{render();say('Browser storage is unavailable. Download your post to save your work.');}
  downloadLink.addEventListener('click',event=>{
    if(!form.reportValidity()){event.preventDefault();return;}
    const d=snapshot();
    if(!d.body.trim()){event.preventDefault();input('body').focus();say('Add some article text before downloading.');return;}
    if(d.notebook && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(ipynb|py)$/.test(d.notebook)){event.preventDefault();say('Use a notebook filename such as analysis.ipynb or model.py, without a folder.');return;}
    for(const k of ['github','demo'])if(d[k] && (!/^https?:\/\//.test(d[k])||!SiteMarkdown.safeURL(d[k]))){event.preventDefault();say('Code and demo links must start with https:// or http://.');return;}
    say(`Downloading ${d.slug}.md. Add it to content/posts/ and commit to publish.${d.draft?' It is marked as a draft, so it will stay unpublished.':''}`);
  });
  const importInput=document.querySelector('#import-post');
  document.querySelector('#load-post').addEventListener('click',()=>importInput.click());
  importInput.addEventListener('change',async()=>{
    const f=importInput.files[0];if(!f)return;
    try{
      if(f.size>10*1024*1024)throw new Error('Use a file smaller than 10 MB.');
      const raw=await f.text();const match=raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if(!match)throw new Error('Use a post with JSON metadata between --- lines, as shown in the template.');
      const m=JSON.parse(match[1]);
      if(input('body').value.trim()&&!confirm('Replace the current draft? Download it first if you want to keep a separate copy.'))return;
      fill({...m,tags:Array.isArray(m.tags)?m.tags.join(', '):m.tags,slug:slugify(f.name.replace(/\.md$/i,'')),body:match[2].trim()});save();say(`Opened ${f.name}.`);
    }catch(error){say('Could not open this post: '+error.message);}finally{importInput.value='';}
  });
  const exampleBody='> This is an unpublished example to demonstrate the article format, not a claim about a completed project.\n\n## The question\n\nA good project starts with a question that can be tested. Here, the question is simple: how do we compare a model with a baseline without letting information from the test set influence training?\n\n## The approach\n\nSet aside a test set before fitting preprocessing steps. Put the transformation and estimator in the same pipeline so each cross-validation fold learns its own preprocessing parameters.\n\n```python\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import Ridge\nfrom sklearn.model_selection import cross_val_score\n\nmodel = make_pipeline(StandardScaler(), Ridge(alpha=1.0))\nscores = cross_val_score(model, X_train, y_train, cv=5,\n                         scoring="neg_mean_squared_error")\n```\n\nThe snippet assumes a suitable regression dataset has already been loaded and split into training and held-out data. Choose a split that reflects the problem; time series and grouped observations need different validation strategies.\n\n## What to report\n\n| Question | What to record |\n| --- | --- |\n| Does the model improve on a baseline? | Held-out error for both models |\n| How variable is performance? | Scores across valid folds or repeated splits |\n| Where does it fail? | Residuals and relevant subgroups |\n\n## What comes next\n\nAdd your own data description, results, figures, and limitations here. Link to the code or attach a notebook so the analysis can be followed.\n';
  document.querySelector('#load-example').addEventListener('click',()=>{
    if(input('body').value.trim()&&!confirm('Replace the current draft with the example? Download your draft first to keep it.'))return;
    fill({title:'From a baseline to a better model',description:'An example project write-up showing code, tables, and a clear account of the method.',date:localDate,category:'Data Science',tags:'Python, scikit-learn, Model evaluation',slug:'example-model-evaluation',draft:true,body:exampleBody});save();say('Loaded an unpublished example. Replace it with your own work before publishing.');
  });
  const nbInput=document.querySelector('#notebook-input');
  document.querySelector('#attach-notebook').addEventListener('click',()=>nbInput.click());
  nbInput.addEventListener('change',async()=>{
    const f=nbInput.files[0];if(!f)return;
    try{
      if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(ipynb|py)$/.test(f.name))throw new Error('Use a simple filename ending in .ipynb or .py.');
      if(f.size>10*1024*1024)throw new Error('Use a file smaller than 10 MB.');
      const text=await f.text();if(f.name.endsWith('.ipynb')){const nb=JSON.parse(text);if(!Array.isArray(nb.cells))throw new Error('This is not a valid Jupyter notebook.');}
      input('notebook').value=f.name;save();say(`Attached filename ${f.name}. Add the original file to content/notebooks/ when you commit your post; code and saved outputs will appear in the published article.`);
    }catch(error){say('Could not attach the file: '+error.message);}finally{nbInput.value='';}
  });
})();
