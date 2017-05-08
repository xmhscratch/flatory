var _ = require('lodash')
var fs = require('fs')
var path = require('path')

var __ = require('./')
var rootDir = path.join(__dirname, './test/root')

// __(rootDir, 'app', 'components').move(path.join(rootDir))
// __(rootDir, 'components').move(path.join(rootDir, 'app'))

// __(rootDir, 'app', 'components').moveAsync(path.join(rootDir), _.noop)
// __(rootDir, 'components').moveAsync(path.join(rootDir, 'app'), _.noop)

// __(rootDir, 'app', 'components', 'blog', 'blogController.js').rename('blogController1.js')
// __(rootDir, 'app', 'components', 'blog', 'blogController.js').renameAsync('blogController1.js', _.noop)
