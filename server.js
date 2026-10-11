// Servidor local de Aracne: sirve el bot y reenvia la voz a Fish Audio (evita el bloqueo CORS)
// Uso: node server.js   y abrir http://localhost:3000   (Node 18 o mayor, sin dependencias)
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/tts') {
    const partes = [];
    for await (const p of req) partes.push(p);
    try {
      const r = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          Authorization: req.headers.authorization || '',
          'Content-Type': 'application/json',
          model: req.headers.model || 's2.1-pro'
        },
        body: Buffer.concat(partes)
      });
      res.writeHead(r.status, { 'Content-Type': r.headers.get('content-type') || 'audio/mpeg' });
      res.end(Buffer.from(await r.arrayBuffer()));
    } catch (e) {
      res.writeHead(502);
      res.end('Proxy: ' + e.message);
    }
    return;
  }
  const archivo = ['index.html', 'aracne-bot.html'].map(n => path.join(__dirname, n)).find(fs.existsSync);
  if (!archivo) { res.writeHead(404); return res.end('Falta index.html o aracne-bot.html en esta carpeta'); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(archivo));
}).listen(PORT, () => console.log('Aracne lista en http://localhost:' + PORT));
