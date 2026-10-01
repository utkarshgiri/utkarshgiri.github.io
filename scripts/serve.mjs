// Local preview only. Production is a static website served by GitHub Pages.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=fs.existsSync(path.join(ROOT,'dist/index.html'))?path.join(ROOT,'dist'):ROOT;
const args=process.argv.slice(2);
const port=Number(args.includes('--port')?args[args.indexOf('--port')+1]:8080);
const host=args.includes('--host')?args[args.indexOf('--host')+1]:'127.0.0.1';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8','.ipynb':'application/x-ipynb+json','.py':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
 const file=path.resolve(base,'.'+(url.endsWith('/')?url+'index.html':url));
 if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':mime['.html']});res.end(fs.readFileSync(path.join(base,'404.html')));return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
}).listen(port,host,()=>console.log(`Preview: http://localhost:${port} (serving ${base})`));
