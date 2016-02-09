var file = require('file');
var fs = require('fs');


var root = '../narrwiki_test/wiki';
var rootpath = fs.realpathSync( root + '/' );

console.log('rootpath',rootpath);


var paths = [];

file.walkSync(rootpath,function(a,b,c){
	// a = a.replace( /^\// , '' );
	c = c.filter(function(filename){ return filename.substr(0,1)!='.' }); // remove hidden files
	paths.push({ root:a, dirs:b, files:c });
});

// for (var i = paths.length-1; i > -1; i--) {

// }


paths = paths.map(removeRoot);


console.log(paths);






function removeRoot(obj) {
	obj.root = obj.root.replace(rootpath,'');
	obj.root = obj.root.replace( /^\// , '' );
	return obj;
}