
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

var mainConfigFile = generalSupport.mainConfigFile;
 
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

if(args.markup!=undefined){
	createMarkup();
}





function createMarkup(){


	var showdown  = require('showdown');
	var converter = new showdown.Converter();
	    
// appfactory utils --markup --in "" --out "" -a
// appfactory utils --markup --indir "" --outdir "" -a

	var fileIn = args.in;
	var fileOut = args.out;

	var dirIn = args.indir;
	var dirOut = args.outdir;

	if(dirIn!=undefined){

		// var dirDivider = "/";
		// if(process.platform == "win32"){
		// 	dirDivider = "\\";
		// }
		// if(dirIn.includes(dirDivider)){}

		console.log(dirIn);

		fs.ensureDirSync(dirOut);

		fs.readdir(dirIn, (err, files) => {
			files.forEach(file => {

					console.log(file)
				if(!fs.lstatSync(dirIn+"/"+file).isDirectory()){
					var newFileName = file.split(".md")[0];
					write_out_markup_file(dirIn+"/"+file,function(html){
						generalSupport.writeToFile(
							dirOut+"/"+newFileName+".html",
							html
						);
					});
				}
 			



			});
		});

		//fs.readdir(dirIn,function(files1){
			//console.log(files1);
// 			for (var i = 0; i < files.length; i++) {
// 				if(!fs.lstatSync(files[i]).isDirectory()){
// 					var newFileName = files[i].split(".md")[0];
// 					write_out_markup_file(file[i],function(html){
// generalSupport.writeToFile(dirOut+"/"+newFileName+".html",html);
// 					});
// 				}
// 			}
		//});


	}else if(fileIn!=undefined){


	}

	/*

	if(out==undefined){
		
		fs.readdir(process.cwd(),function(files){

			var count = 0;
			for (var i = 0; i < files.length; i++) {
				if(files[i].includes('markup')){
					count++;
				}
			}

			if(count==0){
				fileOut = process.cwd()+"/markup.html";
			}else{
				fileOut = process.cwd()+"/markup"+count+".html";
			}




		});

		
	}else{

	}
	*/

	function write_out_markup_file(file,callback){


		generalSupport.readFile(file,function(content){

			var htmlMarkup = converter.makeHtml(content);

			var isFull = false;
			if(args.a){
				isFull = true;
			}

			var html = 

`
	<style type="text/css">
		.markdown-body .highlight pre, .markdown-body pre {
		    padding: 16px;
		    overflow: auto;
		    font-size: 100%;
		    line-height: 1.45;
		    background-color: #f6f8fa;
		    border-radius: 3px;
		}
	</style>

	<article class="markdown-body" itemprop="text">
		${htmlMarkup}
	</article>


`;
		
			html = makeFullHTMLPage(html,isFull);


			callback(html);

		});


	}// END

	
	function makeFullHTMLPage(content,isFull){

		var html = 
`
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
	${content}
</body>
</html>

`;	
		if(isFull){
			return html;
		}else{
			return content;
		}


	}




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


