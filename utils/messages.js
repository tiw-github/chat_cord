const moment = require('moment');

function formatMessage(username, text,pic) {
  return {
    username,
    text,
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    pic
  };
}

module.exports = formatMessage;
