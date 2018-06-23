'use strict';

const https = require('https'),
  http = require('http'),
  killable = require('killable'),
  { log } = require('util');

const acknowledge = (req) => {
  log('INFO', `Received ${req.method} to ${req.url}`);
};

const reflect = (req, body, res) => {
  res.on('error', (err) => {
    log(`ERROR ${err}`);
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  const writeTarget = JSON.stringify({
    url: req.url,
    headers: req.headers,
    body,
    method: req.method,
    httpVersion: req.httpVersion,
  });
  res.write(writeTarget);
  res.end();
  log(`INFO Succesfully wrote response for ${req.method} ${req.url}.\nFull info ${writeTarget}`);
};

const reflectError = (res, err) => {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({
    err,
  }));
  res.end();
};

const init = (params, options) => new Promise((resolve, reject) => {
  if (!params.port || !params.hostname || !params.serverType) return reject(new Error('Incorrect args provided'));
  if (!options) options = {};
  const handler = (req, res) => {
    acknowledge(req);
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => reflect(req, body || undefined, res));
    req.on('error', err => reflectError(res, err));
  };

  const server = (params.serverType === 'https')
    ? https.createServer(options, handler)
    : http.createServer(handler);

  killable(server);

  server.listen(params.port, params.hostname, (err) => {
    if (err) return reject(err);
    return resolve(server);
  });
});

const destroy = (server) => {
  server.kill();
};

module.exports = { init, destroy };
