var cfg;
if (process.argv[2]=='windows') cfg = { wikiroot:'d:\\Dropbox\\RPG Root\\RPG\\wiki\\' };
else cfg = require('/etc/erza.json');


module.exports = {
	linkbase: '/article/',
	wikiroot: cfg.wikiroot,
	token: 'vEY8dPHtxfAAAAAAAAHX1u-A9JUoZ61A8BoJwgd7zxGaWeaJUDFuaaO_RrjcLJSh',
	dropboxRoot: '/RPG Root/RPG/wiki/'
}