'use strict'

const fs = require('fs')
const path = require('path')

const _ = require('lodash')
const mkdirp = require('mkdirp')

const INode = require('./i-node')

class File extends INode {

    constructor (root, stat) {
        super(root, stat)

        this.type = 1
        return this
    }

    read (options) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        return fs.readFileSync(this.root, {
            encoding: options.encoding
        })
    }

    readAsync (options, done = _.noop) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        return fs.readFile(this.root, {
            encoding: options.encoding
        }, function(error, content) {
            if (error) return done(new Error(error), null)
            else return done(null, content)
        })
    }

    write (content, options) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        var dirPath = system.path.dirname(this.root)

        mkdirp.sync(dirPath)
        return fs.writeFileSync(this.root, {
            encoding: options.encoding
        })
    }

    writeAsync (content, options, done = _.noop) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        var dirPath = system.path.dirname(this.root)
        return mkdirp(dirPath, (error) => {
            if (error) return done(error)
            return fs.writeFile(this.root, content, {
                encoding: options.encoding
            }, done)
        })
    }

    copy (destPath, options) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8',
            mode: '0666'
        })

        var content = this.contents({
            encoding: options.encoding
        })

        return fs.writeFileSync(this._outputFilePath(destPath), content, options)
    }

    copyAsync (destPath, options, done = _.noop) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8',
            mode: '0666'
        })
        destPath = this._outputFilePath(destPath)

        this.contentsAsync(options, function(error, content) {
            if (error) return done(new Error(error), null)
            else return fs.writeFile(destPath, content, options, done)
        })
    }

    makeLinkAsync (destPath, done = _.noop) {
        var _super = this
        destPath = this._outputFilePath(destPath)

        function makeLink(callback) {
            return fs.symlink(_super.root, destPath, 'file', function(error) {
                if (error) return callback(new Error(error), null)
                else return callback()
            })
        }

        function removeLink(callback) {
            return fs.unlink(destPath, function(error) {
                if (error) return callback(new Error(error), null)
                else return callback()
            })
        }

        function updateLink(callback) {
            return fs.readlink(destPath, function(error, srcPath) {
                if (error) return callback(new Error(error), null)
                if (_.isEqual(_super.root, srcPath)) {
                    return removeLink(function() { return makeLink(callback) })
                }
                return callback()
            })
        }

        return fs.lstat(destPath, function(error, lstat) {
            if (!error) return updateLink(done)
            else return makeLink(done)
        })
    }

    _outputFilePath (destPath) {
        var Item = require('./item')
        var _item = (new Item(destPath)).toInstance()
        if (_.isEqual(_item.type, Item.TYPE_DIRECTORY)) {
            destPath = _item.joinPaths(path.basename(this.root))
        }
        return destPath
    }
}

module.exports = File
