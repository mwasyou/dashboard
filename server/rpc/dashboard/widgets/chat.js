
exports.actions = function(req, res, ss) {
    req.use('session');
    req.use('app.authenticated');

    return {
        sendPublicMessage: function(data) {
            if (typeof data !== "object" || !data.mty || !data.msg) {
                return res(false);
            }
            if (data.msg && data.msg.length > 0) {
                var user = ss.acl.users.findByHash(req.session.userId) || {};
                ss.publish.all('chat:message:public', {
                    user: user.user || "Anonymous",
                    msg: data.msg,
                    mty: data.mty
                });
                return res(true);
            } else {
                return res(false);
            }
        }
    };

};
