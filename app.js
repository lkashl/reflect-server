#!/usr/bin/env node

'use strict';

const fs = require('fs'),
  path = require('path'),
  { log } = require('util');

const reflectServer = require('./index');

const [serverType, hostname, port, certLocation, keyLocation] = process.argv.slice(2);

let key,
  cert;

if (serverType === 'https') {
  cert = fs.readFileSync(path.resolve(certLocation));
  key = fs.readFileSync(path.resolve(keyLocation));
}

(async () => {
  const params = {
    port: port || 3000,
    hostname: hostname || 'localhost',
    serverType: serverType || 'http',
  };

  const options = (serverType === 'https') ? {
    cert, key,
  } : undefined;

  let server;
  try {
    server = await reflectServer.init(params, options);
    log(`INFO Succesfully bound to ${params.serverType}://${params.hostname}:${params.port}`);
  } catch (err) {
    log(`FATAL ${err.message}`);
    if (server) reflectServer.destroy(server);
    process.exitCode = 1;
  }
})();
