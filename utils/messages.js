const moment = require('moment');

function formatMessage(username, text,pic) {
  return {
    username,
    text,
    time: moment().format('HH:mm:ss'),
    pic
  };
}

module.exports = formatMessage;
