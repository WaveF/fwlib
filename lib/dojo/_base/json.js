if (!dojo._hasResource["dojo._base.json"]) { //_hasResource checks added by build. Do not use _hasResource directly in your code.
	dojo._hasResource["dojo._base.json"] = true;
	dojo.provide("dojo._base.json");

	dojo.jsonpen = function () {
		return {
			_id: null,
			_remote: 'http://jsonpen.minicg.com/',
			_local: '',
			setHost: function(remote) {
				var host = remote;
				var chars = remote.split('');
				if (chats[chars.length-1] != '\\') { host += '\\'; }
				this._remote = host;
			},
			setId: function (penId) {
				this._id = penId;
			},
			getId: function() {
				return this._id;
			},
			create: function(callback) {
				var api = this._remote + 'create/?' + new Date().getTime();
				var res = fwlib.io.request(api, {method: 'POST'});
				
				if (arguments.length<1) return;
				var responses = res.responseText.split('&');
				var penId  = responses[0].split('id=').join('');
				var origin = responses[1].split('origin=').join('');
				var penUrl = this._remote + penId;
				callback({
					id    : penId  || null,
					origin: origin || null,
					url   : penUrl || null,
					info  : res
				});
			},
			read: function(callback) {
				if (!this._id) { alert('please set id before doing this.'); return; }
				var api = this._remote + 'read/?' + this._id + new Date().getTime();
				var res = fwlib.io.request(api, {method: 'GET'});

				if (arguments.length<1) {
					alert('Callback was required.');
					return;
				};
				var response = res.responseText;
				var responseData = '';
				if (response.indexOf('}') == -1) {
					responseData = response;
				} else {
					responseData = dojo.fromJson(response);
					responseData = responseData.data;
				}
				callback({
					data: responseData,
					info: res
				});
			},
			update: function(json, callback) {
				if (!json) return;
				if (!this._id) { alert('please init id before doing this.'); return; }
				var api = this._remote + 'update/?' + this._id + new Date().getTime();
				var res = fwlib.io.request(api, {
					method: 'POST',
					// headers: { "Content-Type": "application/json; charset=utf-8" },
					data: { data: json }
				});

				if (arguments.length<2) return;
				callback(res);
			},
			del: function(origin, callback) {
				if (!origin) { alert('please offer origin id.'); return; }
				var api = this._remote + 'delete/?' + origin;
				var res = fwlib.io.request(api, {method: 'POST'});

				if (arguments.length<1) return;
				callback(res);
			},
			setFilePath: function (filePath) {
				this._local = filePath;
			},
			getFilePath: function () {
				return this._local;
			},
			saveFile: function (jsonString) {
				var filePath = this._local;
				var jsonFile, jsonString;
				Files.deleteFileIfExisting(filePath);
				var newFile = Files.createFile(filePath, "TEXT", "????");
				if (!newFile) {
					alert('Can not create file:' + filePath + ',\nplease confirm file is exist or run Fireworks as administrator.');
					return;
				}
				jsonFile = Files.open(filePath, true);
				jsonFile.write(jsonString);
				jsonFile.close();
			},
			loadFile: function () {
				var filePath = this._local;
				if (!Files.exists(filePath)) {
					alert(filePath + '\nFile doesn\'t exist, please confirm file is exist.');
					return;
				}
				var jsonFile = Files.open(filePath, false),
					lines = [], line;
				if(jsonFile){
					while ((line = jsonFile.readline()) !== null) {
						lines.push(line);
					}
					jsonFile.close();
					return lines.join(" ");
				}
			},
			help: function() {
				var help = [
					'Documentation @jsonpen',
					'----',
					'# CURD',
					'',
					' .setId(id, callback)',
					'  store id and use for update, read and del',
					'  use callback to see documantation',
					'',
					' .create(callback)',
					'  use callback to get new id',
					'',
					' .update(json, callback)',
					'  pass json string to update data to server',
					'  use callback to debug',
					'',
					' .read(callback)',
					'  use callback to get data',
					'',
					' .del(callback)',
					'  remove data from server, use callback to see result',
					'',
					'# FILE',
					' .setFilePath(path)',
					'  setup local file path for saving or loading',
					'',
					' .getFilePath(path)',
					'  get local file path from previous setup',
					'',
					' .saveFile(object)',
					'  save your data to local file',
					'',
					' .loadFile(object)',
					'  load data from local file',
					'',
					'----',
					'  Encode script file with GB2312 if you are using Chinese characters.'
				].join('\n');
				alert(help);
			}
		};
	};

	// parse
	dojo.fromJson = function (/*String*/ json) {
		// summary:
		// 		evaluates the passed string-form of a JSON object
		// json: 
		//		a string literal of a JSON item, for instance:
		//			'{ "foo": [ "bar", 1, { "baz": "thud" } ] }'
		// return:
		//		the result of the evaluation

		// FIXME: should this accept mozilla's optional second arg?
		try {
			return eval("(" + json + ")");
		} catch (e) {
			console.debug(e);
			return json;
		}
	}

	dojo._escapeString = function (/*String*/str) {
		//summary:
		//		Adds escape sequences for non-visual characters, double quote and
		//		backslash and surrounds with double quotes to form a valid string
		//		literal.
		return ('"' + str.replace(/(["\\])/g, '\\$1') + '"'
		).replace(/[\f]/g, "\\f"
		).replace(/[\b]/g, "\\b"
		).replace(/[\n]/g, "\\n"
		).replace(/[\t]/g, "\\t"
		).replace(/[\r]/g, "\\r"); // string
	}

	// stringify
	dojo.toJsonIndentStr = "\t";
	dojo.toJson = function (/*Object*/ it, /*Boolean?*/ prettyPrint, /*String?*/ _indentStr) {
		// summary:
		//		Create a JSON serialization of an object. 
		//		Note that this doesn't check for infinite recursion, so don't do that!
		//
		// it:
		//		an object to be serialized. Objects may define their own
		//		serialization via a special "__json__" or "json" function
		//		property. If a specialized serializer has been defined, it will
		//		be used as a fallback.
		//
		// prettyPrint:
		//		if true, we indent objects and arrays to make the output prettier.
		//		The variable dojo.toJsonIndentStr is used as the indent string 
		//		-- to use something other than the default (tab), 
		//		change that variable before calling dojo.toJson().
		//
		// _indentStr:
		//		private variable for recursive calls when pretty printing, do not use.
		//		
		// return:
		//		a String representing the serialized version of the passed object.

		_indentStr = _indentStr || "";
		var nextIndent = (prettyPrint ? _indentStr + dojo.toJsonIndentStr : "");
		var newLine = (prettyPrint ? "\n" : "");
		var objtype = typeof (it);
		if (objtype == "undefined") {
			return "undefined";
		} else if ((objtype == "number") || (objtype == "boolean")) {
			return it + "";
		} else if (it === null) {
			return "null";
		}
		if (objtype == "string") { return dojo._escapeString(it); }
		// recurse
		var recurse = arguments.callee;
		// short-circuit for objects that support "json" serialization
		// if they return "self" then just pass-through...
		var newObj;
		if (typeof it.__json__ == "function") {
			newObj = it.__json__();
			if (it !== newObj) {
				return recurse(newObj, prettyPrint, nextIndent);
			}
		}
		if (typeof it.json == "function") {
			newObj = it.json();
			if (it !== newObj) {
				return recurse(newObj, prettyPrint, nextIndent);
			}
		}
		// array
		if (dojo.isArray(it)) {
			var res = [];
			for (var i = 0; i < it.length; i++) {
				var val = recurse(it[i], prettyPrint, nextIndent);
				if (typeof (val) != "string") {
					val = "undefined";
				}
				res.push(newLine + nextIndent + val);
			}
			return "[" + res.join(", ") + newLine + _indentStr + "]";
		}
		/*
		// look in the registry
		try {
			window.o = it;
			newObj = dojo.json.jsonRegistry.match(it);
			return recurse(newObj, prettyPrint, nextIndent);
		}catch(e){
			// console.debug(e);
		}
		// it's a function with no adapter, skip it
		*/
		if (objtype == "function") {
			return null;
		}
		// generic object code path
		var output = [];
		for (var key in it) {
			var keyStr;
			if (typeof (key) == "number") {
				keyStr = '"' + key + '"';
			} else if (typeof (key) == "string") {
				keyStr = dojo._escapeString(key);
			} else {
				// skip non-string or number keys
				continue;
			}
			val = recurse(it[key], prettyPrint, nextIndent);
			if (typeof (val) != "string") {
				// skip non-serializable values
				continue;
			}
			// FIXME: use += on Moz!!
			//	 MOW NOTE: using += is a pain because you have to account for the dangling comma...
			output.push(newLine + nextIndent + keyStr + ": " + val);
		}
		return "{" + output.join(", ") + newLine + _indentStr + "}";
	}

}
