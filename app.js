
const
    APPLICATION_VERSION = '0.1.3';

var env;

process.env.SS_ENV =
process.env.APP_ENV =
process.env.NODE_ENV =
env = (process.env.APP_ENV || process.env.SS_ENV || process.env.NODE_ENV || 'production');

if (!require('fs').existsSync('./config.js')) {
    console.error('\nERROR: Configuration ("config.js") not found. Rename "config.sample.js" and set appropriate settings!\n');
    process.exit(1);
}

var
    config = require('./utils').buildConfig(require('./config'), env);

console.log('Starting Application'.green, APPLICATION_VERSION, 'in'.green, env,  'mode...'.green);

//Application Bootstrap

var
    ss = require('socketstream'),
    path = require('path');

ss.api.add('utils', require('./utils'));
//ss.api.add('db', require('./server/db')(config.db));
ss.api.add('acl', require('./server/acl')(config.acl));
ss.api.add('modules', require('./server/modules'));

require('./server/transport')(config.transport);
require('./server/session')(config.session);

ss.events.on('server:start', function() {
    ss.api.modules.load(config.modules);
});

ss.client.formatters.add(require('ss-less'));

ss.client.define('app', {
    'view': 'app.html',
    'tmpl': [],
    'css': [
        'bootstrap/bootstrap.less',
        'bootstrap-progressbar.less',
    ],
    'code': [
        'libs/jquery.min.js',
        'libs/bootstrap.min.js',
        'libs/jquery.smartresize.min.js',
        'libs/bootstrap-progressbar.js',
        'app',
    ],
});

ss.http.route('/', function(req, res) {
    res.serveClient('app');
});

ss.client.options.packAssets = process.env['SS_PACK'] || false;

if (env === 'production' || ss.client.options.packAssets) {
    ss.client.options.packAssets = true;
    ss.client.packAssets({keepOldFiles: true});
}

if (env === 'production') {
    ss.api.log = function() {};
}

var server = require('http').Server(ss.http.middleware);
server.listen(config.http.port);

ss.start(server);
