var
	clone = require('clone'),
	fs = require('fs'),
	Emitter = require('emitter-component');

function JsonWatch(filename) {

	var eventObj = this;
	var json = {};

	function is_object(o) {
		if (Object.prototype.toString.call (o) === '[object Object]') return true;
		return false;
	}

	function emit() {
		eventObj.emit.apply(eventObj, Array.prototype.slice.call(arguments, 0));
		//var longEventName = (arguments[0] + arguments[1]).split('/').join('-');
		//eventObj.emit.apply(eventObj, [ longEventName ].concat(Array.prototype.slice.call(arguments, 1)));
	}

	function parseJson(newJson, oldJson, path) {
		if (is_object(newJson) && is_object(oldJson)) {
			for (var key in oldJson) {
				if (oldJson.hasOwnProperty(key) && newJson.hasOwnProperty(key)) {
					if (is_object(newJson[key]) && is_object(oldJson[key])) {
						(function(key) {
							process.nextTick(function () {
								parseJson(newJson[key], oldJson[key], path + '/' + key);
							});
						}(key));
					} else if (is_object(newJson[key]) && !is_object(oldJson[key])) {
						emit('cng', path + '/' + 'key', clone(oldJson[key]), {});
						oldJson[key] = {};
						process.nextTick(function () { parseJson(newJson[key], oldJson[key], path + '/' + key); });
					} else if (!is_object(newJson[key]) && is_object(oldJson[key])) {
						emit('cng', path + '/' + key, clone(oldJson[key]), clone(newJson[key]));
						oldJson[key] = newJson[key];
					} else {
						if (JSON.stringify(oldJson[key]) != JSON.stringify(newJson[key])) {
							emit('cng', path + '/' + key, clone(oldJson[key]), clone(newJson[key]));
							oldJson[key] = newJson[key];
						}
					}
				} else {
					emit('rm', path + '/' + key, clone(oldJson[key]));
					delete(oldJson[key]);
				}
			}
			for (var key in newJson) {
				if (!oldJson.hasOwnProperty(key) && newJson.hasOwnProperty(key)) {
					if (is_object(newJson[key])) {
						oldJson[key] = {};
						(function(key) {
							process.nextTick(function () {
								parseJson(newJson[key], oldJson[key], path + '/' + key);
							});
						}(key));
						emit('add', path + '/' + key, {});
					} else {
						oldJson[key] = newJson[key];
						emit('add', path + '/' + key, oldJson[key]);
					}
				}
			}
		}
	}

	var jsonWatcher;
	var loadJson = function() {
		if (jsonWatcher) {
			// By some reason, watch is failing if we dont restart the listener on watch events.
			jsonWatcher.close();
		}
		fs.readFile(filename, function(err, data) {
			var newJson;

			if (err) {
				setTimeout(loadJson, 1000);
				return emit('err', new Error('Could not read file ' + filename + ': ' + err + '. Retrying...'));
			}

			jsonWatcher = fs.watch(filename, { persistent: true }, loadJson);

			try {
				newJson = JSON.parse(data);
			} catch (err) {
				return emit('err', new Error('Json parser error in ' + filename + ': ' + err));
			}

			process.nextTick(function () { parseJson(newJson, json, ''); });

		}.bind(this));
	}.bind(this);

	loadJson();

}

Emitter(JsonWatch.prototype);

module.exports = JsonWatch;
