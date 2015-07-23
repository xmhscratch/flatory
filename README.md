# flatory
scandir with flat directory style

# What is flat directory structure?
```
  (root)
	│   app.js
	│
	├───controllers
	│       comments.js
	│       index.js
	│       users.js
	│
	├───helpers
	│       dates.js
	│
	├───middlewares
	│       auth.js
	│       users.js
	│
	├───models
	│       comment.js
	│       user.js
	│
	├───public
	│   ├───css
	│   ├───img
	│   └───libs
	└───views
	    │   index.jade
	    │
	    ├───comments
	    │       comment.jade
	    │
	    └───users
```

## Installation
	`$ npm install flatory`

## Usage
```js
var flatory = require('flatory');

var fspath = flatory('./test');
fspath.getChildItems();

```

## API

## Authors
[xmhscratch](http: //github.com/xmhscratch)

## License
Licensed under the MIT license.
