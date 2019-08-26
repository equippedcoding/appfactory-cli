module.exports = (args) => {


const fs2 = require('fs-extra');
const exec = require('exec');
const fs = require('fs');
const _eval = require('eval');
const strip = require('strip-comments');

var currentDir = process.cwd()+"/.it";
var isInRootDir = fs2.pathExistsSync(currentDir);
if(!isInRootDir){
	console.log("Please run command in the root of your project!");
	return;
}

var reverse = false;
if(args.reverse!=undefined){
	reverse = args.reverse;
}else if(args.r!=undefined){
	reverse = args.r;
}


var	appfacConfig = "config.appfac.js";
var mainJSOutput = "build.js";
var requireConfig = "js/run.config.js";

fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
	var config = JSON.parse(configFile);
	runClientBuild(config);
	//runAdminBuild(config);
});

function runClientBuild(config){
	var requirejsConfig = config['requirejs-config'];
	var indexConfig = config['index-config'];
	var clientIndex = buildIndexFile(indexConfig,reverse,mainJSOutput,false);
	writeToFile("index.html",clientIndex);
	var clientMainJS = process.cwd()+"/js/main.js";
	getMainJSAndAppfactoryStarter(clientMainJS,function(mainJSInputFile,appfactorystarterFile){
		var mainJSOutputFile = "./"+mainJSOutput;
		var requirejsConfigurationOutputFile = process.cwd()+"/"+requireConfig;//requirejsConfig['out'];

		requirejsConfig['name'] = mainJSOutputFile;//process.cwd()+"/"+mainJSOutputFile;
		requirejsConfig['out'] = requirejsConfig['out']
		var requirejsConfigurationInputFile = JSON.stringify(requirejsConfig, null, 4);
		fileWriteSetup(requirejsConfigurationInputFile
			  ,mainJSInputFile
			  ,appfactorystarterFile
			  ,mainJSOutputFile
			  ,requirejsConfigurationOutputFile);

		runNodeJSCommand(requirejsConfigurationOutputFile);
	});
}


function runAdminBuild(config){
	var requirejsConfig = config['requirejs-config'];
	var indexAdminConfig = config['index-admin-config'];
	var adminIndex = buildIndexFile(indexAdminConfig,reverse,mainJSOutput,true);
	writeToFile("control_panel/admin/index.php",adminIndex);
	var adminMainJS = process.cwd()+"/control_panel/admin/js/main.js";
	getMainJSAndAppfactoryStarter(adminMainJS,function(mainJSInputFile,appfactorystarterFile){
		//var mainJSOutputFile = "./"+mainJSOutput;
		//var mainJSOutputFile = process.cwd()+"/control_panel/admin/"+mainJSOutput;
		var mainJSOutputFile = "./control_panel/admin/"+mainJSOutput;
		var requirejsConfigurationOutputFile = process.cwd()+"/control_panel/admin/"+requireConfig;

		requirejsConfig['name'] = mainJSOutputFile;//process.cwd()+"/"+mainJSOutputFile;
		requirejsConfig['out'] = requirejsConfig['out'];
		requirejsConfig['path'] = reformPath(requirejsConfig['path']);
		var requirejsConfigurationInputFile = JSON.stringify(requirejsConfig, null, 4);
		fileWriteSetup(requirejsConfigurationInputFile
			  ,mainJSInputFile
			  ,appfactorystarterFile
			  ,mainJSOutputFile
			  ,requirejsConfigurationOutputFile);

		runNodeJSCommand(requirejsConfigurationOutputFile);
	});
}

function reformPath(path){
	var newPath = {};
	for(var i in path){
		newPath[i] = "../../"+path[i];
	}
	return newPath;
}





function runAdminBuild123(config){
	var requirejsConfig = config['requirejs-config'];
	var indexAdminConfig = config['index-admin-config'];
	var adminIndex = buildIndexFile(indexAdminConfig,reverse,mainJSOutput,true);
	writeToFile("control_panel/admin/index.php",adminIndex);
	var adminMainJS = process.cwd()+"/control_panel/admin/js/main.js";
	getMainJSAndAppfactoryStarter(adminMainJS,function(mainJSInputFile,appfactorystarterFile){
		var mainJSOutputFile = process.cwd()+"/control_panel/admin/"+mainJSOutput;
		var requirejsConfigurationOutputFile = process.cwd()+"/control_panel/admin/"+requirejsConfig['out'];

		requirejsConfig['name'] = mainJSOutputFile;
		var requirejsConfigurationInputFile = JSON.stringify(requirejsConfig, null, 4);

		fileWriteSetup(requirejsConfigurationInputFile
			  ,mainJSInputFile
			  ,appfactorystarterFile
			  ,mainJSOutputFile
			  ,requirejsConfigurationOutputFile);

		runNodeJSCommand(mainJSOutputFile);
	});
}

