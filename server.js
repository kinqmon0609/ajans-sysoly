#!/usr/bin/env node

/**
 * Production Server Startup File
 * Next.js uygulaması için production server
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Environment variables yükle
require('dotenv').config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Next.js app oluştur
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    });
});
