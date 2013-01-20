# NodeCollab Dashboard

_NOTE: This is just a proof of concept (application design)_

This is an extended exmaple of how Realtime Dashboard could be made using ([SocketStream](https://github.com/socketstream/socketstream)) for the purpose of NodeCollab's in near future.

### Setup guide

To run the dashboard you need to execute `npm install` and copy/rename `config.sample.js` to `config.js`. If you want to use a MongoDB store for the sessions you must uncomment `ss.api.add('db', require('./server/db')(config.db));` in `app.js` file then install `"mongodb": "=1.0.2", "mongoose": "=3.4.0", "connect-mongo": "=0.2.0"` and set `session.store.use="mongo"`. The configuration for the MongoDB is set in the `db` section of the the `config.js` file.