function buildIndexFile(indexConfig,reverse,output,isPhp){


	if(reverse && isPhp){
		return createIndexPHPFile();
	}

	var index_meta = "",
	    index_head = "",
		index_title = "",
		index_body = "";
		index_scripts = "",
		index_doctype = "";
	var defaultDoctype = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">";
	var index_title = (indexConfig['title']==undefined) ? "" : indexConfig['title'];
	var index_doctype = (indexConfig['doctype']==undefined) ? defaultDoctype : indexConfig['doctype'];

	var metaConf = indexConfig['meta'];
	for(var i=0; i<metaConf.length; i++){
		if(index_meta=="")
			index_meta = "\t"+metaConf[i];
		else
			index_meta = index_meta+"\n\t"+metaConf[i];
	}

	var headConf = indexConfig['head'];
	for(var i=0; i<headConf.length; i++){
		if(index_head=="")
			index_head = "\t"+headConf[i];
		else
			index_head = index_head+"\n\t"+headConf[i];
	}

	var bodyConf = indexConfig['body'];
	for(var i=0; i<bodyConf.length; i++){
		if(index_body=="")
			index_body = "\t"+bodyConf[i];
		else
			index_body = index_body+"\n\t"+bodyConf[i];
	}

	var scriptsConf = indexConfig['scripts'];

	if(reverse==false){
		if(index_scripts==""){
			index_scripts = '\t<script src="'+output+'"></script>';
		}else{
			index_scripts = index_scripts+'\n\t<script src="'+output+'"></script>';
		}
	}else{
		// requirejs-script
		if(index_scripts==""){
			index_scripts = '\t'+scriptsConf['requirejs-script'];
		}else{
			index_scripts = index_scripts+'\n\t'+scriptsConf['requirejs-script'];
		}
	}
	// appfactorystarter-script
	if(index_scripts==""){
		index_scripts = '\t'+scriptsConf['appfactorystarter-script'];
	}else{
		index_scripts = index_scripts+'\n\t'+scriptsConf['appfactorystarter-script'];
	}

	var indexHTML = createIndexFile(index_doctype,index_meta,index_head,index_title,index_body,index_scripts,isPhp);
	return indexHTML;
}

function writeToFile(file,content){
	var writeStream = fs.createWriteStream(file);
	writeStream.write(content);
	writeStream.end();
}
function getMainJSAndAppfactoryStarter(mainjsFile,callback){
	fs.readFile('js/libs/appfactoryjs/appfactorystarter.js', 'utf8', function(err1, appfactorystarterFile) {
		fs.readFile(mainjsFile, 'utf8', function(err2, mainFile) {
			callback(mainFile,appfactorystarterFile);
		});
	});
}

function fileWriteSetup(requirejsConfigurationInputFile
			  ,mainJSInputFile
			  ,appfactorystarterInputFile
			  ,mainJSOutputFile
			  ,requirejsConfigurationOutputFile){
	var res = createNewMainFile(requirejsConfigurationInputFile,appfactorystarterInputFile,mainJSInputFile);
	writeToFile(mainJSOutputFile, `requirejs(${JSON.stringify(res().config.require.require)}, ${res().cb})`);
	writeToFile(requirejsConfigurationOutputFile, JSON.stringify(res().config.config, null, 4));
}

function createNewMainFile(configFile,appfactorystarterFile,mainFile){
	var a = `
var configFileString22 = ${configFile};
			`;
	var all = a+"\n\n\n"+appfactorystarterFile+"\n\n\n"+mainFile;
	all = all.replace(/AppFactoryStart.NoCapture/g,"AppFactoryStart.Capture");
	//var res = _eval(all2 /*, filename, scope, includeGlobals */)

	//writeToFile("hello234.js",all);

	//console.log("================================================================================")
	//console.log(all);
	//console.log("================================================================================")
	var res = _eval( 'module.exports = function () { '+all+' \nreturn AppFactoryStart; }' );

	//console.log(res());
	return res;
}
function runNodeJSCommand(buildRunConfig){
	// node r.js -o js/build-run-config.js
	var dir = exec(`node r.js -o ${buildRunConfig}`, function(err, stdout, stderr) {
	  	console.log("==================================================");
	  	if(err) console.log(err);
	  	console.log("--------------------------------------------------");
	  	if(stdout) console.log(stdout);
	  	console.log("--------------------------------------------------");
	  	if(stderr) console.log(stderr);
	  	console.log("==================================================");
	  
	});

	dir.on('exit', function (code) {
	  // exit code is code
	  console.log(code);
	});
}

