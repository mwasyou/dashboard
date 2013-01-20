
var
    ss = require('socketstream');

module.exports = function(config) {
    ss.ws.transport.use('socketio', config.options);
};
