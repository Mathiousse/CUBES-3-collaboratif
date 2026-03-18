require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(cors()); // CORS must be first to handle preflights/errors correctly


app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Address autocomplete - direct proxy to French government API
app.get('/api/address/search', async (req, res) => {
  try {
    console.log('[Address API Request]', req.query);
    const axios = require('axios');
    const response = await axios.get('https://api-adresse.data.gouv.fr/search', {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('[Address API Error]', error.message);
    res.status(500).json({ error: 'Failed to fetch address suggestions' });
  }
});

app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_API_URL + '/auth',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Auth Proxy]', req.method, req.url, '→', proxyReq.path);
  }
}));

app.use('/api/logistique', createProxyMiddleware({
  target: process.env.LOGISTIQUE_API_URL,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  pathRewrite: { '^/api/logistique': '' },
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Logistique Proxy]', req.method, req.url, '→', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('[Logistique Proxy Error]', err.message);
    res.status(502).json({ error: 'Logistics service unavailable' });
  }
}));

app.use('/api/commande', createProxyMiddleware({
  target: process.env.COMMANDE_API_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Commande Proxy]', req.method, req.url, '→', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('[Commande Proxy Error]', err.message);
  }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

