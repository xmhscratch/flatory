var __ = require('flatory');
var path = require('path');
var rootdir = path.join(__dirname, '../root');

describe("instantiate item", function() {

	it("return item", function() {
		expect(rootdir).not.toBeFalsy();
		expect( __(rootdir).toString() ).toEqual('[object Object]');
		expect( __(rootdir).type ).toEqual(0);
	});
});