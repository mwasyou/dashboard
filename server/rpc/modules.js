
exports.actions = function(req, res, ss) {
    req.use('session');
    req.use('app.authenticated');

    return {
        getConfig: function(moduleName) {
            res(ss.modules.mx[moduleName]);
        },
    };

};
