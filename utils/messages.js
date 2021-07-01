const moment = require('moment');

function formatMessage(username, text) {
var d = new Date();
var n = d.toLocaleTimeString();
  return {
    username,
    text,
    n
  };
}

module.exports = formatMessage;
