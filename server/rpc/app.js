
exports.actions = function(req, res, ss) {
    req.use('session');
    req.use('app.authenticated');

    return {
        login: function(apikey) {
            var user = ss.acl.users.findByHash(apikey);
            if (user && apikey) {
                req.session.setUserId(apikey);
                ss.log('>'.cyan, ("Loged in:").green, user.user || 'internal');
                res(true);
            } else {
                ss.log('>'.cyan, ("Authentication failed:").red, ' "' + apikey + '"');
                res('Access denied!');
            }
        },
        logout: function() {
            var user = ss.acl.users.findByHash(req.session.userId);
            req.session.setUserId(null);
            //req.session.regenerate(function(err){});
            ss.log('>'.cyan, ("Loged out:").yellow, user.user || 'internal');
            res(true);
        },
    };

};
