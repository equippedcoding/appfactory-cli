module.exports = (args) => {


const fs2 = require('fs-extra');
const exec = require('exec');
const fs = fs2;
const _eval = require('eval');
const strip = require('strip-comments');

var generalSupport = require('./support/general_support')();

var request = require('request');

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





function isExecutedFromRoot(){
	var isRoot = true;
	var currentDir = process.cwd()+"/.it";
	return fs.pathExistsSync(currentDir);	
}


if(!isExecutedFromRoot()){
	Console.log("Please run command from application root directory");
	return false;
}

var	appfacConfig = "config.appfac.js";
fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
	var config = JSON.parse(configFile);
	runClientBuild(config);
});


function runClientBuild(config){

	var pluginTheme = config['application']['client-active-theme'];
	if(pluginTheme==undefined){
		console.log('property client-active-themeis required, app did not build.')
		return;
	}

	var plugin = pluginTheme.split("|")[0];
	var theme = pluginTheme.split("|")[1];

	if(plugin==undefined || theme==undefined){
		console.log('property client-active-themeis required, app did not build.')
		return;
	}

	fs.ensureDirSync(process.cwd()+"/js/build/");
	var buildconfigfile = process.cwd()+"/build-config.js";
	generalSupport.writeToFile(buildconfigfile,JSON.stringify(config['requirejs-config'],null,4));


	var htmlObj = config['index-config'];
	var meta = '';
	for (var i = 0; i < htmlObj['meta'].length; i++) {
		meta += "\n\r"+htmlObj['meta'][i];
	}

	var head = '';
	for (var i = 0; i < htmlObj['head'].length; i++) {
		head += "\n\r"+htmlObj['head'][i];
	}

	var body = '';
	for (var i = 0; i < htmlObj['body'].length; i++) {
		if(htmlObj['body'][i].includes('js/libs/requirejs/require.js')==false){
			body += "\n\r"+htmlObj['body'][i];
		}
	}

	body += "\n\r <script src=\"js/libs/requirejs/require.js\"></script>"
	body += "\n\r <script src=\""+config['requirejs-config']['out']+"\"></script>";

	var htmlstring = 
`${htmlObj['doctype']}
<html>
<head>
	${meta}
	${head}
	<title>${htmlObj['title']}</title>
</head>
<body>
	

	${body}
</body>
</html>


`;

	generalSupport.writeToFile(process.cwd()+"/static-index.html",htmlstring);

	runNodeJSCommand(buildconfigfile);

	
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

	  	setTimeout(function(){
	  		fs.removeSync(buildRunConfig)
	  	},2000);
	  
	});

	dir.on('exit', function (code) {
	  // exit code is code
	  console.log(code);
	});
}


function reformPath(path){
	var newPath = {};
	for(var i in path){
		newPath[i] = "../../"+path[i];
	}
	return newPath;
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






