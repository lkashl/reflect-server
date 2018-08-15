'use strict';

let shouldLog = true;

const setLog = (val) => {
  shouldLog = val;
};

const log = (message) => {
  const date = new Date();
  if (!shouldLog) return false;
  console.log(`${date.toString()} ${message}`);
  return true;
};

module.exports = {
  log, setLog,
};
