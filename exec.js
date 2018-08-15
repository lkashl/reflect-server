'use strict';

const fs = require('fs'),
  path = require('path'),
  { log } = require('util');

const reflectServer = require('./index');

module.exports = async (serverType, hostname, port, certLocation, keyLocation) => {
  let key,
    cert;

  if (serverType === 'https') {
    cert = fs.readFileSync(path.resolve(certLocation));
    key = fs.readFileSync(path.resolve(keyLocation));
  }

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
    return server;
  } catch (err) {
    log(`FATAL ${err.message}`);
    if (server) reflectServer.destroy(server);
    throw err;
  }
};
