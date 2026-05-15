import http from "http";
import https from "https";
import { URL } from "url";

const TARGET = process.env.TARGET;
const targetUrl = new URL(TARGET);

// تشخیص TLS
const isTLS = targetUrl.protocol === "https:";

// ست کردن SNI برای TLS
const agent = isTLS
  ? new https.Agent({
      servername: targetUrl.hostname, // مهم‌ترین بخش
      rejectUnauthorized: false       // جلوگیری از خطای سرتیفیکیت
    })
  : undefined;

const server = http.createServer((clientReq, clientRes) => {
  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: clientReq.url,
    method: clientReq.method,
    headers: clientReq.headers,
    agent: agent
  };

  const proxyReq = (isTLS ? https : http).request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes);
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err);
    clientRes.writeHead(502);
    clientRes.end("Bad Gateway");
  });

  clientReq.pipe(proxyReq);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Relay running on port ${PORT}`);
});
