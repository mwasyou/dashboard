
module.exports = function(config) {
    var c = config || {};
    var AclUsers = require('./users');

    return {
        users: new AclUsers(c.users || {}),
    };
};
