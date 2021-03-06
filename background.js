/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

let counters = {};

function formatCountFor(aEventType) {
  const counter = counters[aEventType];
  if (!counter)
    return 'no count';
  const total = counter.success + counter.fail;
  const percentage = (counter.fail / total * 100).toFixed(2).toString(10).replace(/\.([0-9]+?)0+$/, '.$1').replace(/\.0+$/, '');
  return `${counter.fail} / ${total} (${percentage}%)`;
}

function getTimestamp() {
  const now = new Date();
  return `${now.getFullYear()
  }-${('0'+now.getMonth()).substr(-2)
  }-${('0'+now.getDate()).substr(-2)
  } ${('0'+now.getHours()).substr(-2)
  }:${('0'+now.getMinutes()).substr(-2)
  }:${('0'+now.getSeconds()).substr(-2)
  }.${('00'+now.getMilliseconds()).substr(-3)}`;
}

function notifyStatus() {
  browser.runtime.sendMessage({
    type: 'status',
    status: Object.keys(counters).map(aEventType => `${aEventType}: ${formatCountFor(aEventType)}`).join('\n')
  });
}

browser.runtime.onMessage.addListener((aMessage, aSender) => {
  switch (aMessage.type) {
    case 'increment':
      const counter = counters[aMessage.eventType] || { success: 0, fail: 0 };
      if (aMessage.success)
        counter.success++;
      else
        counter.fail++;
      counters[aMessage.eventType] = counter;

      const keyPart = aMessage.key ? `(${aMessage.key})` : '';
      console.log(`${getTimestamp()}: ${aMessage.eventType}${keyPart}: ${formatCountFor(aMessage.eventType)}`);
      notifyStatus();
      break;

    case 'requestStatus':
      notifyStatus();
      break;

    case 'reset':
      counters = {};
      notifyStatus();
      break;
  }
});
