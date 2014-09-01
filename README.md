# express-rest-resource

An [express] 4+ `Router` representing a RESTful resource.

Originally written to help get prototype apps running anywhere quickly and hassle-free - a main reason why support for [nedb]'s in-memory or file-based databases was built-in.

Provides standard RESTful routes, mapping to database calls:

    GET     /       ->  list all
    GET     /:id    ->  read one
    POST    /       ->  insert
    PUT     /:id    ->  update
    DELETE  /:id    ->  remove

This router can be mounted at any path in your [express] app.
Routes behave RESTfully - responding with meaningfull HTTP status codes, validating accepts and content types, etc.

## Database dependency
For modularity, a database implementation is not built-in.
Instead, a database (or collection) must be injected as a dependency.
Expects the injected database to implement a subset of the [MongoDB] API.
Supported databases include: [nedb], [MongoDB].

## Examples

```js
var express = require('express');
var expressRestResource = require('express-rest-resource');
var nedb = require('nedb');

var app = express();

var personDb = new nedb();
var postDb = new nedb();

app.use('/api/person', expressRestResource({ db: personDb }));
app.use('/api/post', expressRestResource({ db: postDb }));

app.listen();
```

Now, a `POST` to `http://localhost:3000/api/person` with JSON body would create and persist a new person resource.


[express]: https://github.com/strongloop/express
[nedb]: https://github.com/louischatriot/nedb#inserting-documents
[mongodb]: https://github.com/mongodb/node-mongodb-native
