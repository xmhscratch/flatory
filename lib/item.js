'use strict'

const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const Directory = require('./directory')
const File = require('./file')

const ITEM_TYPE_DIRECTORY = 0
const ITEM_TYPE_FILE = 1
const ITEM_TYPE_SYMLINK = 2

class Item {

    constructor (basePath) {
        var absPath = (false === path.isAbsolute(basePath))
            ? path.join(process.cwd(), basePath)
            : basePath
        this.root = path.normalize(absPath)
        
        var type = this.getType()
        try {
            fs.accessSync(this.root)
            
            if(_.isEqual(type, ITEM_TYPE_DIRECTORY)) {
                return new Directory(this.root)
            }else if(_.isEqual(type, ITEM_TYPE_FILE)) {
                return new File(this.root)
            }else{
                return
            }
        }catch(e) {
            return
        }
        return
    }

    getType () {
        var match = /^(.*[\/\\])([^/]*)$/g.exec(this.root)
        var isDirPath = !/.*\.(\w{1,})$/gi.test(match[2])
        var directory = isDirPath ? path.join(match[1], match[2]) : match[1]
        var filename = !isDirPath ? match[2] : null

        if(!isDirPath) {
            return ITEM_TYPE_FILE
        }
        mkdirp.sync(directory)
        return ITEM_TYPE_DIRECTORY
    }
}

Item.TYPE_DIRECTORY = ITEM_TYPE_DIRECTORY
Item.TYPE_FILE = ITEM_TYPE_FILE
Item.TYPE_SYMLINK = ITEM_TYPE_SYMLINK

module.exports = Item