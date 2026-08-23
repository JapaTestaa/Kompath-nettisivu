import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Strip query parameters or hashes from path
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Remove trailing slash if present (except for root '/')
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Translate URL path to file system path with clean route aliases
  let filePath;
  if (pathname === '/' || pathname === '/koti' || pathname === '/index' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname === '/omavalvontasuunnitelma' || pathname === '/omavalvontasuunnitelma.html') {
    filePath = path.join(__dirname, 'omavalvontasuunnitelma.html');
  } else if (pathname === '/tietosuojaseloste' || pathname === '/tietosuojaseloste.html') {
    filePath = path.join(__dirname, 'tietosuojaseloste.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }
  
  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // If it has no extension, try adding .html (clean URLs)
          if (!ext) {
            const htmlPath = filePath + '.html';
            fs.readFile(htmlPath, (err2, content2) => {
              if (!err2) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content2, 'utf-8');
              } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
              }
            });
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          }
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
