'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

class Directory {

    constructor (root, stat) {
        this.type = 0

        this.root = root
        this.stat = stat || fs.statSync(root)

        return this
    }

    ensure (mode) {
        return mkdirp.sync(this.root, mode || '0770')
    }

    move (newPath, done) {
        return fs.rename(this.root, newPath, done)
    }

    moveAsync (newPath, done) {
        return fs.renameAsync(this.root, newPath)
    }

    delete () {
        return rimraf.sync(this.root)
    }

    deleteAsync (done) {
        return rimraf(this.root, done)
    }

    joinPaths (dirs) {
        dirs = _.chain(arguments)
            .toArray()
            .compact()
            .flatten()
            .value()
        dirs.unshift(this.root)
        return path.join.apply(this, dirs)
    }

    getChildItems (filter) {
        var _super = this
        return _(fs.readdirSync(this.root))
            .chain()
            .map(function(item) {
                return path.resolve(process.cwd(), _super.root, item)
            })
            .filter(function(item) {
                return _super._parseFilter(filter, item)
            })
            .value()
    }

    getItems (filter, options) {
        options = (options || {})
        _.defaults(options, {
            excludes: ['.git', '.svn', 'node_modules'],
            deep: Number.MAX_VALUE
        })

        var _super = this, directoryItems = {}, level = 1
        var excludePattern = new RegExp('.*('+options.excludes.join('|')+').*', 'g')

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
                return fs.statSync(item).isDirectory() && _.isEqual(excludePattern.test(item), false)
            })

            _.forEach(directories, collectItems)

            return directoryItems
        })(this.root)
    }

    _parseFilter (filter, item) {
        if (_.isFunction(filter)) return _(filter(item)).isEqual(true)
        if (_.isRegExp(filter)) return (new RegExp(filter)).test(item)
        return true
    }
}

module.exports = Directory
