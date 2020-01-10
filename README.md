# flatory
useful file & directory utility

## Installation
    `$ npm install flatory`

## Usage
**Experiment directory structure**
```
  (root)
    │   index.html
    │
    ├───app
    │   │   app.module.js
    │   │   app.routers.js
    │   │
    │   ├───components
    │   │   ├───blog
    │   │   │       blogController.js
    │   │   │       blogService.js
    │   │   │       blogView.html
    │   │   │
    │   │   └───home
    │   │           homeController.js
    │   │           homeService.js
    │   │           homeView.html
    │   │
    │   └───shared
    │       ├───articles
    │       │       articleDirective.js
    │       │       articleView.html
    │       │
    │       └───sidebar
    │               sidebarDirective.js
    │               sidebarView.html
    │
    └───assets
        ├───css
        ├───img
        ├───js
        └───libs
```

**How to use**
```js

var __ = require('flatory');

/* 
 * Get all child items in the targeted directory 
 * (return): 
    {
        '/root': [
            '/root/index.html'
        ],
        '/root/assets': [],
        '/root/assets/libs': [],
        '/root/assets/js': [],
        '/root/assets/img': [],
        '/root/assets/css': [],
        '/root/app': [
            '/root/app/app.module.js',
            '/root/app/app.routers.js'
        ],
        '/root/app/shared': [],
        '/root/app/shared/sidebar': [
            '/root/app/shared/sidebar/sidebarDirective.js',
            '/root/app/shared/sidebar/sidebarView.html'
        ],
        '/root/app/shared/articles': [
            '/root/app/shared/articles/articleDirective.js',
            '/root/app/shared/articles/articleView.html'
        ],
        '/root/app/components': [],
        '/root/app/components/home': [
            '/root/app/components/home/homeController.js',
            '/root/app/components/home/homeService.js',
            '/root/app/components/home/homeView.html'
        ],
        '/root/app/components/blog': [
            '/root/app/components/blog/blogController.js',
            '/root/app/components/blog/blogService.js',
            '/root/app/components/blog/blogView.html'
        ]
    }
 * (params): filter[Function], options[Object]
 */
var result = __('/root').getItems(function(item) {
    return true;
}, {
    // exclude searched directory
    excludes: ['.git', '.svn'],
    // directory deep down max level 100
    deep: 100
});
console.log(result);

/* 
 * Get all child items directly from targeted directory 
 * (return): [ '/root/app', '/root/assets', '/root/index.html' ]
 * (params): filter[Function]
 */
var result = __('/root').getChildItems(function(item) {
    return true;
});
console.log(result);

/* 
 * Copy source file to destination file
 * (return): boolean
 * (params): path[String], options[Object]
 */
var result = __('/root/index.js').copySync('/root/test.js', {
    encoding: 'utf8',
    mode: 0700
});
console.log(result);

/* 
 * Copy source file to destination file asynchronous
 * (return): boolean
 * (params): path[String], options[Object], callback[Function]
 */
__('/root/index.js').copy('/root/test.js', {
    encoding: 'utf8',
    mode: 0700
}, function(error, data) {
    console.log(arguments);
});

/* 
 * Make sure directory exist
 * (return): boolean
 */
var result = __('/root/temp').ensureSync();
console.log(result);

/* 
 * Make sure directory exist asynchronous
 * (return): boolean
 * (params): callback[Function]
 */
__('/root/temp').ensure(console.log);
```

## Authors
[xmhscratch](http: //github.com/xmhscratch)

## License
Licensed under the MIT license.