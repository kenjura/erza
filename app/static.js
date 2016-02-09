var config = require('./config.js');
var fs = require('fs');


exports.get = function(filename,req,res) {
	console.log('Static.js > get > name=',filename);
	console.log('DIRNAME',__dirname);

	var path = __dirname+'/../static/' + filename;
	console.log('path',path);

	var extension = filename.substr( filename.lastIndexOf('.')+1 );

	// get file contents
	var filecontents = null;
	try { filecontents = fs.readFileSync(path); } catch(e) { console.error(e) }

	if (extension=='js') res.header("Content-Type", "text/javascript");
	if (extension=='html') res.header("Content-Type", "text/html");
	res.status(200).send(filecontents);
}



exports.getImage = function(db,filename,req,res) {
	console.log('Static.js > getImage > name=',filename);
	console.log('DIRNAME',__dirname);

	// find full path
	var path = config.wikiroot + db + '/img/' + filename;
	console.log('path',path);

	var extension = filename.substr( filename.lastIndexOf('.')+1 );

	// get file contents
	var filecontents = null;
	try { filecontents = fs.readFileSync(path); } catch(e) { console.error(e) }

	if (extension=='jpg'||extension==filename) res.header("Content-Type", "image/jpeg");
	if (extension=='png') res.header("Content-Type", "image/png");
	res.status(200).send(filecontents);
}