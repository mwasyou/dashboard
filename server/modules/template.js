
var
    utils = require('./../../utils'),
    path = require('path'),
    fs = require('fs'),
    ss = require('socketstream'),
    hogan = require('hogan.js');

var templatesDir = path.join(ss.root, ss.client.options.dirs.templates, 'modules');
if (!fs.existsSync(templatesDir)) {
    throw new Error('Directory must exist: "'+templatesDir+'"');
}

var suggestedId = function(path) {
  var sp;
  sp = path.split('.');
  if (path.indexOf('.') > 0) {
    sp.pop();
  }
  return sp.join('.').replace(/\//g, '-');
};

var clientCode = fs.readFileSync(path.join(__dirname, 'template/hogan', 'client.js'), 'utf8');
ss.api.client.send('lib', 'hogan-template', clientCode);

module.exports.generate = function(moduleName) {
    if (!fs.existsSync(path.join(templatesDir, moduleName))) {
        return '//There are no templates for module "'+moduleName+'"';
    }
    var files = utils.files(templatesDir, moduleName), output;
    output = "var ht=Hogan.Template,t=require(\'socketstream\').tmpl;";
    files.forEach(function(file) {
        var compiledTemplate, template, templateFile, templateId;
        templateFile = path.join(templatesDir, file);
        templateId = suggestedId(file);
        template = fs.readFileSync(templateFile, 'utf8');
        try {
            compiledTemplate = hogan.compile(template, {asString: true});
        } catch (e) {
            var message = '! Error compiling the "' + templateFile + '" template into Hogan';
            compiledTemplate = '<p>Error at '+templateId+'</p>';
            console.log(String.prototype.hasOwnProperty('red') && message.red || message);
        }
        output += 't[\'' + templateId + '\']=new ht(' + compiledTemplate + ');';
    });

    return output;
};
