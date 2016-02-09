var fs = require('fs'),
    path = require('path');

var root = '../narrwiki_test/wiki';
var rootpath = fs.realpathSync( root + '/' );

var result = dirTree(rootpath);
console.log(JSON.stringify(result));

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

    if (info.name.substr(0,1)=='.') return null;

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        }).filter(function(a){ return a });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }

    return info;
}

// if (module.parent == undefined) {
//     // node dirTree.js ~/foo/bar
//     var util = require('util');
//     console.log(util.inspect(dirTree(process.argv[2]), false, null));
// }