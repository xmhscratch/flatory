var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Item = require('./lib/item');

module.exports = function(paths) {
    paths = _.toArray(arguments);
    var basePath = _.chain(paths)
        .compact()
        .map(path.normalize)
        .join(path.sep).value();
    if(!path.isAbsolute(basePath)) {
        basePath = path.join(path.dirname(process.mainModule.filename), basePath);
    }
	return new Item(basePath);
}

module.exports.TYPE_DIRECTORY = Item.TYPE_DIRECTORY;
module.exports.TYPE_FILE = Item.TYPE_FILE;
module.exports.TYPE_SYMLINK = Item.TYPE_SYMLINK;