var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var Directory = require('./directory');
var File = require('./file');

var ITEM_TYPE_DIRECTORY = 0;
var ITEM_TYPE_FILE = 1;
var ITEM_TYPE_SYMLINK = 2;

var Item = function(basePath) {
    var absPath = (false === path.isAbsolute(basePath))
        ? path.join(process.cwd(), basePath)
        : basePath;
    this.root = path.normalize(absPath);
    
    var type = this.getType();
    try {
        fs.accessSync(this.root);
        
        if(_.isEqual(type, ITEM_TYPE_DIRECTORY)) {
            return new Directory(this.root);
        }else if(_.isEqual(type, ITEM_TYPE_FILE)) {
            return new File(this.root);
        }else{
            return;
        }
    }catch(e) {
        return;
    }
    return;
}

Item.prototype = {
    root: null,
    
    getType: function() {
        var match = /^(.*[\/\\])([^/]*)$/g.exec(this.root);
        var isDirPath = !/.*\.(\w{1,})$/gi.test(match[2]);
        var directory = isDirPath ? path.join(match[1], match[2]) : match[1];
        var filename = !isDirPath ? match[2] : null;

        if(!isDirPath) {
            return ITEM_TYPE_FILE;
        }
        mkdirp.sync(directory);
        return ITEM_TYPE_DIRECTORY;
    }
}

Item.TYPE_DIRECTORY = ITEM_TYPE_DIRECTORY;
Item.TYPE_FILE = ITEM_TYPE_FILE;
Item.TYPE_SYMLINK = ITEM_TYPE_SYMLINK;

module.exports = Item;