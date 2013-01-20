# NodeCollab Dashboard

> _NOTE: This is proof of concept and is not recommanded for production usage_

This is an extended exmaple of how Realtime Dashboard can be made using [SocketStream](https://github.com/socketstream/socketstream).

### Setup guide

To run the dashboard you need to execute `npm install` and copy/rename `config.sample.js` to `config.js`.

If you want to use a MongoDB store for the sessions you must uncomment `ss.api.add('db', require('./server/db')(config.db));` in `app.js` file and install `"mongodb": "=1.0.2", "mongoose": "=3.4.0", "connect-mongo": "=0.2.0"` also set `session.store.use="mongo"` in the `config.js`. The configuration for the MongoDB is set in the `db` section of the the `config.js` file.

To access the dashboard you must specify an access (API) key stored in `acl.xml`.

Example:

    `http://localhost:8400/?apikey=49DBFA41BC738D2332F3D4560BAB1A89`

For the purpose of embeding this dashboard into a web app with an iframe (modern browsers only):

```html
<iframe id="dashboard" sandbox="allow-scripts allow-same-origin allow-top-navigation" src="//mydomain:8400/?apikey=49DBFA41BC738D2332F3D4560BAB1A89" width="100%" frameborder="0" scrolling ="auto" style="height: 100%;">
  <p>Your browser does not support iframes.</p>
</iframe>
```
