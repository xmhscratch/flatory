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
        _.defaults(options, { encoding: null })

        const { encoding } = options
        return fs.readFileSync(this.root, { encoding })
    }

    readAsync(options, done = _.noop) {
        options = (options || {})
        _.defaults(options, { encoding: null })

        const { encoding } = options
        return fs.readFile(this.root, { encoding }, (error, content) => {
            if (error) {
                return done(error, null)
            }
            return done(null, content)
        })
    }

    write(content, options) {
        options = (options || {})
        _.defaults(options, { encoding: null })

        const dirPath = path.dirname(this.root)
        mkdirp.sync(dirPath)

        const { encoding } = options
        return fs.writeFileSync(this.root, content, { encoding })
    }

    writeAsync(content, options, done = _.noop) {
        options = (options || {})
        _.defaults(options, { encoding: null })

        const dirPath = path.dirname(this.root)
        return mkdirp(dirPath, (error) => {
            if (error) {
                return done(error)
            }

            const { encoding } = options
            return fs.writeFile(this.root, content, { encoding }, done)
        })
    }

    copy(destPath, options) {
        options = (options || {})
        _.defaults(options, { encoding: null, mode: '0666' })

        destPath = this._outputFilePath(destPath)

        const item = new require('./item')(destPath)
        const content = this.read({ encoding: options.encoding })
        const { encoding, mode } = options

        return item.write(content, { encoding, mode })
    }

    copyAsync(destPath, options, done = _.noop) {
        options = (options || {})
        _.defaults(options, { encoding: null, mode: '0666' })

        destPath = this._outputFilePath(destPath)

        return this.readAsync(options, (error, content) => {
            if (error) {
                return done(error, null)
            }

            const item = new require('./item')(destPath)
            const { encoding, mode } = options

            return item.writeAsync(content, { encoding, mode }, done)
        })
    }

    makeLinkAsync(destPath, done = _.noop) {
        var _super = this
        destPath = this._outputFilePath(destPath)

        const makeLink = (callback) => {
            return fs.symlink(_super.root, destPath, 'file', (error) => {
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

                if (_.isEqual(_super.root, srcPath)) {
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

    _outputFilePath(destPath) {
        const item = new require('./item')(destPath)

        if (_.isEqual(item.getType(), Item.TYPE_DIRECTORY)) {
            destPath = item.joinPaths(path.basename(this.root))
        }

        return destPath
    }
}

module.exports = File
