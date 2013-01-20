var _os = require('os');

exports.platform = function(){
    return process.platform;
};

exports.cpuCount = function(){
    return _os.cpus().length;
};

exports.sysUptime = function(){
    //seconds
    return _os.uptime();
};

exports.processUptime = function(){
    //seconds
    return process.uptime();
};

// Memory
exports.freemem = function(){
    return _os.freemem() / ( 1024 * 1024 );
};

exports.totalmem = function(){

    return _os.totalmem() / ( 1024 * 1024 );
};

exports.freememPercentage = function(){
    return _os.freemem() / _os.totalmem();
};

// Hard Disk Drive
exports.harddrive = function(callback){

    require('child_process').exec('df -k', function(error, stdout, stderr) {

        var total = 0;
        var used = 0;
        var free = 0;

        var lines = stdout.split("\n");

        var str_disk_info = lines[1].replace( /[\s\n\r]+/g,' ');

        var disk_info = str_disk_info.split(' ');

        total = Math.ceil((disk_info[1] * 1024)/ Math.pow(1024,2));
        used = Math.ceil(disk_info[2] * 1024 / Math.pow(1024,2)) ;
        free = Math.ceil(disk_info[3] * 1024 / Math.pow(1024,2)) ;

        callback(total, free, used);
    });
};

/*
* Returns All the load average usage for 1, 5 or 15 minutes.
*/
exports.allLoadavg = function(){

    var loads = _os.loadavg();

    return loads[0].toFixed(4)+','+loads[1].toFixed(4)+','+loads[2].toFixed(4);
};

/*
* Returns the load average usage for 1, 5 or 15 minutes.
*/
exports.loadavg = function(_time){

    if(_time === undefined || (_time !== 5 && _time !== 15) ) {
        _time = 1;
    }

    var loads = _os.loadavg();
    var v = 0;
    if(_time === 1) {
        v = loads[0];
    }
    if(_time === 5) {
        v = loads[1];
    }
    if(_time === 15) {
        v = loads[2];
    }

    return v;
};


exports.cpuFree = function(callback, perc) {
    getCPUUsage(callback, true, perc);
};

exports.cpuUsage = function(callback, perc) {
    getCPUUsage(callback, false, perc);
};

function getCPUUsage(callback, free, perc) {

    var stats1 = getCPUInfo();

    setTimeout(function() {
        var stats2 = getCPUInfo();
        var d = {p: 0, detail: {}};
        var p = 0.0;

        d.p = (stats2.sum.idle - stats1.sum.idle) / (stats2.sum.total - stats1.sum.total);
        if (free !== true) {
            d.p = 1 - d.p;
        }
        if (perc) {
            d.p = Math.round(d.p*100);
        }
        for (var cpu in stats2.detail) {
            d.detail[cpu] = (stats2.detail[cpu].idle - stats1.detail[cpu].idle) / (stats2.detail[cpu].total - stats1.detail[cpu].total);
            if (free !== true) {
                d.detail[cpu] = 1 - d.detail[cpu];
            }
            if (perc) {
                d.detail[cpu] = Math.round(d.detail[cpu]*100);
            }
        }

        callback(d);
    }, 1000);
}

function getCPUInfo(callback) {
    var cpus = _os.cpus();

    var d = {sum: {idle: 0, total: 0}, detail: {}};

    var user = 0;
    var nice = 0;
    var sys = 0;
    var idle = 0;
    var irq = 0;
    var total = 0;

    for(var cpu in cpus) {
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;

        d.detail[cpu] = {
            idle: cpus[cpu].times.idle,
            total:
                cpus[cpu].times.user +
                cpus[cpu].times.nice +
                cpus[cpu].times.sys +
                cpus[cpu].times.irq +
                cpus[cpu].times.idle,
        };
    }

    d.sum.idle = idle;
    d.sum.total = user + nice + sys + idle + irq;

    return d;
}
