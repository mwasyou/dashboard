
module.exports = function(config) {
    require('./' + config.store.use)(config.store.adapters[config.store.use]);
};
