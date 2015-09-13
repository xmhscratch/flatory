var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');
var mkdirp = require('mkdirp');

var File = function(root, stat) {
	this.root = root;
	this.stat = stat || fs.statSync(root);

	return this;
}

File.prototype = {
	type: 1,

	copy: function(destPath, options) {
		options = (options || {});
		_.defaults(options, {
			encoding: 'utf8',
			mode: 0666
		});

		var srcFileName = path.basename(this.root),
			destFileName = path.basename(destPath);

		var destDir = destPath;
		
		try	{
			fs.accessSync(destPath, fs.F_OK);
		}catch(e) {
			if (_.isEqual(srcFileName, destFileName)) {
				destDir = path.dirname(destPath);
			}else{
				destPath = path.join(destDir, srcFileName);
			}
			
			mkdirp(destDir, options.mode, function(error) {
				if (error) deferred.reject(error);
				else deferred.resolve();
			});
		}

		var content = fs.readFile(this.root, {
			encoding: options.encoding
		});

		return fs.writeFileSync(destPath, content, options);
	},

	copyAsync: function(destPath, options, done) {
		var _super = this;

		options = (options || {});
		_.defaults(options, {
			encoding: 'utf8',
			mode: 0666
		});

		var srcFileName = path.basename(_super.root);
		var destFileName = path.basename(destPath);
		var override = false;

		Q.Promise(function(resolve, reject, notify) {
			fs.access(destPath, fs.F_OK, function(error) {
				return resolve( _.isEqual(srcFileName, destFileName) ? true : false );
			});
		}).then(function(isFile) {
			var deferred = Q.defer();

			var destDir = isFile ? path.dirname(destPath) : destPath;
			destPath = path.join(destDir, (isFile ? destFileName : srcFileName));

			mkdirp(destDir, options.mode, function(error) {
				if (error) deferred.reject(error);
				else deferred.resolve();
			});

			return deferred.promise;
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