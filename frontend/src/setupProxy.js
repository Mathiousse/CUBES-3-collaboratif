const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  const proxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:8080';

  app.use(
    '/api',
    createProxyMiddleware({
      target: proxyTarget,
      changeOrigin: true,
      ws: true,
      logLevel: 'warn',
      // Express strips "/api" from req.url when mounted on '/api',
      // so add it back before forwarding to the API gateway.
      pathRewrite: (path) => `/api${path}`,
      onProxyReq: (proxyReq, req) => {
        console.log(`[Dev Proxy] ${req.method} ${req.originalUrl} -> ${proxyTarget}${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error('[Dev Proxy Error]', err.message);
        res.status(502).json({ error: 'Dev proxy could not reach API gateway' });
      },
    })
  );
};
