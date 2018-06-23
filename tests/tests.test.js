'use strict';

const { promisify } = require('util'),
  fs = require('fs'),
  path = require('path'),
  request = require('request').defaults({ strictSSL: false }),
  req = promisify(request),
  get = promisify(request.get);

const ReflectServer = require('../index');

const hostname = 'localhost',
  port = 3000,
  hp = `://${hostname}:${port}`;

let server;

const validateGet = async (serverType) => {
  const res = await get(`${serverType}${hp}`);
  expect(res.statusCode).toBe(200);
  const body = JSON.parse(res.body);
  expect(body.body).toBeUndefined();
  expect(body.method).toBe('GET');
};

const validatePost = async (serverType) => {
  const res = await req({
    url: `${serverType}${hp}`,
    body: 'test',
    method: 'POST',
  });
  expect(res.statusCode).toBe(200);
  const body = JSON.parse(res.body);
  expect(body.body).toBe('test');
  expect(body.method).toBe('POST');
};

test('HTTP server can be initialised', async () => {
  server = await ReflectServer.init({
    port,
    hostname,
    serverType: 'http',
  });
});

test('HTTP server correctly registers GET', () => validateGet('http'));

test('HTTP server correctly registers POST', () => validatePost('http'));

test('HTTP server can be terminated', async () => {
  ReflectServer.destroy(server);
});

test('HTTPS server can be initialised', async () => {
  server = await ReflectServer.init({
    port,
    hostname,
    serverType: 'https',
  }, {
    cert: fs.readFileSync(path.resolve(__dirname, 'certs', 'certificate.pem')),
    key: fs.readFileSync(path.resolve(__dirname, 'certs', 'key.pem')),
  });
});

test('HTTPS server correctly registers GET', () => validateGet('https'));

test('HTTPS server correctly registers POST', () => validatePost('https'));

test('HTTPS server can be terminated', async () => {
  ReflectServer.destroy(server);
});
