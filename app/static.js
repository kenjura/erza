var config = require('./config.js');
var fs = require('fs');


exports.get = function(filename,req,res) {
	if (typeof(filename)!='string') {
		console.error('Static.js > ERROR: filename is not a string. First 100 characters are:');
		console.error(String(filename).substr(0,50));
		res.status(400).send();
		return;
	}
	console.log('Static.js > get > name=',filename);
	// console.log('DIRNAME',__dirname);

	var path = __dirname+'/../static/' + filename;
	// console.log('path',path);

	var extension = filename.substr( filename.lastIndexOf('.')+1 );

	// get file contents
	var filecontents = null;
	try { filecontents = fs.readFileSync(path); } catch(e) { console.error(e) }

	if (extension=='js') res.header("Content-Type", "text/javascript");
	if (extension=='html') res.header("Content-Type", "text/html");
	if (extension=='css') res.header("Content-Type", "text/css");
	if (extension=='ico') res.header("Content-Type", "image/ico");
	res.status(200).send(filecontents);
}



exports.getImage = function(db,filename,req,res) {
	if (typeof(filename)!='string') {
		console.error('Static.js > ERROR: filename is not a string. First 100 characters are:');
		console.error(JSON.stringify(filename).substr(0,50));
		res.status(400).send();
		return;
	}

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