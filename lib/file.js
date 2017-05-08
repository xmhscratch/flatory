'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

class File {

    constructor (root, stat) {
        this.type = 1

        this.root = root
        this.stat = stat || fs.statSync(root)

        return this
    }

    move (newPath, done) {
        return fs.renameSync(this.root, newPath)
    }

    moveAsync (newPath, done) {
        return fs.renameAsync(this.root, newPath, done)
    }

    delete () {
        return rimraf.sync(this.root)
    }

    deleteAsync (done) {
        return rimraf(this.root, done)
    }

    contents (options) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        return fs.readFileSync(this.root, {
            encoding: options.encoding
        })
    }

    contentsAsync (options, done) {
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

    writeAsync (content, options, done) {
        options = (options || {})
        _.defaults(options, {
            encoding: 'utf8'
        })

        var dirPath = system.path.dirname(this.root)
        return mkdirp(dirPath, (error) => {
            if (error) return done(error)
            return fs.writeFile(this.root, {
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

    copyAsync (destPath, options, done) {
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

    makeLinkAsync (destPath, done) {
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
