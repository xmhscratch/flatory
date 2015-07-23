var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');
var mkdirp = require('mkdirp');

var File = function(root) {
	this.root = root;
	return this;
}

File.prototype = {

	copyAsync: function(destPath, options, done) {
		var _super = this;

		options = (options || {});
		_.defaults(options, {
			encoding: 'utf8',
			mode: 0666
		});

		var destStat = fs.statSync(destPath);

		var destDirname = destStat.isFile() ? path.dirname(destPath) : destPath;
		destPath = destDirname + (
			destStat.isFile() ? path.basename(destPath) : path.basename(_super.root)
		);

		Q.Promise(function(resolve, reject, notify) {
			fs.access(destDirname, fs.F_OK, function(error) {
				if (!error) resolve();
				else mkdirp(destDirname, options.mode, function(error) {
					if (error) reject(error);
					else resolve();
				});
			});
		}).then(function() {
			fs.readFile(this.root, {
				encoding: options.encoding
			}, function(error, content) {
				if (error) reject(error);
				else resolve(content);
			});
		}).then(function(content) {
			return fs.writeFile(destPath, content, options, done);
		}).fail(function() {
			return done(error, null);
		});
	},

	copy: function(destPath, options) {
		var _super = this;

		options = (options || {});
		_.defaults(options, {
			encoding: 'utf8',
			mode: 0666
		});

		var destStat = fs.statSync(destPath);

		var destDirname = destStat.isFile() ? path.dirname(destPath) : destPath;
		destPath = destDirname + (
			destStat.isFile() ? path.basename(destPath) : path.basename(_super.root)
		);

		try	{
			fs.accessSync(destDirname, fs.F_OK);
		}catch(e) {
			mkdirp.sync(destDirname, options.mode);
		}

		var content = fs.readFile(this.root, {
			encoding: options.encoding
		});

		return fs.writeFileSync(destPath, content, options);
	},
}

module.exports = File;