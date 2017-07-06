'use strict'

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

    constructor(basePath, options) {
        let opts = _.default(options || {}, {
            type: this.getType()
        })

        let absPath = (false === path.isAbsolute(basePath)) ? path.join(process.cwd(), basePath) : basePath
        this.root = path.normalize(absPath)

        const { type } = opts
        try {
            fs.accessSync(this.root)

            if (_.isEqual(type, ITEM_TYPE_DIRECTORY)) {
                return new Directory(this.root)
            } else if (_.isEqual(type, ITEM_TYPE_FILE)) {
                return new File(this.root)
            } else {
                return
            }
        } catch (e) {
            if (_.isEqual(type, ITEM_TYPE_FILE)) {
                fs.openSync(this.root, 'w')
                return new File(this.root)
            }
            return
        }
    }

    getType() {
        let match = /^(.*[\/\\])([^/]*)$/g.exec(this.root)
        let isDirPath = !/.*\.(\w{1,})$/gi.test(match[2])
        let directory = isDirPath ? path.join(match[1], match[2]) : match[1]
        let filename = !isDirPath ? match[2] : null

        if (!isDirPath) {
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
