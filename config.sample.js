
var config = [];

//Production Environment Config
config['production'] = {
    http: {
        port: 8400,
    },
    acl: {
        users: {
            keys_file: __dirname + '/acl.xml',
            keys_reload_interval: 300000,
        },
    },
    session: {
        store: {
            use: "memory",
            adapters: {
                mongo: {
                    options: {
                        collection: 'sessions',
                    },
                },
                memory: {

                },
            },
        },
    },
    transport: {
        use: "socketio",
        adapters: {
            socketio: {
                options: {
                    client: {
                        'transports': ['websocket'],
                        'try multiple transports': false,
                    },
                    server: function(io) {
                        io.set('transports', ['websocket']);
                        io.set('log level', 1);
                    },
                },
            },
        },
    },
    modules: [
        {
            name: "dashboard",
            path: "/dashboard",
            ns: "/",
        },
        {
            name: "cpu",
            path: "/dashboard-widgets/cpu",
            ns: "/dashboard/widgets",
        },
        {
            name: "chat",
            path: "/dashboard-widgets/chat",
            ns: "/dashboard/widgets",
        },
    ]
};

//Development Environment Config
config['development:production'] = {
    transport: {
        adapters: {
            socketio: {
                options: {
                    server: function(io) {
                        io.set('transports', ['websocket']);
                        io.set('log level', 4);
                    },
                },
            },
        },
    },
};

module.exports = config;
