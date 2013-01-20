exports.authenticated = function() {

    return function(req, res, next) {
        if (req.method && 'app.login' === req.method) {
            return next();
        }
        if (req.session && (req.session.userId != null)) {
            return next();
        } else {
            return res(false);
        }
    };

};
