var bodyParser = require('body-parser');
var express = require('express');
var article = require('./model/Article.js');
var menu = require('./model/Menu.js');
var staticFile = require('./static.js');

var app = express();

app.set('views', './app/views')
app.set('view engine', 'html');


app.use(bodyParser.text());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get('/', function (req, res) {
	// getArticle('_home',req,res);
	// res.status(200).send('no wiki selected');
	staticFile.get('index.html',req,res);
});

app.get(/\/static\/(.*)/, function (req,res) {
	staticFile.get(req.params[0],req,res);
});

app.get('/search',function(req,res){
	var q = req.query.q;
	var db = req.query.db;
	// console.log(req.query);
	var menuHtml = article.get(db,'_menu').html;
	var styleCss = article.getWikitext(db,'_style2');
	var badgeHtml = article.getWikitext(db,'_badge.html');
	var html = article.search(q,db,res,function(err,html){
		if (err) return res.status(200).send('Error with search results.');
		res.render('index2', { 
			articleName:'search',
			title: 'Search Results for "'+q+'"', 
			db:db, 
			content: html,
			wikitext: '',
			sidebarHtml: '', 
			menuHtml:menuHtml, 
			styleCss:styleCss, 
			tocHtml:'', 
			badgeHtml:badgeHtml,
			mode:'view'
		});

	});
});

app.get(/^\/favicon.ico/, function(req,res){
	console.log('getting favicon');
	staticFile.get('favicon.ico',req,res);
});


app.get(/api\/(.*)\/(.*)\/revisions/,function(req,res){
	console.log('API Revisions');
	var revs = article.getRevisions(req.params[0],req.params[1].toLowerCase());
	res.status(200).send(revs);
});

app.get(/^\/(.*)\/img\/(.*)/, function (req, res) {
	console.log('getting image');
	staticFile.getImage(req.params[0],req.params[1],req,res);
});
app.get(/^\/([^\/]*?)\/([^\/]*)(?:\/(.*))?/, function (req, res) {
	getArticle(req.params[0],req.params[1],req,res,req.params[2]);
});
// app.get(/^\/(.*)\/edit/, function (req, res) {
// 	getArticle(req.params[0],'_home',req,res,req.params[2]);
// });
// app.get(/^\/(.*)\/(.*)/, function (req, res) {
// 	getArticle(req.params[0],req.params[1],req,res);
// });
app.get(/^\/(.*)/, function (req, res) {
	getArticle(req.params[0],'_home',req,res);
});

// API calls
app.put(/\/(.*)\/(.*)/, function (req, res) {
	console.log('PUT ',req.params[0],req.params[1]);
	var db = req.params[0];
	var articleName = req.params[1];
	var body = req.body;
	if (!body) return res.status(400).send('no body');
	article.update(db,articleName,body,function(err,status){
		if (status!='success') res.status(500).send(err);
		else res.status(200).send(status);
	});
});

// app.get(/\/folder\/(.*)/, function (req, res) {
// 	getFolder(req.params[0],req,res);
// });

function getArticle(db,articleName,req,res,mode) {
	if (mode===undefined) mode = 'view';
	if (!articleName) articleName = '_home';
	console.log('getArticle > db=',db,' articleName=',articleName,' mode=',mode);

	// get menu
	var menuHtml = article.get(db,'_menu').html;

	// get style
	var styleCss = article.getWikitext(db,'_style2');

	// get article
	var articleObj = article.get(db,articleName);
	// var articleHtml = '<pre>'+articleObj.html.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre>';
	var articleHtml = articleObj.html;
	if (req.query.wikitext!==undefined) articleHtml = '<pre>' + articleObj.wikitext + '</pre>';
	var tocHtml = articleObj.tocHtml;
	// res.status(200).send(JSON.stringify(req.query));

	// badge
	var badgeHtml = article.getWikitext(db,'_badge.html');

	// debug only
	// return res.status(200).send(articleObj);

	// revision history, where applicable
	if (mode=='revisions') {
		// var revisions = article.getRevisions(db,articleName.toLowerCase());
		// return res.status(200).send(revisions);	
	}

	// render
	res.render('index2', { 
		articleName:articleName,
		title: getTitle(db,articleName), 
		db:db, 
		content: articleHtml,
		wikitext: articleObj.wikitext,
		sidebarHtml: articleObj.sidebarHtml, 
		menuHtml:menuHtml, 
		styleCss:styleCss, 
		tocHtml:tocHtml, 
		badgeHtml:badgeHtml,
		mode:mode
	});


	function getTitle(db,articleName) {
		return db + ': ' + articleName.replace( /^_/ , '' );
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
