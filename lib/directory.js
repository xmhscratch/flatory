const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const Promise = require('bluebird')

const INode = require('./i-node')

class Directory extends INode {

    constructor(root, stat) {
        super(root, stat)

        this.type = 0
        return this
    }

    ensure(mode, done) {
        if (!done || !_.isFunction(done)) {
            return new Promise((resolve, reject) => {
                return this.ensure(mode, (error, results) => {
                    if (error) return reject(error)
                    return resolve(results)
                })
            })
        }

        return mkdirp(this.root, mode || '0770', done)
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
            deep: Number.MAX_VALUE,
        })

        const directoryItems = {}
        const excludePattern = '.*(' + options.excludes.join('|') + ').*'

        return (function collectItems(srcPath) {
            const level = _.chain(
                path.relative(this.root, srcPath).split(path.sep)
            ).compact().size().value()

            if (level >= options.deep) {
                return directoryItems
            }

            const items = (new Directory(srcPath)).getChildItems(true)

            directoryItems[srcPath] = _.filter(items, (item) => {
                return fs.statSync(item).isFile()
                    && this._parseFilter(filter, item)
            })

            const directories = _.filter(items, (item) => {
                return fs.statSync(item).isDirectory()
                    && _.isEqual(new RegExp(excludePattern, 'g').test(item), false)
            })
            _.forEach(directories, collectItems.bind(this))

            return directoryItems
        }.bind(this))(this.root)
    }

    ensureSync(mode) {
        return mkdirp.sync(this.root, mode || '0770')
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
