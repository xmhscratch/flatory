'use strict'

const fs = require('fs')
const path = require('path')

const _ = require('lodash')
const mkdirp = require('mkdirp')

const INode = require('./i-node')

class File extends INode {

    constructor(root, stat) {
        super(root, stat)

        this.type = 1
        return this
    }

    read(options) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        return fs.readFileSync(this.root, {
            encoding: options.encoding
        })
    }

    readAsync(options, done = _.noop) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        return fs.readFile(this.root, {
            encoding: options.encoding
        }, done)
    }

    write(content, options) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        return fs.writeFileSync(this.root, content, {
            encoding: options.encoding
        })
    }

    writeAsync(content, options, done = _.noop) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        return fs.writeFile(this.root, content, {
            encoding: options.encoding
        }, done)
    }

    copy(destPath, options) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8',
            mode: '0666'
        })

        let content = this.contents({
            encoding: options.encoding
        })

        return fs.writeFileSync(
            this._outputFilePath(destPath), content, options
        )
    }

    copyAsync(destPath, options, done = _.noop) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8',
            mode: '0666'
        })
        destPath = this._outputFilePath(destPath)

        this.contentsAsync(options, (error, content) => {
            if (error) {
                return done(error, null)
            }

            return fs.writeFile(
                destPath, content, options, done
            )
        })
    }

    makeLinkAsync(destPath, done = _.noop) {
        let _super = this
        destPath = this._outputFilePath(destPath)

        function makeLink(callback) {
            return fs.symlink(_super.root, destPath, 'file', callback)
        }

        function removeLink(callback) {
            return fs.unlink(destPath, callback)
        }

        function updateLink(callback) {
            return fs.readlink(destPath, (error, srcPath) => {
                if (error) {
                    return callback(error, null)
                }

                if (_.isEqual(_super.root, srcPath)) {
                    return removeLink(() => {
                        return makeLink(callback)
                    })
                }

                return callback()
            })
        }

        return fs.lstat(destPath, (error, lstat) => {
            if (!error) {
                return updateLink(done)
            } else {
                return makeLink(done)
            }
        })
    }

    _outputFilePath(destPath) {
        let Item = require('./item')
        let _item = (new Item(destPath)).toInstance()

        if (_.isEqual(_item.type, Item.TYPE_DIRECTORY)) {
            destPath = _item.joinPaths(
                path.basename(this.root)
            )
        }

        return destPath
    }
}

module.exports = File
