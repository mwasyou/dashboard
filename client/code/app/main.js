
var
    EventEmitter2 = require('eventemitter2').EventEmitter2;

var
    assetSeq = Number(Date.now()),
    assets = {
        loaded: {},
        loading: new EventEmitter2()
    },
    modules = {
        loaded: {},
        loading: new EventEmitter2(),
        building: new EventEmitter2()
    },
    moduleBuildSeq = 0;

var App = function() {

    function loadModuleAssets(moduleConfig, cb) {
        var assetSeqId, assetCodeTBD, onError, onSuccess;

        if (moduleConfig['assets']) {

            assetSeqId = assetSeq++;

            if (moduleConfig.assets['css']) {
                moduleConfig.assets['css'].forEach(function(assetCss) {
                    if (!assets.loaded[assetCss]) {
                        assets.loaded[assetCss] = true;
                        $("head link[rel='stylesheet']")
                            .last()
                            .after('<link href="/amd/asset/'+assetCss+'?ts='+Number(Date.now())+'" media="screen" rel="stylesheet" type="text/css">');
                    }
                });
            }
            if (moduleConfig.assets['code']) {
                assetCodeTBD = moduleConfig.assets['code'].length;
                assets.loading.many('code-'+assetSeqId, assetCodeTBD, function() {
                    assetCodeTBD--;
                    if (assetCodeTBD <= 0) {
                        return cb();
                    }
                });
                moduleConfig.assets['code'].forEach(function(assetCode) {
                    if (!assets.loaded[assetCode]) {
                        return $.ajax({
                            url: "/amd/asset/" + assetCode,
                            type: 'GET',
                            cache: false,
                            dataType: 'script',
                            success: function() {
                                assets.loaded[assetCode] = true;
                                return assets.loading.emit('code-'+assetSeqId);
                            },
                            error: function() {
                                console.error('Error: Can not asynchronously load "' + assetCode + '"');
                                console.debug(arguments);
                                return assets.loading.emit('code-'+assetSeqId);
                            }
                        });
                    } else {
                        return assets.loading.emit('code-'+assetSeqId);
                    }
                });
            } else {
                return cb();
            }
        } else {
            return cb();
        }
    }

    function loadModuleCode(moduleName, moduleConfig, cb) {
        modules.loading.once(moduleName, cb);
/*
        //This approach wont use the SocketStream cache and will minify on every request and Memoryleak will occure on server
        ss.load.code('/modules' + moduleConfig.path, function() {
            require(moduleName+'/templates');
            require(moduleName+'/main').load(moduleConfig, function() {
                modules.loaded[moduleName] = moduleConfig;
                return modules.loading.emit(moduleName);
            });
        });
*/

        if (modules.loaded[moduleName]) {
            return modules.loading.emit(moduleName);
        }

        return $.ajax({
            url: "/_serve/code?" + 'modules' + moduleConfig.path,
            type: 'GET',
            cache: true, //If the cache is false the SocketStream will always append the output to its internal cache and memoryleak will occure
            dataType: 'script',
            success: function() {
                require(moduleName+'/templates');
                require(moduleName+'/main').load(moduleConfig, function() {
                    modules.loaded[moduleName] = moduleConfig;
                    return modules.loading.emit(moduleName);
                });
            },
            error: function() {
                console.error('Error: Could not asynchronously load ' + moduleName);
                return console.log(arguments);
            }
        });
    }

    function buldModuleInstance(moduleName, container, moduleConfig, cb) {
        var moduleBuildSeqId = ++moduleBuildSeq, moduleInstance;
        modules.building.once(moduleName+'#'+moduleBuildSeqId, function() {
            cb(moduleInstance);
        });
        require(moduleName+'/main').build(container, moduleBuildSeqId, moduleConfig, function(instance) {
            moduleInstance = instance;
            return modules.building.emit(moduleName+'#'+moduleBuildSeqId);
        });
    }

    return {
        isModuleLoaded: function(moduleName) {
            return modules.loaded[moduleName] ? true : false;
        },
        isModuleLoading: function(moduleName) {
            return modules.loading.listeners(moduleName).length > 0;
        },
        getModuleConfig: function(moduleName) {
            return this.isModuleLoaded(moduleName) ? modules.loaded[moduleName] : false;
        },
        loadModule: function(moduleName, cbs) {
            if (this.isModuleLoading(moduleName)) {
                throw new Error('Module "'+moduleName+'" is already loading!');
            }
            if (this.isModuleLoaded(moduleName)) {
                throw new Error('Module "'+moduleName+'" is already loaded.');
            }

            console.debug('%cLoading module: %c %s ', 'color:blue;', 'color:black; background-color:yellow;', moduleName);

            ss.rpc('modules.getConfig', moduleName, function(moduleConfig) {
                if (typeof moduleConfig === 'object') {
                    if (cbs && cbs.beforeLoad && typeof cbs.beforeLoad === "function") {
                        moduleConfig = cbs.beforeLoad(moduleConfig) || moduleConfig;
                    }
                    if (!moduleConfig['assets']) {
                        moduleConfig['assets'] = {};
                    }
                    if (!moduleConfig.assets['code']) {
                        moduleConfig.assets['code'] = [];
                    }
                    moduleConfig.assets.code.push('templates/modules'+moduleConfig.path+'.tpl');
                    loadModuleAssets(moduleConfig, function() {
                        loadModuleCode(moduleName, moduleConfig, function() {
                            console.debug('%cLoaded module : %c %s ', 'color:blue;', 'color:black; background-color:yellow;', moduleName);
                            if (typeof cbs === "function") {
                                return cbs(moduleConfig);
                            }
                            if (cbs && cbs.afterLoad && typeof cbs.afterLoad === "function") {
                                return cbs.afterLoad(moduleConfig);
                            }
                        });
                    });
                } else {
                    console.debug('%c ERROR: Can not load the configuration for module "%s" ', 'color:yellow; background-color:red;', moduleName);
                }
            });
        },
        createModuleInstance: function(moduleName, container, cb) {
            if (this.isModuleLoading(moduleName)) {
                throw new Error('Module "'+moduleName+'" is still loading!');
            }
            if (!this.isModuleLoaded(moduleName)) {
                throw new Error('Module "'+moduleName+'" is not being loaded yet.');
            }
            var moduleConfig = this.getModuleConfig(moduleName);
            console.debug('%cCreating module instance: %c %s ', 'color:green;', 'color:black; background-color:yellow;', moduleName);
            buldModuleInstance(moduleName, container, moduleConfig, function(moduleInstance) {
                console.debug('%cCreated module instance : %c %s ', 'color:green;', 'color:black; background-color:yellow;', moduleName);
                if (typeof cb === "function") {
                    return cb(moduleInstance);
                }
            });
        },
        //May be unload module?
    };
};


ss.registerApi('app', new App());


jQuery(function() {

    ss.app.loadModule('/dashboard', function(conf) {
        ss.app.createModuleInstance('/dashboard', $('#stage'), function(moduleInstance) {
            //console.log(moduleInstance);
            //...
        });
    });

});
