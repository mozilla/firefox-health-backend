import moment from 'moment';
import ical from 'ical-with-secure-request';
import fetchText from '../fetch/text';
import { parse } from '../meta/version';

export default async function getCalendar({
  channel = 'release', days = 0,
} = {}) {
  const url = 'https://calendar.google.com/calendar/ical/mozilla.com_2d37383433353432352d3939%40resource.calendar.google.com/public/basic.ics';
  const ics = await fetchText(url);
  const parsed = ical.parseICS(ics);
  const dates = Object.keys(parsed).reduce((data, key) => {
    const entry = parsed[key];
    let regex;
    let version;
    let ch;
    // skip reference to Aurora due to merge into Beta to avoid duplicate entries
    if (moment().diff(entry.start, 'days') >= days || entry.summary === 'MERGE: B58, A59, N60') {
      return data;
    }
    if (channel === 'release') {
      regex = /firefox\s+(esr)?\s*([\d.]+)\s+release/i;
    } else if (channel === 'nightly') {
      regex = /N[0-9]*/;
    } else if (channel === 'beta') {
      regex = /B[0-9]*/;
    }
    const summary = entry.summary.match(regex);

    if (!summary) {
      return data;
    }

    if (channel === 'release') {
      ch = summary[1] ? 'esr' : 'release';
      if (channel && ch !== channel) {
        return data;
      }
      ({ clean: version } = parse(summary[2]));
    } else {
      version = summary.join('').replace(/N|B/, '');
    }

    data.push({
      version,
      channel: !ch ? channel : ch,
      date: moment(entry.start).format('YYYY-MM-DD'),
    });
    return data;
  }, []);
  dates.sort((a, b) => ((a.date < b.date) ? -1 : 1));
  return dates;
}
