
var
    mongo = require('mongoose');

module.exports = function(config) {

    var connStr = 'mongodb://'+config.connection.host+':'+config.connection.port+'/'+config.connection.database;
    var connection = mongo.createConnection(connStr, config.connection.options);

    return {
        adapter: mongo,
        conn: connection,
    };
};
