import moment from 'moment';
// eslint-disable-next-line
const momentDurationFormatSetup = require('moment-duration-format');
// SEE https://github.com/jsmreese/moment-duration-format FOR DOCS

export function formatTime(seconds) {
  const duration = moment.duration(seconds, 'seconds');
  const formattedTimeLeft = duration.format('hh , mm , ss');
  const timeArr = formattedTimeLeft.split(',');

  return timeArr;
}
