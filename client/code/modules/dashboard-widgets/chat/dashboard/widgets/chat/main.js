
var WidgetChat = require('/dashboard/widgets/chat/widget').factory;

module.exports.load = function(conf, cb) {

    return cb();
};

module.exports.build = function(container, id, conf, cb) {
    var widget = new WidgetChat(container, 'wchat-'+id);
    return cb(widget);
};
