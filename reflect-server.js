#!/usr/bin/env node

'use strict';

const exec = require('./exec');

try {
  exec(...process.argv.slice(2));
} catch (err) {
  process.exitCode = 1;
}
