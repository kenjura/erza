var express = require('express');
var article = require('./model/Article.js');
var menu = require('./model/Menu.js');
var staticFile = require('./static.js');

var app = express();

app.set('views', './app/views')
app.set('view engine', 'html');


app.get('/', function (req, res) {
	// getArticle('_home',req,res);
	// res.status(200).send('no wiki selected');
	staticFile.get('index.html',req,res);
});

app.get(/\/static\/(.*)/, function (req,res) {
	staticFile.get(req.params[0],req,res);
});

app.get(/\/(.*)\/img\/(.*)/, function (req, res) {
	staticFile.getImage(req.params[0],req.params[1],req,res);
});
app.get(/\/(.*)\/(.*)/, function (req, res) {
	getArticle(req.params[0],req.params[1],req,res);
});
app.get(/\/(.*)/, function (req, res) {
	getArticle(req.params[0],'_home',req,res);
});

// app.get(/\/folder\/(.*)/, function (req, res) {
// 	getFolder(req.params[0],req,res);
// });

function getArticle(db,articleName,req,res) {
	// get menu
	var menuHtml = article.get(db,'_menu').html;

	// get style
	var styleCss = article.getWikitext(db,'_style');

	// get article
	var articleObj = article.get(db,articleName.toLowerCase());

	// render
	res.render('index', { title: getTitle(articleName), content: articleObj.html, sidebarHtml: articleObj.sidebarHtml, menuHtml:menuHtml, styleCss:styleCss });


	function getTitle(articleName) {
		articleName = articleName.replace( /^_/ , '' );
	}
}

function getFolder(folderName,req,res) {
	// get menu
	var menuHtml = menu.get();
	console.log(menuHtml);

	// get article
	var indexHtml = article.get(folderName+'/_index');
	if (!indexHtml) indexHtml = menu.get(folderName);
	res.render('index', { title: folderName, content: indexHtml, menuHtml:menuHtml });
}


app.listen(3003, function () {
  console.log('Example app listening on port 3003!');
});



var fs = require('fs'); // this engine requires the fs module
app.engine('html', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));

    var raw = content.toString();
    var rendered = raw.replace( /\{\{([^}]+)\}\}/g , function(em,g1) {
    	try { return eval('options.'+g1) } catch(e) { return '??eval error??' }
    });
    return callback(null, rendered);
  });
});
