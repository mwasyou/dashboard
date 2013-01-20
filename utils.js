
require('colors');

var
    fs = require('fs'),
    path = require('path');

module.exports = require('util');

var deepExtend;

module.exports.extend = deepExtend = function (/*obj_1, [obj_2], [obj_N]*/) {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
        return false;
    }

    if (arguments.length < 2) {
        return arguments[0];
    }

    var target = arguments[0];

    // convert arguments to array and cut off target object
    var args = Array.prototype.slice.call(arguments, 1);

    var val, src, clone;

    args.forEach(function (obj) {
        if (typeof obj !== 'object') {
            return;
        }

        for (var key in obj) {
            if (obj[key] !== void 0) {
                src = target[key];
                val = obj[key];

                if (val === target) {
                    continue;
                }

                if (typeof val !== 'object' || val === null) {
                    target[key] = val;
                    continue;
                }

                if (typeof src !== 'object') {
                    clone = (Array.isArray(val)) ? [] : {};
                    target[key] = deepExtend(clone, val);
                    continue;
                }

                if (Array.isArray(val)) {
                    clone = (Array.isArray(src)) ? src : [];
                } else {
                    clone = (!Array.isArray(src)) ? src : {};
                }

                target[key] = deepExtend(clone, val);
            }
        }
    });

    return target;
};

module.exports.buildConfig = function (config, env) {
    var result = {};
    var loaded = [];
    var sections = {};

    var processConfig = function(s) {
        if (!sections[s]) {
            throw new Error("Unknown config section: \"" + s + "\"");
        }
        var r = {};
        if (loaded.indexOf(s) < 0) {
            if (sections[s].from) {
                r = processConfig(sections[s].from);
            }
            r = deepExtend(r, config[sections[s].key]);

            loaded.push(s);
        }

        return r;
    };

    for (var key in config) {
        var section = {
            key: key,
            from: false,
            to: key,
        };
        if (section.to.indexOf(':') >= 0) {
            section.from = section.to.substring(section.to.indexOf(':') + 1);
            section.to = section.to.substring(0, section.to.indexOf(':'));
        }
        sections[section.to] = section;
    }

    return processConfig(env);
};

module.exports.loadJsonFile = function(file) {
  try {
  return JSON.parse(fs.readFileSync(file));
  } catch (e) {
    throw('Error: Unable to load JSON file "' + file + '"');
  }
};

var serve = function(body, type, status, response) {
    response.writeHead(status, {
        'Content-type': type,
        'Content-Length': Buffer.byteLength(body)
    });
    return response.end(body);
};

module.exports.serve = {
    js: function(body, response) {
        return serve(body, 'text/javascript; charset=utf-8', 200, response);
    },
    css: function(body, response) {
        return serve(body, 'text/css', 200, response);
    },
    html: function(body, response) {
        return serve(body, 'text/html', 200, response);
    },
    request: {
        forbidden: function(response) {
            return serve("You don't have permission to access the requested resource on this server.", 'text/html', 403, response);
        },
        notFound: function(response) {
            return serve("The requested URL was not found on this server.", 'text/html', 404, response);
        },
        serverError: function(response) {
            return serve("Internal Server Error.", 'text/html', 500, response);
        },
    },
};

// Read the contents of a dir. Adapted from https://gist.github.com/825583
module.exports.readDirSync = function(start) {
  try {
    // Use lstat to resolve symlink if we are passed a symlink
    var stat = fs.lstatSync(start);
    var found = {dirs: [], files: []}, total = 0, processed = 0;
    function isHidden(path){ return path.match(/(^_|^\.|~$)/); }
    function isDir(abspath) {
      var stat = fs.statSync(abspath);
      var abspathAry = abspath.split('/');
      if(stat.isDirectory() && !isHidden(abspathAry[abspathAry.length -1])) {
        found.dirs.push(abspath);
        // If we found a directory, recurse!
        var data = module.exports.readDirSync(abspath);
        found.dirs = found.dirs.concat(data.dirs);
        found.files = found.files.concat(data.files);
        if(++processed === total) {
            return found;
        }
      } else {
        abspathAry = abspath.split('/');
        var file_name = abspathAry[abspathAry.length-1];
        if (!isHidden(file_name)) {
            found.files.push(abspath);
        }
        if (++processed === total) {
            return found;
        }
      }
    }
    // Read through all the files in this directory
    if(stat.isDirectory()) {
      var files = fs.readdirSync(start).sort();
      total = files.length;
      for(var x=0, l=files.length; x<l; x++) {
        isDir(path.join(start, files[x]).replace(/\\/g, '/')); // replace '\' with '/' to support Windows
      }
    } else {
      throw (new Error("path: " + start + " is not a directory"));
    }
    return found;

  } catch(e) {
    if (e.code !== 'ENOENT') {
        throw(e); // Ignore if optional dirs are missing
    }
    return false;
  }
};

module.exports.isDir = function (filePath) { return fs.statSync(filePath).isDirectory(); };

module.exports.files = function(prefix, paths) {
  var files, numRootFolders;
  if (paths == null) {
    paths = ['*'];
  }
  files = [];
  prefix = prefix.replace(/\\/g, '/');
  numRootFolders = prefix.split('/').length;
  if (!(paths instanceof Array)) {
    paths = [paths];
  }
  paths.forEach(function(path) {
    var dir, sp, tree;
    sp = path.split('/');
    if (sp[sp.length - 1].indexOf('.') > 0) {
      return files.push(path);
    } else {
      dir = prefix;
      if (path !== '*') {
        dir += '/' + path;
      }
      if (tree = module.exports.readDirSync(dir)) {
        return tree.files.sort().forEach(function(file) {
          return files.push(file.split('/').slice(numRootFolders).join('/'));
        });
      } else {
        return console.log(("! Error: " + dir + " directory not found").red);
      }
    }
  });
  return files;
};
