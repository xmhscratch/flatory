const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const async = require('async')

class INode {

    constructor(root, stat) {
        this.root = root
        this.stat = stat || fs.statSync(root)

        return this
    }

    rename(newName) {
        const dirPath = path.dirname(this.root)
        const newPath = path.join(dirPath, newName)
        return fs.renameSync(this.root, newPath)
    }

    renameAsync(newName, done = _.noop) {
        const dirPath = path.dirname(this.root)
        const newPath = path.join(dirPath, newName)
        return fs.rename(this.root, newPath, done)
    }

    move(newPath) {
        switch (this.type) {
            case 0:
                {
                    _.forEach(this.getItems(), (files, dirPath) => {
                        const revPath = path.relative(this.root + '/..', dirPath)
                        const newRevPath = path.resolve(newPath, revPath)

                        _.forEach(files, (oldFilePath) => {
                            const fileName = path.basename(oldFilePath)
                            const newFilePath = path.join(newRevPath, fileName)
                            const newDirPath = path.dirname(newFilePath)

                            mkdirp.sync(newDirPath, '0770')
                            fs.renameSync(oldFilePath, newFilePath)
                        })
                    })
                    break
                }
            case 1:
                {
                    const fileName = path.basename(this.root)
                    const newFilePath = path.join(newPath, fileName)

                    mkdirp.sync(newPath, '0770')
                    fs.renameSync(this.root, newFilePath)
                    break
                }
            default:
                break
        }

        return rimraf.sync(this.root)
    }

    moveAsync(newPath, done = _.noop) {
        switch (this.type) {
            case 0:
                async.parallel(_.map(this.getItems(), (files, dirPath) => {
                    const revPath = path.relative(this.root + '/..', dirPath)
                    const newRevPath = path.resolve(newPath, revPath)

                    return (callback) => {
                        return async.parallel(_.map(files, (oldFilePath) => {
                            const fileName = path.basename(oldFilePath)
                            const newFilePath = path.join(newRevPath, fileName)
                            const newDirPath = path.dirname(newFilePath)

                            return (cb) => {
                                return mkdirp(newDirPath, { mode: '0770' }, (error) => {
                                    if (error) {
                                        return cb(error)
                                    }
                                    return fs.rename(oldFilePath, newFilePath, cb)
                                })
                            }
                        }), callback)
                    }
                }), (error, results) => {
                    return rimraf(this.root, () => done(error, results))
                })
                break
            case 1:
                const fileName = path.basename(this.root)
                const newFilePath = path.join(newPath, fileName)

                mkdirp(newPath, { mode: '0770' }, (error) => {
                    if (error) {
                        return done(error)
                    }

                    return fs.rename(this.root, newFilePath, (error, results) => {
                        return rimraf(this.root, () => done(error, results))
                    })
                })
                break
            default:
                done(new Error('Cannot delete this INode'))
                break
        }
    }

    delete() {
        return rimraf.sync(this.root)
    }

    deleteAsync(done = _.noop) {
        return rimraf(this.root, done)
    }

    joinPaths(dirs) {
        dirs = _.chain(arguments)
            .toArray()
            .compact()
            .flatten()
            .value()
        dirs.unshift(this.root)
        return path.join.apply(this, dirs)
    }
}

module.exports = INode
