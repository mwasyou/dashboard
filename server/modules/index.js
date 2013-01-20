
var
    utils = require('./../../utils.js'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    qs = require('querystring'),
    asset = require('./asset');

var
    mxModule = {},
    mxPathMapings = {},
    clientIdSeq = Number(Date.now()),
    assetCacheOutput = {},
    assetCacheType = {};

module.exports.mx = mxModule;

module.exports.load = function(modules) {
    console.log('Loading modules...'.green);

    var ss = require('socketstream');

    var moduleCanonicalNS, moduleConfig, moduleConfigFile, modulesDir;
    modulesDir = path.join(ss.root, ss.client.options.dirs.code, 'modules');
    var modulesCount = 0;
    modules.forEach(function(mod) {
        moduleCanonicalNS = (mod.ns + '/' + mod.name).replace(/\/\//g, '/');
        moduleConfigFile = path.join(
            modulesDir,
            mod.path,
            moduleCanonicalNS.replace('/\//g', path.sep),
            'module-config.js'
        );
        if (fs.existsSync(moduleConfigFile)) {
            if (mxModule[moduleCanonicalNS]) {
                throw new Error('Duplicated Module Namespace "'+moduleCanonicalNS+'"');
            }
            moduleConfig = require(moduleConfigFile);
            mxModule[moduleCanonicalNS] = utils.extend(moduleConfig, utils.extend({cs: moduleCanonicalNS}, mod));

            mxModule[moduleCanonicalNS].id = ++clientIdSeq;
            mxPathMapings[mod.path] = moduleCanonicalNS;
            modulesCount++;
        } else {
            console.log('WARNING: Module "%s" has no configuration file!'.yellow, moduleCanonicalNS);
        }
    });

    console.log('('.green, modulesCount.toString().inverse, ') Modules loaded.'.green);

    var ast = asset(ss.api, ss.client.options);

    ss.http.router.on('/amd/asset', function(req, res) {

        if (typeof req.session.userId === "undefined") {
            return utils.serve.request.forbidden(res);
        }

        try
        {
            var params, _path, thisUrl;
            thisUrl = url.parse(req.url);
            params = qs.parse(thisUrl.query);
            _path = req.url.split('?')[0];
            _path = _path.replace('/amd/asset/', '/');

            if (ss.client.options.packAssets && assetCacheOutput[_path] && assetCacheType[_path]) {
                return utils.serve[assetCacheType[_path]](assetCacheOutput[_path], res);
            } else {
                return ast.auto(_path, {
                    pathMapings: mxPathMapings,
                    compress: ss.client.options.packAssets
                }, function(output, type) {
                    if (ss.client.options.packAssets) {
                        assetCacheType[_path] = type;
                        assetCacheOutput[_path] = output;
                    }
                    return utils.serve[type](output, res);
                });
            }
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                return utils.serve.request.notFound(res);
            } else {
                if (ss.env === 'development') {
                    throw e;
                } else {
                    return utils.serve.request.serverError(res);
                }
            }
        }
    });
};
