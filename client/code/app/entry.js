
window.ss = require('socketstream');
window.hrget = {};
window.location.href.slice(window.location.href.indexOf('?') + 1).split('&').forEach(function(v) {
    var n = v.split('=');
    window.hrget[n[0]] = n[1] || null;
});
window.onbeforeunload = function () {ss.rpc('app.logout', null, function(success) {});};

ss.server.on('disconnect', function() {
    console.log('Connection down :(');
});

ss.server.on('reconnect', function() {
    console.log('Connection back up :)');
});

ss.server.on('ready', function() {
    ss.rpc('app.login', hrget.apikey || false, function(success) {
        if (true === success) {
            require('/main');
        } else {
            if (false === success) {
                alert('Error: Not loged in!');
            } else {
                alert('Error: ' + success);
            }
        }
    });
});
