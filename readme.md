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

## Standalone invokation

### HTTP Server

``` bash
reflect-server http localhost 3000
```

### HTTPS Server

``` bash
reflect-server http localhost 3000 ./cwd-relative-location-to-cert ./cwd-relative-location-to-key
```