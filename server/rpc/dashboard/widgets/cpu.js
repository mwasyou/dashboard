
//For better portability and future widgets management this MUST NOT be called this way
var wsCPU = require('./../../../modules/dashboard/widgets/cpu');

exports.actions = function(req, res, ss) {
    req.use('session');
    req.use('app.authenticated');

    return {
        getCPUCount: function() {
            return res(wsCPU.getCount());
        },
        getCPULoad: function() {
            return res(wsCPU.getStats());
        }
    };

};
