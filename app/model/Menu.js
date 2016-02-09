var config = require('../config.js');
var fs = require('fs');
// var path = require('path');
var _ = require('underscore');
var wikiUtil = require('../utils/WikiUtil.js');

exports.get = function(start) {
	var rootpath = fs.realpathSync( config.wikiroot + '/' );
	console.log('rootpath:',rootpath);
	console.log('start',start);

	var targetpath = rootpath;
	if (start) targetpath += '/' + start;

	var paths = dirTree(targetpath,rootpath);
	console.log('paths',paths);
	if (!paths||!paths.children) return 'Error: unable to render menu.';

	var topLevel = paths.children;

	var menuHtml = '<ul>'+'<li><a href="/">Home</a></li>'+recurse(topLevel)+'</ul>';

	return menuHtml;

}

function recurse(paths) {
	// expects an array of objects with properties:
	//  - path: complete path to file or directory
	//  - name: name of file or directory
	//  - children: array of similar objects

	var template = '<li><a href="$url">$name</a>\n$children</li>\n';
	var output = '', path;
	for (var i = 0; path = paths[i]; i++) {
		if (path.name.substr(0,1)=='_') continue;
		var html = template;
		html = html.replace( '$name' , path.name + (path.type=='folder'?'<span class="arrow"></span>':'') );
		html = html.replace( '$url' , getPath(path) );
		html = html.replace( '$children' , path.children ? '<ul>'+recurse(path.children)+'</ul>' : '' );
		output += html;
	};
	return output;
}

function getPath(file) {
	return file.type=='folder' ? '/folder'+file.cleanpath : '/article'+file.cleanpath
}

function dirTree(filename,rootpath) {
	// console.log('dirTree > filename:',filename);
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename),
            cleanpath: filename.replace(rootpath,'')
        };

    if (info.name.substr(0,1)=='.') return null;

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child,rootpath);
        }).filter(function(a){ return a });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }

    return info;
}