# Reflect-Server

A simple server that reflects any http/https requests made to it, allowing for transparent proxies to be validated from the client side or for web clients to be validated.

As an example:

``` bash
curl -k -d "data" http://localhost:3000/test
{"url":"/test","headers":{"host":"localhost:3000","user-agent":"curl/7.47.0","accept":"*/*","content-length":"4","content-type":"application/x-www-form-urlencoded"},"body":"data","method":"POST"}
```

The server can be invoked both programatically and as a standalone serer.

## Programmatic invokation

``` javascript
const ReflectServer = require('reflect-server');

// If http server
  const httpServer = await ReflectServer.init({
    port: 3000,
    hostname: 'localhost',
    serverType: 'http',
  });

// If https server
  const httpsServer = await ReflectServer.init({
    port: 3000,
    hostname: 'localhost',
    serverType: 'http',
  },{
      /* node options object eg.
      key: 'fs.readFileSync('key.pem'),
      cert: 'fs.readFileSync('cert.pem')*/
  });

  // After initialisation server can programatically be terminated using
  ReflectServer.destroy(httpServer);

```

### Additional programmatic invocation options are available in a secret third object:

```javascript
{
  // Suppress console output
  silent: true|false (bool),
  // Add programmatic inserts allowing for user callbacks
  // This overrides the default behavior with the user code
  inserts: [
    {
      // A regex path to match the incoming URI
      path: /\/test/,
      // Callbak with access to standard res, body and req objs
      callback(req, body, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ worked: 'hooray this intercepts' }));
        res.end();
      },
    },
  ],
}
```

## Standalone invokation

### Global invokation

Reflect server can be installed globally and invoked from CLI

``` bash
npm i reflect-server -g
```

#### Init HTTP Server

``` bash
reflect-server http localhost 3000
```

#### Init HTTPS Server

``` bash
reflect-server http localhost 3000 ./cwd-relative-location-to-cert ./cwd-relative-location-to-key
```

### Local invokation

In case you aren't able to install global modules you can always pull down this module and use npm start

``` bash
cd reflect-server
npm start http localhost 3000
```
