var config = require('../config.js');
var fs = require('fs');
var wikiUtil = require('../utils/WikiUtil.js');
var upath = require('upath');

exports.get = function(db,name,args){ return get('html',db,name,args) }
exports.getHtml = function(db,name,args){ return get('html',db,name,args) }
exports.getWikitext = function(db,name,args){ return get('wikitext',db,name,args) }
exports.search = function(q,db,req,res) { return search(q,db,req,res) }

function get(which,db,name,args) {
	console.log('Article.js > get > db=',db,', name=',name,', args=',args, ', which=',which);
	if (!args) args = {};

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
	console.log(path);

	// get file contents
	try { var filecontents = fs.readFileSync(path); } catch(e) { console.error(e) }
	if (!filecontents) return 'Article not found.';
	console.log('article was found. contents=',filecontents);

	// return wikitext, maybe
	var wikitext = filecontents.toString();
	if (which=='wikitext'||args.which=='wikitext') return wikitext;

	// convert wikitext to html
	var html = wikiUtil.wikiToHtml(wikitext,name,{db:db});
	return html;
}


function search(q,db,req,res) {
	console.log('Article.js > search > db=',db,', q=',q);

	var root = config.wikiroot + db + '/';

	// exact article name search
	var path = root + q + '.txt';
	if (fs.existsSync(path)) return res.redirect('/'+db+'/'+q);

	// similar article name
	var nameMatches = [], textMatches = [], contents = '';
	fs.readdir(root, function(err, files) {

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