
var osStatus = require('../../../os/status');

var CPUStats = {
    ready: false,
    used: 0,
    count: 0,
    detail: {used: {}}
};

var updateTimer = null;
var updateTTL = 10;

function updateStats() {
    updateTTL--;
    if (updateTTL <= 0) {
        CPUStats.ready = false;
        if (updateTimer !== null) {
            clearInterval(updateTimer);
        }
        updateTimer = null;
    }
    osStatus.cpuUsage(function(v) {
        CPUStats.count = osStatus.cpuCount();
        CPUStats.used = v.p;
        CPUStats.detail.used = v.detail;
        CPUStats.ready = true;
    }, true);
}

module.exports.getStats = function() {
    updateTTL = 10;
    if (updateTimer === null) {
        updateTimer = setInterval(updateStats, 1000);
    }
    return CPUStats;
};

module.exports.getCount = function() {
    return osStatus.cpuCount();
};
