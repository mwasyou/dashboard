
var WidgetCpu = require('/dashboard/widgets/cpu/widget').factory;

module.exports.load = function(conf, cb) {

    return cb();
};

module.exports.build = function(container, id, conf, cb) {
    var widget = new WidgetCpu(container, 'wcpu-'+id, {updateInterval: 2000});
    return cb(widget);
};
