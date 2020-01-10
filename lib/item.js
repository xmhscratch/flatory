const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mkdirp = require('mkdirp')

const Directory = require('./directory')
const File = require('./file')

const ITEM_TYPE_DIRECTORY = 0
const ITEM_TYPE_FILE = 1
const ITEM_TYPE_SYMLINK = 2

class Item {

    constructor(basePath, opts) {
        const absPath = (false === path.isAbsolute(basePath))
            ? path.join(process.cwd(), basePath)
            : basePath
        this.root = path.normalize(absPath)

        const type = this.getType()

        opts = (opts || {})
        _.defaults(opts, { type })

        try {
            fs.accessSync(this.root)
        } catch (e) {
            if (_.isEqual(type, ITEM_TYPE_FILE)) {
                let fileDir = path.dirname(this.root)

                mkdirp.sync(fileDir, '0770')
                fs.openSync(this.root, 'w')
            }
        }

        if (_.isEqual(type, ITEM_TYPE_DIRECTORY)) {
            return new Directory(this.root)
        } else if (_.isEqual(type, ITEM_TYPE_FILE)) {
            return new File(this.root)
        }

        return
    }

    getRootPath() {
        return this.root
    }

    getType() {
        const match = /^(.*[\/\\])([^/]*)$/g.exec(this.root)
        const isDirPath = !/.*\.(\w{1,})$/gi.test(match[2])

        if (!isDirPath) {
            return ITEM_TYPE_FILE
        }
        return ITEM_TYPE_DIRECTORY
    }
}

Item.TYPE_DIRECTORY = ITEM_TYPE_DIRECTORY
Item.TYPE_FILE = ITEM_TYPE_FILE
Item.TYPE_SYMLINK = ITEM_TYPE_SYMLINK

module.exports = Item
