(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const closeMenu = () => {if (!toggle || !nav) return;nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');};
  toggle?.addEventListener('click', () => {const open = toggle.getAttribute('aria-expanded') !== 'true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && nav?.classList.contains('open')){closeMenu();toggle.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  window.matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
  for(const group of document.querySelectorAll('[data-filter-group]')){
    const name=group.dataset.filterGroup;
    const list=document.querySelector(`[data-filter-list="${name}"]`);
    if(!list)continue;
    group.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      const filter=button.dataset.filter;
      group.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
      let count=0;
      [...list.children].forEach(item=>{const show=filter==='all'||item.dataset.category===filter;item.hidden=!show;if(show)count++;});
      const counter=document.querySelector(`[data-count-for="${name}"]`);
      if(counter)counter.textContent=`${count} ${count===1?'paper':'papers'}`;
      const status=list.parentElement.querySelector('.filter-status');
      if(status)status.textContent=`Showing ${count} ${name==='pubs'?'papers':'posts'}${filter==='all'?'':` in ${filter}`}.`;
    }));
  }
  const form=document.querySelector('#contact-form');
  form?.addEventListener('submit',e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const d=new FormData(form);
    const body=`${d.get('message')}\n\n${d.get('name')}\n${d.get('email')}`;
    const recipient=form.dataset.recipient || 'ugiri@caltech.edu';
    const url=`mailto:${recipient}?subject=${encodeURIComponent(d.get('subject'))}&body=${encodeURIComponent(body)}`;
    const status=document.querySelector('#contact-status');
    status.textContent=`Your email app should open. If it doesn’t, email ${recipient} directly. No message has been sent by this site.`;
    window.location.href=url;
  });
  const progress=document.querySelector('.reading-progress');
  if(progress){const update=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=`${max>0?Math.max(0,Math.min(100,window.scrollY/max*100)):100}%`;};window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();}
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  for(const block of document.querySelectorAll('.prose pre > code')){
    const raw=block.textContent;
    if(block.classList.contains('language-python')){
      const tokens=/(#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:import|from|as|def|class|return|for|in|if|else|elif|while|with|try|except|raise|True|False|None|and|or|not|lambda|yield|pass|assert)\b|\b\d+(?:\.\d+)?\b)/g;
      let last=0,html='';for(const m of raw.matchAll(tokens)){html+=escapeHTML(raw.slice(last,m.index));const t=m[0];const cls=t.startsWith('#')?'comment':/^['"]/.test(t)?'string':/^\d/.test(t)?'number':'keyword';html+=`<span class="token-${cls}">${escapeHTML(t)}</span>`;last=m.index+t.length;}html+=escapeHTML(raw.slice(last));block.innerHTML=html;
    }
    const button=document.createElement('button');button.type='button';button.className='code-copy';button.textContent='Copy';button.setAttribute('aria-label','Copy code');
    button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(raw);button.textContent='Copied';setTimeout(()=>button.textContent='Copy',1800);}catch{button.textContent='Select to copy';const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(block);selection.removeAllRanges();selection.addRange(range);}});
    block.parentElement.append(button);
  }
})();
