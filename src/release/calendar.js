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
    let assignedChannel;
    // skip reference to Aurora due to merge into Beta to avoid duplicate entries
    if (moment().diff(entry.start, 'days') >= days || entry.summary === 'MERGE: B58, A59, N60') {
      return data;
    }
    if (channel === 'nightly') {
      regex = /N[0-9]*/;
    } else if (channel === 'beta') {
      regex = /B[0-9]*/;
    } else {
      regex = /firefox\s+(ESR)?\s*([\d.]+)\s+release/i;
    }

    const summary = entry.summary.match(regex);
    if (!summary) {
      return data;
    }

    if (channel === 'nightly' || channel === 'beta') {
      version = summary.join('').replace(/N|B/, '');
    } else {
      // the calendar summary text is similar for both release and esr; for esr
      // it'll contain 'ESR', otherwise it'll be undefined (for release)
      assignedChannel = summary[1] ? 'esr' : 'release';
      if (channel !== assignedChannel) {
        return data;
      }
      version = summary[2];
    }
    data.push({
      version,
      channel: !assignedChannel ? channel : assignedChannel,
      date: moment(entry.start).format('YYYY-MM-DD'),
    });
    return data;
  }, []);
  dates.sort((a, b) => ((a.date < b.date) ? -1 : 1));
  return dates;
}
