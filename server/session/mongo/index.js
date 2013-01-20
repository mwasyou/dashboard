
/*
  This has been tested with:

    "mongodb": "=1.0.2",
    "connect-mongo": "=0.2.0",
*/

var
    connect = require('connect'),
    ss = require('socketstream');

module.exports = function(config) {
    var MongoStore = require('connect-mongo')(connect);
    var storeOptions = ss.api.utils.extend({mongoose_connection: ss.api.db.conn}, config.options);

    ss.session.store.use(new MongoStore(storeOptions));
};
