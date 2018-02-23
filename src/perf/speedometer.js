import { stringify } from 'query-string';
import fetchJson from '../fetch/json';

const AWFY = 'https://arewefastyet.com';
const MACHINE = { 32: '37', 64: '36' };

const generateUrl = (architecture) => {
  const machine = MACHINE[architecture];
  return {
    dataUrl: `${AWFY}/data.php?file=bk-aggregate-speedometer-misc-score-${machine}.json`,
    viewUrl: `${AWFY}#machine=${machine}&view=single&suite=speedometer-misc&subtest=score`,
  };
};

const BROWSER_TO_ID = {
  Nightly: 14,
  Beta: 62,
  Canary: 3,
};

const ID_TO_BROWSER = Object.keys(BROWSER_TO_ID).reduce((res, name) => {
  res[BROWSER_TO_ID[name]] = name;
  return res;
}, {});

const absoluteValues = (graph, browsers) => {
  // Initialize returning structure
  const result = browsers.reduce((res, name) => {
    res[name] = {
      label: name,
      data: [],
    };
    return res;
  }, {});

  const modeIds = browsers.map(name => BROWSER_TO_ID[name]);

  graph.timelist.forEach((date, idx) => {
    // XXX: This flattens all data points for the same day to one data point
    const dayDate = new Date(date * 1000).toISOString().substring(0, 10);
    graph.lines.forEach((line) => {
      if (line && line.data[idx] && modeIds.includes(line.modeid)) {
        result[ID_TO_BROWSER[line.modeid]].data.push({
          date: dayDate,
          value: line.data[idx][0],
        });
      }
    });
  });

  return result;
};

// In September 2017, we adjusted the benchmark and caused Canary and Firefox
// to have a new baseline. For this graph we need to drop data before then
const skipBump = (originalData, skipDataBefore) => {
  const newData = {};
  Object.keys(originalData).forEach((name) => {
    const { label, data } = originalData[name];
    newData[name] = {
      label,
      data: data.filter((el) => {
        const date = new Date(el.date);
        let newEl = null;
        if (date >= new Date(skipDataBefore)) {
          newEl = el;
        }
        return newEl;
      }),
    };
  });

  return newData;
};

// XXX: In the future we should do many more validations
const validateParameters = ({ architecture, browser }) => {
  if (!browser || !architecture) {
    const message = 'This API requires various parameters. Please refer to the code.';
    throw Error(message);
  }
};

// architecture and browser are required in order to determine what data to show
// If you pass targetRatio it will add a target line based on Chrome's data
// If you pass a baseValue we will add a target line based on that value
// omitOldBaseline skips data points before Sep. 2017
const fetchSpeedometerData = async ({
  architecture, browser, targetRatio, baseValue, skipDataBefore,
}) => {
  validateParameters({
    architecture, browser, targetRatio, baseValue, skipDataBefore,
  });
  // If only one browser specified turn it into an array of one
  const browsers = (typeof browser === 'string') ? [browser] : browser;
  const { dataUrl, viewUrl } = generateUrl(architecture);
  const { graph } = await fetchJson(dataUrl);
  let data = absoluteValues(graph, browsers);

  if (skipDataBefore) {
    data = skipBump(data, skipDataBefore);
  }

  // We will add one more series representing the target based on Canary's series
  if (baseValue && targetRatio) {
    // XXX: We should have a parameter to define this
    const targetBrowser = 'Nightly';
    const targetData = data[targetBrowser].data;
    const targetValue = baseValue * targetRatio;
    data.Target = {
      label: `Target ${targetRatio * 100}%`,
      data: [
        { date: targetData[0].date, value: targetValue },
        { date: targetData[targetData.length - 1].date, value: targetValue },
      ],
    };
    // We don't need Canary's data for this mode
    delete data.Canary;
  } else if (targetRatio) {
    const canary = data.Canary.data;
    data.Target = {
      label: `Target ${targetRatio * 100}%`,
      data: canary.map(el => ({
        date: el.date,
        value: el.value * targetRatio,
      })),
    };
  }
  return {
    meta: {
      dataUrl,
      viewUrl,
    },
    data,
  };
};

// XXX: Add propTypes support

export default fetchSpeedometerData;
