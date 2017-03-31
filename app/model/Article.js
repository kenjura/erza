var config = require('../config.js');
var fs = require('fs');
var request = require('sync-request');
var wikiUtil = require('../utils/WikiUtil.js');
var upath = require('upath');
var dropbox = {
	getRevisions:function(path,callback){
		var	url = 'https://api.dropboxapi.com/2/files/list_revisions';
		var options = {
			headers: {
				'Authorization': 'Bearer ' + config.token,
  				'Content-Type': 'application/json'
			},
			json: {
				path:path
			}
		};
		var res = request('POST',url,options);
		console.log('res',res.getBody('utf8'));
		return res.getBody('utf8');
	}
	/*
	get revision:

	curl -X POST https://content.dropboxapi.com/2/files/download \
  --header 'Authorization: Bearer vEY8dPHtxfAAAAAAAAHX1Y5v2n-p78M3ztIsP3QVmS7vCCoEoNA7S3TSddzFiL8c' \
  --header 'Dropbox-API-Arg: {"path":"/RPG Root/RPG/wiki/system7/7.6.txt","rev":"546152a5000c7fbe"}'
  */
}

exports.get = function(db,name,args){ return get('html',db,name,args) }
exports.getHtml = function(db,name,args){ return get('html',db,name,args) }
exports.getRaw = function(db,name,args){ return get('raw',db,name,args) }
exports.getWikitext = function(db,name,args){ return get('wikitext',db,name,args) }
exports.getRevisions = function(db,name,args){ return getRevisions(db,name,args) }
exports.search = function(q,db,req,res) { return search(q,db,req,res) }
exports.update = function(db,name,body,callback) { return update(db,name,body,callback) }

function get(which,db,name,args) {
	console.log('Article.js > get > db=',db,', name=',name,', args=',args, ', which=',which);
	if (!args) args = {};

	// trailing '.txt' is not necessary
	if (name.match('.txt')) name = name.replace('.txt','');

	// no name? if so, home
	if (!name) name = '_home';

	// spelled _home wrong?
	if (name=='Home') name = '_home';

	// home? if so, change path
	if (name=='home') name = '_home';

	// add extension, if needed
	var addExt = name.substr(-5)!='.html';

	// raw html?
	var rawHtml = name.substr(-5) == '.html';
	console.log('rawHtml=',rawHtml,' substr=',name.substr(-5));

	// find full path
	var wikiroot = db=='dm' ? config.dmwikiroot : config.wikiroot;
	var path = wikiroot + db + '/' + name + (addExt?'.txt':'');
	path = upath.normalize(path);
	// console.log(path);

	// get file contents
	try { var filecontents = fs.readFileSync(path); } catch(e) { console.error(e) }
	if (!filecontents) return 'Article not found.';
	// console.log('article was found. contents=',filecontents);

	// return wikitext, maybe
	var wikitext = filecontents.toString();
	if (which=='wikitext'||args.which=='wikitext'||which=='raw'||rawHtml) return wikitext;

	// convert wikitext to html
	var html = wikiUtil.wikiToHtml(wikitext,name,{db:db});
	return html;
}

function getRevisions(db,name,args) {
	console.log('Article.js > getRevisions');
	var rootPath = config.dropboxRoot;
	var path = rootPath + db + '/' + name + '.txt';
	return dropbox.getRevisions(path);
}

function search(q,db,res,callback) {
	console.log('Article.js > search > db=',db,', q=',q);

	var root = config.wikiroot + db + '/';

	// exact article name search
	var path = root + q + '.txt';
	if (fs.existsSync(path)) return res.redirect('/'+db+'/'+q);

	// similar article name
	var nameMatches = [], textMatches = [], contents = '';
	fs.readdir(root, function(err, files) {
		if (err) return callback(err);

		var re = new RegExp(q,'i');

		for (var i = 0; file = files[i]; i++) {
			if (file.match(q)) nameMatches.push(file);
			try { contents = fs.readFileSync( root+file, 'utf-8' ); } catch(e) {}
			if (contents && contents.match(re)) textMatches.push(file);
		}

		var html = ''+
			'<div class="sectionOuter sectionOuter1">'+
				'<h1>Search Results</h1>'+
				'<div class="section section1">'+
					'<h3>Articles with similar name</h3>'+
					'<div><ul>{nameMatchesHtml}</ul></div>'+
					'<h3>Articles with matching content</h3>'+
					'<div><ul>{textMatchesHtml}</ul></div>'+
				'</div>'+
			'</div>';
		var itemTemplate = '<li><a href="{url}">{label}</a></li>';

		var nameMatchesHtml = nameMatches.map(foo).join('');
		var textMatchesHtml = textMatches.map(foo).join('');

		console.log('nameMatchesHtml=',nameMatchesHtml);
		console.log('textMatchesHtml=',textMatchesHtml);

		html = html.replace('{nameMatchesHtml}',nameMatchesHtml);
		html = html.replace('{textMatchesHtml}',textMatchesHtml);

		console.log('\n\n\n======HTML======');
		console.log(html);

		return callback(null,html);



		function foo(match) {
			return itemTemplate
				.replace( '{url}' , '/'+db+'/'+match )
				.replace( '{label}' , match.replace('.txt','') );
		}



    	// res.status(200).send({ nameMatches:nameMatches, textMatches:textMatches });

		// get menu
		var menuHtml = get('html',db,'_menu').html;

		// get style
		var styleCss = get('wikitext',db,'_style');

    	res.render('index', { title: db+': search', db:db, content: html, menuHtml:menuHtml, styleCss:styleCss });

	});

	// else
	// return res.status(200).send('Unsupported feature. Sorry. :-(');

}

function update(db,name,body,callback) {
	console.log('Article.js > update > db=',db,', name=',name);

	// trailing '.txt' is not necessary
	if (name.match('.txt')) name = name.replace('.txt','');

	// no name? if so, home
	if (!name) name = '_home';

	// home? if so, change path
	if (name=='home') name = '_home';

	// add extension, if needed
	var addExt = name.substr(-5)!='.html';

	// find full path
	var path = config.wikiroot + db + '/' + name + (addExt?'.txt':'');
	path = upath.normalize(path);

	// update file
	fs.writeFile(path,body.toString(),function(err) {
    	if(err) {
        	console.log(err);
        	callback(err,'error');
        	return;
    	}
    	callback(null,'success');
	});

}