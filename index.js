const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const Item = require('./lib/item')

module.exports = function() {
    let args = _.toArray(arguments)

    let paths = args
    let options = _.last(args)
    if (options && _.isObject(options)) {
    	paths = _.initial(args)
    }

    let basePath = _.chain(paths)
        .compact()
        .map(path.normalize)
        .join(path.sep).value()
    if(!path.isAbsolute(basePath)) {
        basePath = path.join(path.dirname(process.mainModule.filename), basePath)
    }
	return new Item(basePath, options)
}

module.exports.TYPE_DIRECTORY = Item.TYPE_DIRECTORY
module.exports.TYPE_FILE = Item.TYPE_FILE
module.exports.TYPE_SYMLINK = Item.TYPE_SYMLINK
