var Item = require('./lib/item');
var fs = require('fs');
var path = require('path');

module.exports = function(paths, type) {
    var args = _.toArray(arguments);
    type = _.last(args);
    paths = args;
    if(_.includes([
        Item.TYPE_DIRECTORY,
        Item.TYPE_FILE,
        Item.TYPE_SYMLINK
    ], type)) {
        paths = _.initial(args);
    }else{
        type = null;
    }
    var root = _.chain(paths)
        .compact()
        .map(path.normalize)
        .join(path.sep).value();
    if(!path.isAbsolute(root)) {
        root = path.join(path.dirname(process.mainModule.filename), root);
    }

	var item = new Item(root);
	return item.toInstance(type);
}

module.exports.TYPE_DIRECTORY = Item.TYPE_DIRECTORY;
module.exports.TYPE_FILE = Item.TYPE_FILE;
module.exports.TYPE_SYMLINK = Item.TYPE_SYMLINK;