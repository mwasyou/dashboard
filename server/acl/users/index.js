
var xml2js = require('xml2js'),
    fs = require('fs');

var apiKeys = [],
    keys_file,
    keys_reload_interval;

var reloadAPIKeys = function() {
    var coApiKeys = [];
    apiKeys.forEach(function(v) {
        coApiKeys.push(v.role);
        coApiKeys.push(v.hash);
    });
    var parser = new xml2js.Parser();
    fs.readFile(keys_file, function(err, data) {
        parser.parseString(data, function (err, result) {
            if (null === err && undefined !== result.keys && undefined !== result.keys.key) {
                var newAPIKeys = [];
                var cnApiKeys = [];
                for (var key in result.keys.key) {
                    newAPIKeys.push(result.keys.key[key]);
                    cnApiKeys.push(result.keys.key[key].role);
                    cnApiKeys.push(result.keys.key[key].hash);
                }
                apiKeys = newAPIKeys;
                if (cnApiKeys.toString().trim() !== coApiKeys.toString().trim()) {
                    console.log('>'.cyan, ("The API keys were reloaded successfully.").yellow);
                }
            }
        });
    });
};

module.exports = function(config) {
    var c = config || {};

    keys_file = c.keys_file || null;
    keys_reload_interval = c.keys_reload_interval || 300000;

    reloadAPIKeys();
    setInterval(reloadAPIKeys, keys_reload_interval);

    return {
        keys: apiKeys,
        findByHash: function(hash) {
            var result = false;

            apiKeys.forEach(function(v) {
                if (hash === v.hash) {
                    result = v;
                }
            });

            return result;
        },
    };
};
