import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.resolve(ROOT,process.argv[2]||'dist');
const all=[];function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){if(d.isDirectory()&&!['.git','node_modules','dist'].includes(d.name))walk(path.join(dir,d.name));else if(d.isFile()&&d.name.endsWith('.html'))all.push(path.join(dir,d.name));}}walk(OUT);
const errors=[];
for(const file of all){
 const html=fs.readFileSync(file,'utf8');
 if(!/<html lang="en"/.test(html))errors.push(`${file}: language missing`);
 if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`${file}: expected one h1`);
 if(!/<title>[^<]+<\/title>/.test(html))errors.push(`${file}: title missing`);
 for(const [,raw] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){
  const url=raw.replace(/&amp;/g,'&');
  if(/^(https?:|mailto:|data:|#)/.test(url))continue;
  const pathname=decodeURIComponent(url.split(/[?#]/)[0]);
  const target=pathname.startsWith('/')?path.join(OUT,pathname):path.resolve(path.dirname(file),pathname);
  if(!fs.existsSync(target))errors.push(`${path.relative(OUT,file)}: missing ${url}`);
  const hash=url.split('#')[1];
  if(hash&&target.endsWith('.html')&&fs.existsSync(target)&&!fs.readFileSync(target,'utf8').includes(`id="${hash}"`))errors.push(`${path.relative(OUT,file)}: missing anchor ${url}`);
 }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Checked ${all.length} HTML pages: titles, headings, local assets, links, and cross-page anchors passed.`);
