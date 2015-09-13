var Item = require('./lib/item');

module.exports = function(root, type) {
	var item = new Item(root);
	return item.toInstance(type);
}

module.exports.TYPE_DIRECTORY = Item.TYPE_DIRECTORY;
module.exports.TYPE_FILE = Item.TYPE_FILE;
module.exports.TYPE_SYMLINK = Item.TYPE_SYMLINK;