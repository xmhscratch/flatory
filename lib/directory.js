'use strict'

const fs = require('fs')
const path = require('path')

const _ = require('lodash')
const mkdirp = require('mkdirp')

const INode = require('./i-node')

class Directory extends INode {

    constructor(root, stat) {
        super(root, stat)

        this.type = 0
        return this
    }

    ensure(mode) {
        return mkdirp.sync(this.root, mode || '0770')
    }

    getChildItems(filter) {
        return _(fs.readdirSync(this.root))
            .chain()
            .map((item) => {
                return path.resolve(process.cwd(), this.root, item)
            })
            .filter((item) => {
                return this._parseFilter(filter, item)
            })
            .value()
    }

    getItems(filter, options) {
        options = (options || {})
        _.defaults(options, {
            excludes: ['\\.git', '\\.svn', 'node_modules'],
            deep: Number.MAX_VALUE
        })

        var _super = this,
            directoryItems = {},
            level = 1
        var excludePattern = '.*(' + options.excludes.join('|') + ').*'

        return (function collectItems(srcPath) {
            var level = _.chain(
                path.relative(_super.root, srcPath).split(path.sep)
            ).compact().size().value()

            if (level >= options.deep) return

            var items = (new Directory(srcPath)).getChildItems(true)

            directoryItems[srcPath] = _.filter(items, function(item) {
                return fs.statSync(item).isFile() && _super._parseFilter(filter, item)
            })

            var directories = _.filter(items, function(item) {
                return fs.statSync(item).isDirectory() && _.isEqual(new RegExp(excludePattern, 'g').test(item), false)
            })

            _.forEach(directories, collectItems)
            return directoryItems
        })(this.root)
    }

    _parseFilter(filter, item) {
        if (_.isFunction(filter)) {
            return _(filter(item)).isEqual(true)
        }
        if (_.isRegExp(filter)) {
            return (new RegExp(filter)).test(item)
        }
        return true
    }
}

module.exports = Directory