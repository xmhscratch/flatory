var __ = require('../../index')
var path = require('path')
var fs = require('fs')
var rootdir = path.join(__dirname, '../root')

describe("scan item", function() {

	var root = __(rootdir)

	it("synchronous ensure testdir ensure folder exist", function() {
		var testdir = path.join(rootdir, 'ensure-test')
		var test = __(testdir)

		// fs.access(testdir, fs.R_OK, function(error) {
		// 	if (error) return expect(test.ensure()).toEqual(testdir)
		// 	return expect(test.ensure()).toBeNull()
		// })
	})
})
