
var Dashboard = require('/dashboard/lib/dashboard').factory;

module.exports.load = function(conf, cb) {

    cb();
};

module.exports.build = function(container, id, conf, cb) {
    var d = new Dashboard(container, 'dashboard-'+id);
    d.setColumnsCount(3);

    d.addWidget('chat', function(widgetInstance) {
        d.addWidget('cpu', function(widgetInstance) {
            d.update();
            return cb(d);
        });
    });
};
