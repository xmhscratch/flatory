var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');
var mkdirp = require('mkdirp');

var Directory = function(root, stat) {
	this.root = root;
	this.stat = stat || fs.statSync(root);

	return this;
}

Directory.prototype = {
	stat: null,

	ensure: function(mode) {
		return mkdirp.sync(this.root, mode || 0770);
	},

	ensureAsync: function(mode, done) {
		return mkdirp(this.root, mode || 0770, done);
	},
	
	getChildItems: function(filter) {
		if (_.isEmpty(this.stat)) {
			return false;
		}

		var _super = this;
		return _(fs.readdirSync(this.root))
			.chain()
			.map(function(item) {
				return path.resolve(process.cwd(), _super.root, item);
			})
			.filter(function(item) {
				return _super._parseFilter(filter, item);
			})
			.value();
	},

	getItems: function(filter, options) {
		if (_.isEmpty(this.stat)) {
			return false;
		}

		options = (options || {});
		_.defaults(options, {
			excludes: ['.git', '.svn', 'node_modules'],
			deep: Number.MAX_VALUE
		});

		var _super = this, directoryItems = {}, level = 1;

		return (function collectItems(srcpath) {
			var excludePattern = new RegExp('.*('+options.excludes.join('|')+').*', 'g');

			var level = _.chain(
				path.relative(_super.root, srcpath).split(path.sep)
			).compact().size().value();
			if (level >= options.deep) return;

			var items = (new Directory(srcpath)).getChildItems(true);

			directoryItems[srcpath] = _.filter(items, function(item) {
				return fs.statSync(item).isFile()
					&& _super._parseFilter(filter, item);
			});
			
			var directories = _.filter(items, function(item) {
				return fs.statSync(item).isDirectory() && _.isEqual(excludePattern.test(item), false);
			});
			_.each(directories, collectItems);

			return directoryItems;
		})(this.root);
	},

	_parseFilter: function(filter, item) {
		if (_.isFunction(filter)) return _(filter(item)).isEqual(true);
		if (_.isRegExp(filter)) return filter.test(item);
		return true;
	}

}

module.exports = Directory;