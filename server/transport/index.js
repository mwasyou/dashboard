
module.exports = function(config) {
    require('./' + config.use)(config.adapters[config.use]);
};
