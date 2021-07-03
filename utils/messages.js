const moment = require('moment');

function formatMessage(username,fullname, text,pic) {
  return {
    username,
    fullname,
    text,
    time: moment().format('HH:mm:ss'),
    pic
  };
}

module.exports = formatMessage;
