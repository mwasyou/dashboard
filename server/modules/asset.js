
var formatKb, fs, jsp, log, minifyJSFile, pathlib, pro, uglifyjs, mt;

log = console.log;

fs = require('fs');

pathlib = require('path');

uglifyjs = require('uglify-js');

jsp = uglifyjs.parser;

pro = uglifyjs.uglify;

mt = require('./template');

module.exports = function(ss, options) {
  var loadFile;
  loadFile = function(dir, fileName, type, options, cb) {
    var extension, formatter, path;
    dir = pathlib.join(ss.root, dir);
    path = pathlib.join(dir, fileName);
    extension = pathlib.extname(path);
    extension = extension && extension.substring(1);
    formatter = ss.client.formatters[extension];
    if (path.substr(0, dir.length) !== dir) {
      throw new Error("Invalid path. Request for " + path + " must not live outside " + dir);
    }
    if (!formatter) {
      throw new Error("Unsupported file extension '." + extension + "' when we were expecting some type of " + (type.toUpperCase()) + " file.");
    }
    if (formatter.assetType !== type) {
      throw new Error("Unable to render '" + fileName + "' as this appears to be a " + (formatter.assetType.toUpperCase()) + " file.");
    }
    return formatter.compile(path.replace(/\\/g, '/'), options, cb);
  };
  return {
    js: function(path, opts, cb) {
      return loadFile(options.dirs.code, path, 'js', opts, function(output) {
        if (opts.compress && path.indexOf('.min') < 0) {
          output = minifyJSFile(output, path);
        }
        return cb(output, 'js');
      });
    },
    css: function(path, opts, cb) {
      return loadFile(options.dirs.css, path, 'css', opts, function(output) {
        return cb(output, 'css');
      });
    },
    tpl: function(path, opts, cb) {
        return cb(module.exports.wrap.module((opts.pathMapings && opts.pathMapings[path] ? opts.pathMapings[path] : path) + '/templates.js', mt.generate(path)), 'js');
    },
    auto: function(path, opts, cb) {
      var extension, formatter;
      extension = pathlib.extname(path);
      extension = extension && extension.substring(1);
      if (extension === 'tpl' && path.indexOf('/templates/modules/') === 0) {
        return this.tpl(path.replace('/templates/modules/', '/').slice(0, -4), opts, cb);
      }
      formatter = ss.client.formatters[extension];
      if (!formatter || !this[formatter.assetType]) {
        throw new Error("Unsupported resource type.");
      }
      return this[formatter.assetType](path, opts, cb);
    },
  };
};

formatKb = function(size) {
  return "" + (Math.round((size / 1024) * 1000) / 1000) + " KB";
};

minifyJSFile = function(originalCode, fileName) {
  var ast, minifiedCode;
  ast = jsp.parse(originalCode);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  minifiedCode = pro.gen_code(ast);
  log(("  Minified " + fileName + " from " + (formatKb(originalCode.length)) + " to " + (formatKb(minifiedCode.length))).grey);
  return minifiedCode;
};

module.exports.wrap = {
  module: function(modPath, code) {
    return "require.define(\"" + modPath + "\", function (require, module, exports, __dirname, __filename){\n" + code + "\n});";
  }
};
