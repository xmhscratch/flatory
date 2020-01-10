const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const Promise = require('bluebird')

const INode = require('./i-node')

class File extends INode {

    constructor(root, stat) {
        super(root, stat)

        this.type = 1
        return this
    }

    read(opts, done = _.noop) {
        if (!done || !_.isFunction(done)) {
            return Promise.promisify(this.read.bind(this))
        }

        opts = (opts || {})
        _.defaults(opts, { encoding: null })

        const { encoding } = opts
        return fs.readFile(this.root, { encoding }, (error, content) => {
            if (error) {
                return done(error, null)
            }
            return done(null, content)
        })
    }

    write(content, opts, done = _.noop) {
        if (!done || !_.isFunction(done)) {
            return Promise.promisify(this.write.bind(this))
        }

        opts = (opts || {})
        _.defaults(opts, { encoding: null })

        const dirPath = path.dirname(this.root)
        return mkdirp(dirPath, (error) => {
            if (error) {
                return done(error)
            }

            const { encoding } = opts
            return fs.writeFile(this.root, content, { encoding }, done)
        })
    }

    copy(destPath, opts, done = _.noop) {
        if (!done || !_.isFunction(done)) {
            return Promise.promisify(this.copy.bind(this))
        }

        opts = (opts || {})
        _.defaults(opts, { encoding: null, mode: '0666' })

        const { encoding, mode } = opts
        destPath = this._outputFilePath(destPath)

        return this.readAsync({ encoding }, (error, content) => {
            if (error) {
                return done(error, null)
            }

            const INodeItem = require('./item')

            const item = new INodeItem(destPath)
            return item.write(content, { encoding, mode }, done)
        })
    }

    makeLink(destPath, done = _.noop) {
        if (!done || !_.isFunction(done)) {
            return Promise.promisify(this.makeLink.bind(this))
        }

        destPath = this._outputFilePath(destPath)

        const makeLink = (callback) => {
            return fs.symlink(this.root, destPath, 'file', (error) => {
                if (error) {
                    return callback(error, null)
                }
                return callback()
            })
        }

        const removeLink = (callback) => {
            return fs.unlink(destPath, (error) => {
                if (error) {
                    return callback(error, null)
                }
                return callback()
            })
        }

        const updateLink = (callback) => {
            return fs.readlink(destPath, (error, srcPath) => {
                if (error) {
                    return callback(error, null)
                }

                if (_.isEqual(this.root, srcPath)) {
                    return removeLink(() => makeLink(callback))
                }

                return callback()
            })
        }

        return fs.lstat(destPath, (error, lstat) => {
            if (error) {
                return makeLink(done)
            }
            return updateLink(done)
        })
    }

    readSync(opts) {
        opts = (opts || {})
        _.defaults(opts, { encoding: null })

        const { encoding } = opts
        return fs.readFileSync(this.root, { encoding })
    }

    writeSync(content, opts) {
        opts = (opts || {})
        _.defaults(opts, { encoding: null })

        const dirPath = path.dirname(this.root)
        mkdirp.sync(dirPath)

        const { encoding } = opts
        return fs.writeFileSync(this.root, content, { encoding })
    }

    copySync(destPath, opts) {
        opts = (opts || {})
        _.defaults(opts, { encoding: null, mode: '0666' })

        const { encoding, mode } = opts
        destPath = this._outputFilePath(destPath)

        const INodeItem = require('./item')
        const item = new INodeItem(destPath)
        const content = this.readSync({ encoding })

        return item.writeSync(content, { encoding, mode })
    }

    _outputFilePath(destPath) {
        const Item = require('./item')
        const item = new Item(destPath)

        if (_.isEqual(item.type, Item.TYPE_DIRECTORY)) {
            destPath = item.joinPaths(path.basename(this.root))
        }

        return destPath
    }
}

module.exports = File
