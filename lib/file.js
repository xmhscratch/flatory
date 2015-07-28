var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');
var mkdirp = require('mkdirp');

var File = function(root) {
	try	{
		fs.accessSync(root);
		this.stats = fs.statSync(root);
	}catch(e) {}
	
	this.root = root;
	return this;
}

File.prototype = {
	stats: null,

	copy: function(destPath, options) {
		if (_.isEmpty(this.stats)) {
			return false;
		}

		options = (options || {});
		_.defaults(options, {
			encoding: 'utf8',
			mode: 0666
		});

		var destStat = fs.statSync(destPath);

		var destDirname = destStat.isFile() ? path.dirname(destPath) : destPath;
		destPath = destDirname + (
			destStat.isFile() ? path.basename(destPath) : path.basename(this.root)
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

	copyAsync: function(destPath, options, done) {
		var _super = this;
		
		if (_.isEmpty(this.stats)) {
			return done('File being copied doesnt exist');
		}

		options = (options || {});
		_.defaults(options, {
			encoding: 'utf8',
			mode: 0666
		});

		var destStat = fs.statSync(destPath);

		var destDirname = destStat.isFile() ? path.dirname(destPath) : destPath;
		destPath = destDirname + (
			destStat.isFile() ? path.basename(destPath) : path.basename(this.root)
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
			var deferred = Q.defer();

			fs.readFile(_super.root, {
				encoding: options.encoding
			}, function(error, content) {
				if (error) deferred.reject(error);
				else deferred.resolve(content);
			});

			return deferred.promise;
		}).then(function(content) {
			return fs.writeFile(destPath, content, options, done);
		}).fail(function() {
			return done(error, null);
		});
	}
}

module.exports = File;