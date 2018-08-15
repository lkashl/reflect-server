'use strict';

const { promisify } = require('util'),
  fs = require('fs'),
  path = require('path'),
  request = require('request').defaults({ strictSSL: false }),
  pReq = promisify(request),
  get = promisify(request.get);

const ReflectServer = require('../index');
const { log, setLog } = require('../util');
const CLI = require('../exec');

const cert = fs.readFileSync(path.resolve(__dirname, 'certs', 'certificate.pem')),
  key = fs.readFileSync(path.resolve(__dirname, 'certs', 'key.pem'));

const hostname = 'localhost';
const fq = (protocol, port) => `${protocol}://${hostname}:${port}`;

let server;

const validateGet = async (serverType, port) => {
  const res = await get(fq(serverType, port));
  expect(res.statusCode).toBe(200);
  const body = JSON.parse(res.body);
  expect(body.body).toBeUndefined();
  expect(body.method).toBe('GET');
};

const validatePost = async (serverType, port) => {
  const res = await pReq({
    url: fq(serverType, port),
    body: 'test',
    method: 'POST',
  });
  expect(res.statusCode).toBe(200);
  const body = JSON.parse(res.body);
  expect(body.body).toBe('test');
  expect(body.method).toBe('POST');
};

const testLog = (state) => {
  const logVal = log(`Testing log is in state ${state}`);
  expect(logVal).toBe(state);
};

describe('Test basic functionality (programmatic)', () => {
  const port = 3000;
  test('HTTP server can be initialised', async () => {
    server = await ReflectServer.init({
      port,
      hostname,
      serverType: 'http',
    });
  });

  test('HTTP server correctly registers GET', async () => validateGet('http', port));

  test('HTTP server correctly registers POST', async () => validatePost('http', port));

  test('HTTP server can be terminated', async () => {
    ReflectServer.destroy(server);
  });

  test('HTTPS server can be initialised', async () => {
    server = await ReflectServer.init({
      port,
      hostname,
      serverType: 'https',
    }, {
      cert,
      key,
    });
  });

  test('HTTPS server correctly registers GET', async () => validateGet('https', port));

  test('HTTPS server correctly registers POST', async () => validatePost('https', port));

  test('HTTPS server can be terminated', async () => {
    ReflectServer.destroy(server);
  });
});

describe('Test inserts and additional handling (programmatic)', () => {
  const port = 3001;

  test('Console logging is initially enabled', () => {
    testLog(true);
  });

  test('Console logging can be disabled', () => {
    setLog(false);
    testLog(false);
    setLog(true);
  });

  test('HTTPS server can be initialised with additional params', async () => {
    server = await ReflectServer.init({
      port,
      hostname,
      serverType: 'https',
    }, {
      cert,
      key,
    }, {
      silent: true,
      inserts: [
        {
          path: /\/test/,
          callback(req, body, res) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ worked: 'hooray this intercepts' }));
            res.end();
          },
        },
      ],
    });
  });

  test('Silent mode succesfully disabled logging', () => {
    testLog(false);
  });

  test('Inserts are working', async () => {
    const res = await get(`${fq('https', port)}/test`);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.worked).toBe('hooray this intercepts');
  });

  test('HTTPS insert server correctly registers GET', async () => validateGet('https', port));

  test('HTTPS insert server correctly registers POST', async () => validatePost('https', port));

  test('HTTPS insert server can be terminated', async () => {
    ReflectServer.destroy(server);
  });
});

describe('Test CLI functionality', () => {
  const port = 3002;
  test('HTTP server can be initialised', async () => {
    server = await CLI.apply(null, ['http', hostname, port]);
  });

  test('HTTP server correctly registers GET', async () => validateGet('http', port));

  test('HTTP server correctly registers POST', async () => validatePost('http', port));

  test('HTTP server can be terminated', async () => {
    ReflectServer.destroy(server);
  });

  test('HTTPS server can be initialised', async () => {
    server = await CLI.apply(null, ['https', hostname, port, './tests/certs/certificate.pem', './tests/certs/key.pem']);
  });

  test('HTTPS server correctly registers GET', async () => validateGet('https', port));

  test('HTTPS server correctly registers POST', async () => validatePost('https', port));

  test('HTTPS server can be terminated', async () => {
    ReflectServer.destroy(server);
  });
});
