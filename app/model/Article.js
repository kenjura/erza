var config = require('../config.js');
var fs = require('fs');
var wikiUtil = require('../utils/WikiUtil.js');

exports.get = function(db,name,args){ return get('html',db,name,args) }
exports.getHtml = function(db,name,args){ return get('html',db,name,args) }
exports.getWikitext = function(db,name,args){ return get('wikitext',db,name,args) }

function get(which,db,name,args) {
	console.log('Article.js > get > db=',db,', name=',name,', args=',args);

	// trailing '.txt' is not necessary
	if (name.match('.txt')) name = name.replace('.txt','');

	// no name? if so, home
	if (!name) name = '_home';

	// home? if so, change path
	if (name=='home') name = '_home';

	// find full path
	var path = config.wikiroot + db + '/' + name + '.txt';

	// get file contents
	try { var filecontents = fs.readFileSync(path); } catch(e) { console.error(e) }
	if (!filecontents) return 'Article not found.';

	// return wikitext, maybe
	var wikitext = filecontents.toString();
	if (which=='wikitext') return wikitext;

	// convert wikitext to html
	var html = wikiUtil.wikiToHtml(wikitext,name,{db:db});
	return html;
}