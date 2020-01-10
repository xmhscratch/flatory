var _ = require('lodash')
var fs = require('fs')
var path = require('path')

var __ = require('./')
var rootDir = path.join(__dirname, './test/root')

// console.log(
// 	__(rootDir, 'app', 'components').getFullPath(),
// 	__(rootDir, 'app', 'components').getStat(),
// )

// __(rootDir, 'app', 'components')
//  .moveSync(path.join(rootDir))
// __(rootDir, 'components')
//  .moveSync(path.join(rootDir, 'app'))
// __(rootDir, 'app', 'components')
//  .move(path.join(rootDir), _.noop)
// __(rootDir, 'components')
//  .move(path.join(rootDir, 'app'), _.noop)

// __(rootDir, 'app', 'components', 'blog', 'blogController.js')
//  .moveSync(path.join(rootDir, 'app'))
// __(rootDir, 'app', 'blogController.js')
//  .moveSync(path.join(rootDir, 'app', 'components', 'blog'))
// __(rootDir, 'app', 'components', 'blog', 'blogController.js')
//     .move(path.join(rootDir, 'app'))
// __(rootDir, 'app', 'blogController.js')
//     .move(path.join(rootDir, 'app', 'components', 'blog'))

// __(rootDir, 'app', 'components', 'blog', 'blogController.js')
//  .renameSync('blogController1.js')
// __(rootDir, 'app', 'components', 'blog', 'blogController1.js')
//  .renameSync('blogController.js')
// __(rootDir, 'app', 'components', 'blog', 'blogController.js')
//  .rename('blogController1.js', _.noop)
// __(rootDir, 'app', 'components', 'blog', 'blogController1.js')
//  .rename('blogController.js', _.noop)

// __(rootDir, '5847.js')
// 	.write('111', _.noop)
// __(rootDir, '5847.js')
// 	.writeSync('222')

// __(rootDir, '5847.js')
// 	.read({ encoding: 'utf8' }, console.log)
// console.log(
// 	__(rootDir, '5847.js')
// 		.readSync({ encoding: 'utf8' }),
// )

// __(rootDir, '5847.js')
// 	.delete({}, console.log)
// console.log(
// 	__(rootDir, '5847.js')
// 		.deleteSync({})
// )
// __(rootDir, 'app', 'components')
// 	.delete({}, console.log)
// console.log(
// 	__(rootDir, 'app', 'components')
// 		.deleteSync({})
// )