function createIndexPHPFile(){
	var indexHTML = 
`<?php
if(file_exists("includes/core/config/master_config.php")){
	require_once "init_config.php";
}else{
 	require_once "init_index.php";
}
?>
`;

return indexHTML;
}
function createIndexFile(doctypeConf,metaConf,headConf,titleConf,bodyConf,scriptsConf,isPhp){
	var php = "";
	if(isPhp){
		php = 
`<?php
if(!file_exists("includes/core/config/master_config.php")){
	header("Location: init_config.php"); 
	exit();
}
require_once "includes/core/init.php";
?>
`;
	}

	var indexHTML = 
`${php}
	${doctypeConf}
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
	${metaConf}
	

  	${headConf}

	<title>${titleConf}</title>
</head>
<body>  



	${bodyConf}

	${scriptsConf}
</body>
</html>
`;
	return indexHTML;
}






};





























	// function handleHTMLFile(indexConfig,requirejsConfig){
	// 	var defaultDoctype = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">";
	// 	var index_title = (indexConfig['title']==undefined) ? "" : indexConfig['title'];
	// 	var index_doctype = (indexConfig['doctype']==undefined) ? defaultDoctype : indexConfig['doctype'];
		

	// 	var metaConf = indexConfig['meta'];
	// 	for(var i=0; i<metaConf.length; i++){
	// 		if(index_meta=="")
	// 			index_meta = "\t"+metaConf[i];
	// 		else
	// 			index_meta = index_meta+"\n\t"+metaConf[i];
	// 	}

	// 	var headConf = indexConfig['head'];
	// 	for(var i=0; i<headConf.length; i++){
	// 		if(index_head=="")
	// 			index_head = "\t"+headConf[i];
	// 		else
	// 			index_head = index_head+"\n\t"+headConf[i];
	// 	}

	// 	var bodyConf = indexConfig['body'];
	// 	for(var i=0; i<bodyConf.length; i++){
	// 		if(index_body=="")
	// 			index_body = "\t"+bodyConf[i];
	// 		else
	// 			index_body = index_body+"\n\t"+bodyConf[i];
	// 	}

	// 	var scriptsConf = indexConfig['scripts'];

	// 	// build-output-script
	// 	if(reverse==false){
	// 		if(index_scripts==""){
	// 			index_scripts = '\t<script src="'+outputBuild+'"></script>';
	// 		}else{
	// 			index_scripts = index_scripts+'\n\t<script src="'+outputBuild+'"></script>';
	// 		}
	// 	}else{
	// 		// requirejs-script
	// 		if(index_scripts==""){
	// 			index_scripts = '\t'+scriptsConf['requirejs-script'];
	// 		}else{
	// 			index_scripts = index_scripts+'\n\t'+scriptsConf['requirejs-script'];;
	// 		}
	// 	}
	// 	// appfactorystarter-script
	// 	if(index_scripts==""){
	// 		index_scripts = '\t'+scriptsConf['appfactorystarter-script'];
	// 	}else{
	// 		index_scripts = index_scripts+'\n\t'+scriptsConf['appfactorystarter-script'];;
	// 	}


	// 	var indeHTML = createIndexFile(
	// 				 index_doctype
	// 				,index_meta
	// 				,index_head
	// 				,index_title
	// 				,index_body
	// 				,index_scripts
	// 			);

	// 	var writeStream = fs.createWriteStream('index.html');
	// 	writeStream.write(indeHTML);
	// 	writeStream.end();
	// 	if(reverse==false){
	// 		setTimeout(function(){
	// 			fs.readFile('js/config/libs/appfactorystarter.js', 'utf8', function(err, appfactorystarterFile) {
	// 				fs.readFile('js/main.js', 'utf8', function(err, mainFile) {
	// 					console.log(process.cwd());
	// 					var buildRunConfig = "build-run-config.js";
	// 					var buildRunMin = outputBuild;
	// 					requirejsConfig['name'] = process.cwd()+"/"+buildRunMin
	// 					var conf = JSON.stringify(requirejsConfig, null, 4);
	// 					setup(conf,appfactorystarterFile,mainFile,buildRunMin,buildRunConfig);

	// 					// name: '/Users/jamesmitchell/Desktop/appfactoryjs/me1/newapp/js/main.js',
	// 				});
	// 			});
	// 		},1500);			
	// 	}
	// }





