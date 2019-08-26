
/*
const ora = require('ora');
const ghdownload = require('github-download');
const exec = require('exec');
const request = require('superagent');
const ncp = require('ncp').ncp;
const admZip = require('adm-zip'); 
*/
const fs = require('fs-extra');
const strip = require('strip-comments');
const generalSupport = require('./support/general_support')();
 
module.exports = async (args) => {


/*
var currentDir = process.cwd()+"/.it";
var isInRootDir = fs2.pathExistsSync(currentDir);
if(!isInRootDir){
	console.log("Please run command in the root of your project!");
	return;
}
*/



if(args.strip!=undefined){
	stripComments();
}



/*

appfactory utils --strip "appactory.js" -lb 

line {Boolean}: if false strip only block comments, default true
block {Boolean}: if false strip only line comments, default true
keepProtected {Boolean}: Keep ignored comments (e.g. /*!, /**! and //!)
preserveNewlines {Boolean}: Preserve newlines after comments are stripped
*/


function stripComments(){

	var filename = args.strip;
	var output = (args.output==undefined) ? "output-"+filename : args.output;
	var file = process.cwd()+"/"+filename;
	generalSupport.readFile(file,function(content){

		var line = (args.l==undefined) ? true : false;
		var block = (args.b==undefined) ? true : false;
		var keepProtected = (args.k==undefined) ? false : true;
		var preserveNewlines = (args.p==undefined) ? false : true;

		var str = strip(content,{
			line: line,
			block: block,
			keepProtected: keepProtected,
			preserveNewlines: false
		});

		var location = process.cwd()+"/"+output;
		fs.writeFile(location, str, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("Done");
		}); 

		



	});




}







};


