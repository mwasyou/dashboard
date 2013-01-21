# NodeCollab Dashboard

> _NOTE: This is proof of concept and is not recommanded for production usage_

This is an extended exmaple of how Realtime Dashboard can be made using [SocketStream 0.3.x](https://github.com/socketstream/socketstream).

## Setup guide

1. `npm install`
2. Copy/Rename `config.sample.js` to `config.js`
3. Run the application as `node app.js`

> Use `APP_ENV=development` environment variable to start the application in development mode and/or SS_PACK=1 to force repack client code.

Running the application in production mod will show that message:
> Warning: connection.session() MemoryStore is not designed for a production environment, as it will leak memory, and will not scale past a single process.

If you want to use a MongoDB store for the sessions you must enable the databse layer:

1. Uncomment `ss.api.add('db', require('./server/db')(config.db));` in `app.js`
2. Install `"mongodb": "=1.0.2", "mongoose": "=3.4.0", "connect-mongo": "=0.2.0"` 
3. Set `session.store.use="mongo"` in the `config.js`. 
4. Configure the MongoDB connection in the `db` section of the the `config.js` 

To access the dashboard you must specify an access (API) key, stored into `acl.xml`.

Example:

    http://localhost:8400/?apikey=49DBFA41BC738D2332F3D4560BAB1A89

---

For the purpose of embeding this dashboard into a web app with an iframe (modern browsers only):

```html
<iframe id="dashboard" sandbox="allow-scripts allow-same-origin allow-top-navigation" src="//mydomain:8400/?apikey=49DBFA41BC738D2332F3D4560BAB1A89" width="100%" frameborder="0" scrolling ="auto" style="height: 100%;">
  <p>Your browser does not support iframes.</p>
</iframe>
```
