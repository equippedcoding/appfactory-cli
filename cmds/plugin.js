
const ora = require('ora');
const ghdownload = require('github-download'); 
const exec = require('exec');
// const request = require('superagent');
const fs2 = require('fs');
const ncp = require('ncp').ncp;
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const appUtils = require('../utils/app.js');

var formidable = require('formidable');

const prompts = require('prompts');

var request = require('request');
var path = require('path');
var archiver = require('archiver');
var ip = require('ip');
const _eval = require('eval');
const strip = require('strip-comments');
var loginSupport = require('./support/login_support')();
var generalSupport = require('./support/general_support')();
var pluginInit = require('./support/file_creator')();

module.exports = async (args) => {





/* login */

// upload plugin for public use
var upload = "";
if(args.upload!=undefined){
	upload = args.upload;
}else if(args.n!=undefined){
	upload = args.u;
}


// appfactory plugin --theme "" --name "" --start ""
var createPluginTheme = "";
if(args.theme!=undefined){
	createNewThemePlugin();
}


// appfactory plugin --buildFormConfig "plugin_directory"
if(args.buildFormConfig!=undefined){
	buildFormConfig();
}


// appfactory plugin --changeTheme "_default|theme" 
// appfactory plugin --changeTheme "zibra4|themeOne"
if(args.changeTheme!=undefined){
	changePluginTheme();
}



// appfactory plugin --addHeadTagToTheme "plugin_directory|plugin_theme|html_tag|style" -a
if(args.addHeadTagToTheme!=undefined){
	createThemeHTMLHeadTag();
}

// appfactory plugin --sass "plugin_directory|plugin_theme|file_name" -a
if(args.sass!=undefined){
	createThemeHTMLHeadTagSASS();
}

// appfactory plugin --css "plugin_directory plugin_theme file_name" -a
if(args.css!=undefined){
	createThemeHTMLHeadTagCSS();
}


// appfactory plugin --remove plugin
if(args.remove!=undefined){
	removePlugin();
}

// appfactory plugin --restore plugin
if(args.restore!=undefined){
	restorePlugin();
}


/* no login */


// Install Plugin
// --------------
// appfactory plugin
// --intall "plugin_name"
// get/download plugin
var install = "";
if(args.install!=undefined){
	install = args.install;
}else if(args.i!=undefined){
	install = args.i;
}

// Update Plugin
// --------------
// appfactory plugin
// --update "plugin_name"
// update the installed plugin, if plugin is not installed then plugin gets installed
var updateInstalledPlugin = "";
if(args.update!=undefined){
	updateInstalledPlugin = args.update;
}





function removePlugin(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}


	var pluginToRemove = args.remove;

	var globalPluginsConfigFile = process.cwd()+"/config.appfac.js";
	generalSupport.readFile(globalPluginsConfigFile,function(globalContent){
		var mainConfig = JSON.parse(globalContent);

		var plugins = mainConfig['application']['plugins'];

		var plugin = null;
		var pluginName = "";

		for(p in plugins){
			if(p==pluginToRemove){
				plugin = plugins[p];
				pluginName = p;
				break;
			}
		}

		if(plugin==null){
			console.log("plugin does not exist");
			return;
		}


 
		(async () => {
			const response = await prompts([
			{
			  type: 'confirm',
			  name: 'value',
			  message: 'Confirm?',
			  initial: true
			}
			]);

			//console.log(response);

			if(response.value){

				delete mainConfig['application']['plugins'][pluginName];

				var dstpath = __dirname+"/tmp/"+pluginName;
				var srcpath = process.cwd()+"/js/plugins/"+pluginName;

				fs.move(srcpath, dstpath, { overwrite: true }, err => {
				  if (err) return console.error(err);

					console.log("Plugin "+pluginName+" deleted");

					generalSupport.writeToFile(globalPluginsConfigFile,JSON.stringify(mainConfig,null,4));
				});


				// fs.remove(plugindir,function(){

				// 	console.log("Plugin "+pluginName+" deleted");

				// 	generalSupport.writeToFile(globalPluginsConfigFile,JSON.stringify(mainConfig,null,4));
				// });


			}

	  	})();
	});

}

function restorePlugin(){

	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}


	var pluginToRestore = args.restore;

	var tmpDir = __dirname+"/tmp/";
	fs.readdir(tmpDir, function (err, files) {
		if (err) {
		process.exit(1);
		}

		var isMatch = false;
		for (var i = 0; i < files.length; i++) {
			if(files[i]==pluginToRestore){
				isMatch = true;
				break;
			}
		}

		if(isMatch==false){
			console.log("Plugin "+pluginToRestore+" not found");
		}else{
			var dstpath = process.cwd()+"/js/plugins/"+pluginToRestore;
			var srcpath = __dirname+"/tmp/"+pluginToRestore;

			var plugindir = process.cwd()+"/js/plugins";

			fs.readdir(plugindir,function(files){
				var alreadyExist = false;
				for (var i = 0; i < files.length; i++) {
					if(files[i]==pluginToRestore){
						alreadyExist = true;
						break;
					}
				}
				if(alreadyExist==false){
					opperate();
				}else{
					(async () => {
						const response = await prompts([
						{
						  type: 'confirm',
						  name: 'value',
						  message: 'Plugin directory already exist. Do you want to over write?',
						  initial: true
						}
						]);

						if(response.value){
							opperate();
						}

					})();
				}
			});

			function opperate(){
			
				fs.move(srcpath, dstpath, { overwrite: true }, err => {
				  	if (err) return console.error(err);


					var tmpDir = __dirname+"/tmp/deleted_plugins.json";
				  	generalSupport.readFile(tmpDir,function(contents){
				  		var tmpObj = JSON.parse(contents);
				  		var pluginFound = false;
				  		for (var o in tmpObj) {
				  			if(o==pluginToRestore){
				  				pluginFound = true;
				  				break;
				  			}
				  		}

				  		if(pluginFound){
				  			var configfile = process.cwd()+"/config.appfac.js";




				  			generalSupport.readFile(configfile,function(contents2){
				  				var mainpluginconfig = JSON.parse(contents2);

				  				mainpluginconfig['application']['plugins'][pluginToRestore] = tmpObj[pluginToRestore];

				  				generalSupport.writeToFile(configfile,JSON.stringify(mainpluginconfig,null,4));

				  				delete tmpObj[pluginToRestore];
				  				generalSupport.writeToFile(tmpDir,JSON.stringify(tmpObj,null,4));

				  				console.log("Plugin: "+pluginToRestore+" restored");

				  			});
				  		}
				  	});

				});
			}
		}
	});



}





function createThemeHTMLHeadTagCSS(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

	var stuff = null;
	if(args.css.includes("|")){
		stuff = args.css.split("|");
	}else if(args.css.includes(" ")){
		stuff = args.css.split(" ");
	}
	if(stuff.length<3){
		console.log("Please specify plugin_name plugin_theme sass_file");
		return;
	}

	var pluginDir = stuff[0];
	var theme = stuff[1];
 	var css_file = stuff[2];

 	if(!css_file.endsWith(".css")){
 		css_file = css_file+".css";
 	}


	var globalPluginsConfigFile = process.cwd()+"/js/plugins/plugin.config.json";
	generalSupport.readFile(globalPluginsConfigFile,function(globalContent){

		var globalPluginConfig = JSON.parse(globalContent);

		var pluginThemeFile = process.cwd()+"/js/plugins/"+pluginDir+"/plugin.config.json";
		generalSupport.readFile(pluginThemeFile,function(content){
			var config = JSON.parse(content);

			var css;
			if(args.a==undefined){
				css = process.cwd()+"/js/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/"+css_file;
			}else{
				css = process.cwd()+"/js/plugins/"+pluginDir+"/admin/themes/"+theme+"/styles/css/"+css_file;
			}

			var cssDir = process.cwd()+"/js/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/";
			var doesAdminExist = fs.pathExistsSync(cssDir);
			if(!doesAdminExist){
				fs.ensureDirSync(cssDir);
			}

			generalSupport.writeToFile(css,"");

    		var clientConfig = config.client;

    		for (var i = 0; i < clientConfig.length; i++) {
    			if(clientConfig[i].directory==theme){
    				var csspath = "<link rel=\"stylesheet\" type=\"text/css\" class=\"default\" href=\"./js/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/"+css_file+"\">"
             		if(clientConfig[i].head==undefined || clientConfig[i].head==null){
             			clientConfig[i].head = [];
             		}
         			clientConfig[i].head.push(csspath);
         			break;
    			}
    		}
    		config.client = clientConfig;				

			var globalConfigString = JSON.stringify(config, null, 4);
			generalSupport.writeToFile(pluginThemeFile,globalConfigString);

		});
	});
} // end of createThemeHTMLHeadTagCSS


function createThemeHTMLHeadTagSASS(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

// appfactory plugin --sass "plugin_directory|plugin_theme|file_name" -a
//appfactory plugin --sass "standered|default|style99"

	var stuff = null;
	if(args.sass.includes("|")){
		stuff = args.sass.split("|");
	}else if(args.sass.includes(" ")){
		stuff = args.sass.split(" ");
	}
	if(stuff.length<3){
		console.log("Please specify plugin_name plugin_theme sass_file");
		return;
	}

	var pluginDir = stuff[0];
	var theme = stuff[1];
 	var sass_file = stuff[2];

 	var sass_files = sass_file.split(",");
 	for(var i=0; i < sass_files.length; i++){

 		var parentFolder = "";
 		var files = "";
 		if(sass_files[i].includes('#')){
	 		var filesfolders = sass_files[i].split('#');
	 		parentFolder = filesfolders[0];
	 		files = filesfolders[1].split(" ");
 		}else{
 			files = sass_files[i].split(" ");
 		}

 		// parent#sub1/comp1 sub2/comp2 sub3/comp3,
	 	for(var i=0; i < sass_files.length; i++){

	 		var parentFolder = "";
	 		var files = "";
	 		if(sass_files[i].includes('#')){
		 		var filesfolders = sass_files[i].split('#');
		 		parentFolder = filesfolders[0];
		 		files = filesfolders[1].split("+");
	 		}else{
	 			files = sass_files[i].split("+");
	 		}

	 		//console.log(files);

	 		for(var m=0; m < files.length; m++){
	 			var filepath = "";
	 			if(parentFolder!=""){
	 				filepath = parentFolder + "/";
	 			}

	 			filepath += files[m];

	 			_create_sass_file(filepath);

	 		}

	 	}

 	}


 	function _create_sass_file(sass_file){
		var htmlTag;
	 	if(sass_file.includes(".scss")){
	 		htmlTag = "styles/css/"+sass_file.split(".scss")[0]+".css";
	 	}else{
	 		htmlTag = "styles/css/"+sass_file+".css";
	 	}
	 	// if(stuff.length<3){
	 	// 	type = stuff[3];
	 	// }

		// check if plugin and theme exist

		var globalPluginsConfigFile = process.cwd()+"/js/plugins/plugin.config.json";
		generalSupport.readFile(globalPluginsConfigFile,function(globalContent){

			var globalPluginConfig = JSON.parse(globalContent);


			var pluginThemeFile = process.cwd()+"/js/plugins/"+pluginDir+"/plugin.config.json";
			generalSupport.readFile(pluginThemeFile,function(content){
				var config = JSON.parse(content);

				if(config.sass==undefined){
					config.sass = {};
					config.sass.file = [];
				}


				if(!sass_file.includes(".scss")){
					sass_file = sass_file+".scss";
				}
				config.sass.file.push(sass_file);

				var scss;
				var css;
				if(args.a==undefined){
					scss = process.cwd()+"/js/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/sass/"+sass_file;
					css = process.cwd()+"/js/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/sass_styles.css";
				}else{
					scss = process.cwd()+"/js/plugins/"+pluginDir+"/admin/themes/"+theme+"/styles/sass/"+sass_file;
					css = process.cwd()+"/js/plugins/"+pluginDir+"/admin/themes/"+theme+"/styles/css/sass_styles.css";
				}


		        if(globalPluginConfig.sass==undefined){
		        	globalPluginConfig.sass = [];
		        }

		        var does_exist = false;
		        for (var i = globalPluginConfig.sass.length - 1; i >= 0; i--) {

		        	var _plugin = globalPluginConfig.sass[i].plugin;
		        	var _theme = globalPluginConfig.sass[i].theme;
		        	var _file = globalPluginConfig.sass[i].file;

		        	if(pluginDir==_plugin && theme==_theme && _file==sass_file){
		        		does_exist = true;
		        		break;
		        	}

		        	//if(globalPluginConfig.sass[i].file==sass_file){}
		        }
		        if(does_exist){
		        	console.log("SASS file: "+sass_file+" already exist!");
		        	return;
		        }				


				var configString = JSON.stringify(config, null, 4);
				generalSupport.writeToFile(pluginThemeFile,configString);
				
				fs.ensureFile(scss, err => {
				  if(err) console.log(err) // => null
				  console.log("created");
				});

		        // {
		        //     "directory": "default",
		        //     "start": "theme_interface",
		        //     "": [
		        //     ]
		        //     "sass": {
		        //         "watch": true,
		        //         "files":[
		        //             "styles.scss"
		        //         ]
		        //     }
		        // }



		        globalPluginConfig.sass.push({
		        	file: sass_file,
		        	plugin: pluginDir,
		        	theme: theme,
		        	client: (args.a==undefined) ? true : false
		        });

				var globalConfigString = JSON.stringify(globalPluginConfig, null, 4);
				generalSupport.writeToFile(globalPluginsConfigFile,globalConfigString);


				createHead2(pluginDir,theme,htmlTag,args.a,"sass", css);

			});



		});


 	}

 	
	



}

function createThemeHTMLHeadTag(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

	var stuff = null;
	if(args.addHeadTagToTheme.includes("|")){
		stuff = args.addHeadTagToTheme.split("|");
	}else if(args.addHeadTagToTheme.includes(" ")){
		stuff = args.addHeadTagToTheme.split(" ");
	}
	if(stuff.length==3){
		console.log("Please specify plugin_name plugin_theme html_tag");
		return;
	}
	var pluginDir = stuff[0];
	var theme = stuff[1];
 	var htmlTag = stuff[2];
 	var type = null;
 	if(stuff.length>3){
 		type = stuff[3];
 	}

 	//console.log(htmlTag);
 	//console.log(type);

	createHead(pluginDir,theme,htmlTag,args.a,type);
	
	
}



function createHead(pluginDir,theme,htmlTag,client,type){
	var pluginThemeFile = process.cwd()+"/js/plugins/"+pluginDir+"/plugin.config.json";
	generalSupport.readFile(pluginThemeFile,function(content){


		// --addHeadTagToTheme "plugin_directory|plugin_theme|html_tag|style" -a
		// --addHeadTagToTheme "plugin_directory|plugin_theme|html_tag|style"
		// --addHeadTagToTheme "default|default|styles/styles4.css|style"
		var config = JSON.parse(content);

		if(client==undefined){
			applyTag("client",config,htmlTag);
		}else{
			applyTag("admin",config,htmlTag);
		}


		function applyTag(path,config,html_tag){

			var index = -1;
			for (var i = 0; i < config.client.length; i++) {
				var dir = config.client[i].directory;
				if(dir==theme){
					index = i;
					break;
				}
			}

			if(index!=-1){
				var themeConfig = config.client[index];
				if(themeConfig.head==undefined){
					themeConfig.head = [];
				}
				var tag = "";
				if(type!=null){
					if(type=="style"){
						tag = "<link rel=\"stylesheet\" type=\"text/css\" class=\""+pluginDir+"\" href=\"./js/plugins/"+pluginDir+"/"+path+"/themes/"+theme+"/"+html_tag+"\">"
						
						// if style then create the css file also
						var headFileExist = process.cwd()+"/js/plugins/"+pluginDir+"/"+path+"/themes/"+theme+"/"+html_tag;  	
						fs.ensureFile(headFileExist, err => {
						  if(err) console.log(err) // => null
						  // file has now been created, including the directory it is to be placed in
						});
					}else{
						console.log("Type is unknown: "+type);
						return;
					}
				}else{
					tag = html_tag;
				}
				themeConfig.head.push(tag);
			}else{
				console.log("Theme does not exist: "+theme);
				return;
			}
			config.client[index] = themeConfig;

			var configString = JSON.stringify(config, null, 4);
			generalSupport.writeToFile(pluginThemeFile,configString);

		}


	});

}
function createHead2(pluginDir,theme,htmlTag,client,type,css){
	var pluginThemeFile = process.cwd()+"/js/plugins/"+pluginDir+"/plugin.config.json";
	generalSupport.readFile(pluginThemeFile,function(content){

		var config = JSON.parse(content);

		if(client==undefined){
			applyTag("client",config,htmlTag);
		}else{
			applyTag("admin",config,htmlTag);
		}


		function applyTag(path,config,html_tag){

			var index = -1;
			for (var i = 0; i < config.client.length; i++) {
				var dir = config.client[i].directory;
				if(dir==theme){
					index = i;
					break;
				}
			}

			if(index!=-1){
				var themeConfig = config.client[index];
				if(themeConfig.head==undefined){
					themeConfig.head = [];
				}
				var tag = "";
				if(type!=null){
					html_tag = "css/sass_styles.css";
					tag = "<link rel=\"stylesheet\" type=\"text/css\" class=\""+pluginDir+"\" href=\"./js/plugins/"+pluginDir+"/"+path+"/themes/"+theme+"/styles/"+html_tag+"\">"
					
					// if style then create the css file also
					var headFileExist = process.cwd()+"/js/plugins/"+pluginDir+"/"+path+"/themes/"+theme+"/"+html_tag;  	
					fs.ensureFile(css, err => {
					  if(err) console.log(err) // => null
					  // file has now been created, including the directory it is to be placed in
					});
					

				}else{
					tag = html_tag;
				}
				var doesExist = false;
				for (var i = themeConfig.head.length - 1; i >= 0; i--) {
					if(themeConfig.head[i].includes(tag)){
						doesExist = true;
					}
				}
				if (doesExist==false) 
					themeConfig.head.push(tag);
			}else{
				console.log("Theme does not exist: "+theme);
				return;
			}
			config.client[index] = themeConfig;

			var configString = JSON.stringify(config, null, 4);
			generalSupport.writeToFile(pluginThemeFile,configString);

		}


	});

}
function changePluginTheme(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

	var themeParams = [];
	if(args.changeTheme.includes(" ")){
		themeParams = args.changeTheme.split(" ");
	}else if(args.changeTheme.includes(",")){
		themeParams = args.changeTheme.split(",");
	}

	var plugin = themeParams[0];
	var theme = themeParams[1];

	pluginInit.changeTheme(plugin,theme,true);

}



function buildFormConfig(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

	var pluginDirectoryName = args.buildFormConfig;
	//var path = "client";
	var pluginClientConfig = process.cwd()+"/js/plugins/"+pluginDirectoryName+"/plugin.config.json";

	var doesExist = fs.pathExistsSync(pluginClientConfig);
	if(!doesExist){
		console.log("Theme does not exist: "+pluginClientConfig);
		return;
	}

	//var pluginDirectoryName = "zibra5";
	var themeDirectoryName = "PlayaTheme03";
	var startScript = "init.js";
	var pluginConfig = JSON.parse(fs.readFileSync(pluginClientConfig));


	fileCreator.constructThemeDirectory(
		pluginClientConfig,
		pluginDirectoryName,
		themeDirectoryName,
		startScript,
		pluginConfig
	);
}


function isExecutedFromRoot(){
	var isRoot = true;
	var currentDir = process.cwd()+"/.it";
	return fs.pathExistsSync(currentDir);	
}

function createNewThemePlugin(){

	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

	var themeParams = null;
	if(args.theme.includes(",")){
		themeParams = args.theme.split(",");
	}else if(args.theme.includes(" ")){
		themeParams = args.theme.split(" ");
	}
	// appfactory plugin --theme "pluginId,themeName"
	var plugin = themeParams[0];
	var theme = themeParams[1];

	var configFile = process.cwd()+"/config.appfac.js";
	generalSupport.readFile(configFile,function(configContent){

		var config = JSON.parse(configContent);
		var plugins = config.application.plugins;

		if(plugins[plugin] == undefined){
			console.log("Plugin does not exist: "+plugin);
			return;
		}

		var pluginDir = plugins[plugin].directory;

		var pluginConfigFile = process.cwd()+"/js/plugins/"+pluginDir+"/plugin.config.json";
		generalSupport.readFile(pluginConfigFile,function(content){

			var pluginConfig = JSON.parse(content);
			var themes = null;
			var type = "";
			if(args.a){
				type = "admin";
				themes = pluginConfig['admin-themes'];
			}else{
				type = "client";
				themes = pluginConfig['client-themes'];
			}

			for (var i = 0; i < themes.length; i++) {
				if(themes[i].theme == theme){
					console.log("Theme already exist: "+theme);
					return;
				}
			}

			themes.push({
				"directory": theme,
				"start": "theme_interface",
				"head": [
					"<link rel=\"stylesheet\" type=\"text/css\" class=\"default\" href=\"./js/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/styles.css\">"
				]
			});

			generalSupport.writeToFile(pluginConfigFile, JSON.stringify(pluginConfig,null,4));

			pluginInit.constructTypeThemeDirectory(type,pluginDir,theme,plugin);

			var isclient = true;
			if(args.a){
				isclient = false;
			}

			pluginInit.changeTheme(plugin,theme,isclient);

			console.log("theme created");
		});

	});
	
}

function createStartScriptFileName(){
	var startScript = "";
	if(args.a!=undefined){
		startScript = "admin_interface.js";
	}else{
		startScript = "client_interface.js";
	}
	
	if(args.start!=undefined){
		if(!args.start.endsWith(".js")){
			startScript = args.start+".js";
		}else{
			startScript = args.start;
		}
	}
	return startScript;
}



var addPluginComponent = "";
if(args.add!=undefined){
	addPluginComponent = args.add;
}

// Publish Plugin
// --------------
// appfactory plugin
// --publish 
// publishes the plugin and upload it to appfactoryjs website store
var publishPlugin = "";
if(args.publish!=undefined){
	publishPlugin = args.publish;
}


// Publish Plugin Template
// -----------------------
// appfactory plugin
// --publish_template
// publishes the plugin and upload it to appfactoryjs website store
var publishPluginTemplate = "";
if(args.publish_template!=undefined){
	publishPluginTemplate = args.publish_template;
}

if(addPluginComponent!=""){
	addPluginComponentToProject();
}

if(publishPluginTemplate!=""){
	uploadPluginTemplateByMe()
}

if(publishPlugin!=""){
	publishMyPlugin();
}



// appfactory plugin --add --admin|--client --class false --name componentName --type js|html 

//     i      c        a      c 
// <class|component><admin|client> --name --type 
// appfactory plugin --add "Mynewdirectory" -sa --name "" 
// appfactory plugin --add "Mynewdirectory" -ic 
function addPluginComponentToProject(){


	//console.log(args);

	var name = "";
	if(args.name!=undefined){
		name = args.name;
	}else if(args.n!=undefined){
		name = args.n;
	}else{
		console.log("Please provide a component name");
		return;		
	}	

	var pluginName = "";
	if(args.add!=undefined){
		pluginName = args.add;
	}else{
		console.log("Plugin directory is missing");
		return;		
	}

	
	var isNameValid = generalSupport.checkIfValid(name);
	if(!isNameValid){
		console.log("Please provide a valid component name");
		return;
	}

	var isAdmin = false;
	if(args.a!=undefined){
		isAdmin = true;
	}

	
	var selectedAlready = false;
	if(args.e!=undefined){
		selectedAlready = true;
		compComponentOption(pluginName,name,isAdmin);
	}
	
	if(args.s!=undefined && selectedAlready==false){
		classComponentOption(pluginName,name,isAdmin);
	}



	



// appfactory add -admin -plugin "" -name "componentName" -type "js"

//     s      e        a      c 
// <class|component><admin|client> --name --type 
// appfactory plugin --add -ea --name "" 
// appfactory plugin --add -ec --name "" 
// appfactory plugin --add -sa --name ""
// appfactory plugin --add -sc --name "" 
	

// Add new component to client
// appfactory plugin --add "plugin_name" -ec --name "theme_name|new_component_name"
// Add new class to client
// appfactory plugin --add "plugin_name" -sc --name "class_name"

// Add new component to admin
// appfactory plugin --add "plugin_name" -ca --name "theme_name|new_component_name"
// Add new class to admin
// appfactiry plugin --add "plugin_name" -cs --name "class_name"


	// appfactory add -admin -plugin "" -name "componentName" -type "js"


}
function compComponentOption(plugin,name,isAdmin){
	var jsComponent = 
`define(LoadDependencies('`+plugin+`/`+ ((isAdmin==true) ? "admin":"client" ) +`',
// components
[],
// views
[],
// libs
[]
), function(){


function init(app){

}

return init;

});

	`;

	var defaultFileStructure = jsComponent;
	var type;
	var appliedType;
	if(args.type!=undefined){
		appliedType = args.type;
	}else if(args.t!=undefined){
		appliedType = args.t;
	}else{
		if(name.includes(".js")){
			appliedType = "js";
		}else if(name.includes(".html")){
			appliedType = "html";
		}else{
			appliedType = "js";
		}
		
	}
	applyType(appliedType);


/*

plugins/plugin_name/client/classes
plugins/plugin_name/client/themes/theme_name/component

plugins/plugin_name/admin/classes
plugins/plugin_name/admin/themes/theme_name/component

*/

	var pathExist;
	if(isAdmin){
		pathExist = process.cwd()+"/js/plugins/"+plugin+"/admin/components/"+type;
	}else{
		pathExist = process.cwd()+"/js/plugins/"+plugin+"/client/components/"+type;
	}


	// check if plugin exist
	var u = process.cwd()+"/js/plugins/"+plugin;
	var doesExist = fs.pathExistsSync(u);
	if(!doesExist){
		console.log("Plugin does not exist: "+plugin);
		return;
	}

	// check is path exist if not then create
	var doesExist = fs.pathExistsSync(pathExist);
	if(!doesExist){
		fs.ensureDirSync(pathExist);
	}

	//var location = process.cwd()+"/js/client/components/"+type+"/"+name;
	var location = pathExist+"/"+name;

	fs.writeFile(location, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("component "+name+" created");
	}); 



	function applyType(_type){
		if(_type=="js"){
			_apply_js_default_type();
		}else if(_type=="html"){
			type = "html";
			if(!name.includes(".html")) name = name+".html";
		}else{
			_apply_js_default_type();
		}
		function _apply_js_default_type(){
			defaultFileStructure = jsComponent;
			type = "js";
			if(!name.includes(".js")) name = name+".js";
		}
	}



}
function classComponentOption(plugin,name,isAdmin){


	var check_name;
	if(name.includes(".js")){
		check_name = name;
	}else{
		check_name = name+".js";
	}
	if(isAdmin){
		check_name = "admin/"+check_name;
	}else{
		check_name = "client/"+check_name;
	}
	var _checkIfClassExist = process.cwd()+"/js/plugins/"+plugin+"/"+check_name;
	var classExist = fs.pathExistsSync(_checkIfClassExist);
	if(classExist){
		console.log("Class already exist: "+name);
		return;
	}


	var classComponent = 
`define([],function(){

function ${name}(){

}
${name}.prototype = {

};


return ${name};

});

`;
	
	var defaultFileStructure = classComponent;

	var pathExist;
	if(isAdmin){
		pathExist = process.cwd()+"/js/plugins/"+plugin+"/admin/classes";
	}else{
		pathExist = process.cwd()+"/js/plugins/"+plugin+"/client/classes";
	}

	var u = process.cwd()+"/js/plugins/"+plugin;
	var doesExist = fs.pathExistsSync(u);
	if(!doesExist){
		console.log("Plugin does not exist: "+plugin);
		return;
	}

	var location = pathExist+"/"+name+".js";


	//generalSupport.writeToFile(location,defaultFileStructure);

	fs.writeFile(location, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("component "+name+" created");
	}); 





}// END




// Publish Plugin Template
function uploadPluginTemplateByMe(){
	//loginSupport.loginPrompt(function(isLoggedIn){
		var isLoggedIn = true;
		if(isLoggedIn){
					
			var dir_name = __dirname+'/plugin_template_build/template';
			var move_to = __dirname+'/plugin_template_build';//process.cwd()+"/plugin-build";
			const filterFunc = (src, dest) => {
				return true;
			};
			fs2.copy(process.cwd(), dir_name, { filter: filterFunc }, err => {
				if (err) return console.error(err)

				//fs2.moveSync(dir_name, move_to, { overwrite: true });
				//fs2.removeSync(move_to+"/plugin-build");
				var zip_file = "plugin_template.zip";//content["plugin-config"].dir+".zip";
				zipPluginDirectory(move_to, 'plugin_template', zip_file);
				fs2.moveSync( dir_name+"/plugin_template.zip", move_to+"/plugin_template.zip", { overwrite: true });
				sendPluginTemplate(move_to+"/plugin_template.zip");
				//console.log('success!');
			});
		}else{
			console.log("Error logging in")
		}
	//},true);
}


// Publish Plugin
function publishMyPlugin(){
	loginSupport.checkLoginStatus(function(isLoggedIn){
		if(isLoggedIn){
			publishPluginCommand();
		}else{
			loginSupport.loginPrompt(function(isLoggedIn){
				if(isLoggedIn){
					publishPluginCommand();
				}else{
					console.log('Login not successful. Plugin is not published.')
				}
			});
		}
	});
}
function publishPluginCommand(){

	const filterFunc = (src, dest) => {
	  // your logic here
	  // it will be copied if return true

	  var copy = true;
	  //console.log(src);
	  //console.log(dest);

	  var k = src.split("/");
	  var filePath = k[k.length-1];
	  var filePath2 = k[k.length-2];
	  if(filePath=="libs"){
	  	copy = false;
	  }else if(filePath=="r.js"){
	  	copy = false;
	  }else if(filePath==".DS_Store"){
	  	copy = false;
	  }
	  //console.log();

	  return copy;
	}
	var c = process.cwd().split('/');
	var currentDirname = c[c.length-1];
	var dir_name = __dirname+'/'+currentDirname;
	var move_to = process.cwd()+"/plugin-build";
	generalSupport.readFile(process.cwd()+"/plugin.config.json",function(content){
		content = JSON.parse(content);
		var pluginConfig = content['plugin-config'];
		var pass = passPluginConfig(pluginConfig);
		if(pass==false){ 
			console.log('Plugin was Not published!'); 
			return;
		};


		fs2.copy(process.cwd(), dir_name, { filter: filterFunc }, err => {
			if (err) return console.error(err)

			//fs2.moveSync(dir_name, move_to, { overwrite: true });
			//fs2.removeSync(move_to+"/plugin-build");

			//console.log(dir_name);

			var zip_file = content["plugin-config"].dir+".zip";
			zipPluginDirectory(dir_name, __dirname+"/"+content["plugin-config"].dir, __dirname+"/"+zip_file, function(){

				sendPlugin(__dirname+"/"+zip_file,function(){
					var version = pluginConfig['version'];
					var filename = zip_file;
					loginSupport.getLoginCred(function(isEmail,cred){
						updatePluginLocationOnServer(cred,version,filename,isEmail,function(){
							setTimeout(function(){
								fs2.removeSync(__dirname+"/"+zip_file);
								fs2.removeSync(__dirname+"/"+currentDirname);

								console.log('Done');
							},2000);
						});
					});

				});

			});
			//sendPlugin(process.cwd()+"/"+zip_file,function(){

			//console.log('success!');
		});

		// fs2.copy(process.cwd(), dir_name, { filter: filterFunc }, err => {
		// 	if (err) return console.error(err)

		// 	fs2.moveSync(dir_name, move_to, { overwrite: true });
		// 	fs2.removeSync(move_to+"/plugin-build");
		// 	var zip_file = content["plugin-config"].dir+".zip";
		// 	zipPluginDirectory(move_to, content["plugin-config"].dir, zip_file);
		// 	sendPlugin(process.cwd()+"/"+zip_file,function(){
		// 		var version = pluginConfig['version'];
		// 		var filename = zip_file;
		// 		loginSupport.getLoginCred(function(isEmail,cred){
		// 			updatePluginLocationOnServer(cred,version,filename,isEmail,function(){
		// 				fs2.removeSync(move_to+"/plugin-build");
		// 			});
		// 		});
				
		// 	});
		// 	//console.log('success!');
		// });
	});

	function passPluginConfig(pluginConfig){
		var pass = true;
		if(pluginConfig==undefined){
			return false;
		}
		if(pluginConfig['name']==undefined){
			pass = false;
			console.log('plugin.config.json error - param {name} of plugin is required');
		}else if(pluginConfig['version']==undefined && !checkCharacters(pluginConfig['version'])){
			pass = false;
			console.log('plugin.config.json error - param {version} of plugin is required (1.0.0)');
		}else if(pluginConfig['id']==undefined && !checkCharacters(pluginConfig['id'])){
			pass = false;
			console.log('plugin.config.json error - param {id} of plugin is required (with no special characters or spaces except _)');
		}else if(pluginConfig['dir']==undefined && !checkCharacters(pluginConfig['dir'])){
			pass = false;
			console.log('plugin.config.json error - param {dir} (directory) of plugin is required (with no special characters or spaces except _)');
		}else if(pluginConfig['start']==undefined && !checkCharacters(pluginConfig['start'])){
			pass = false;
			console.log('plugin.config.json error - param {start} is required. The initial javascript file to read from (init || init.js) ');			
		}
		return pass;
	}
	function checkCharacters(chars){
		return true;
	}
	function updatePluginLocationOnServer(username,version,filename,is_email,callback){
		var formData = {
			update_plugin_loc: "true",
			is_email: is_email,
			username: username,
			version: version,
			filename: filename
		};
		request.post({
			url:'http://plugins.appfactoryjs.com/includes/request.php', 
			formData: formData
			//,headers: {'Content-Type':'multipart/form-data'}
		}, function optionalCallback(err, httpResponse, resp) {
		  if (err) {
		    return console.error(err);
		  }
		  resp = resp.trim();
		  if(callback!=undefined) callback();
		});

	}

}// end of publishPluginCommand()


    // "plugin-config": {

    //     --Required--
    //     "name":"Users",
    //	   "version":"0.0.1",
    //     "id":"appfactoryjs_users",
    //     "dir":"appfactoryjs_users",
    //     "start":"init",

    //     --Optional--
    //     "url":"https://plugins.appfactoryjs.com/myplugin",
    //     "css":[],
    //     "path":{} 
    // }


// var moveFrom = process.cwd();//"/home/mike/dev/node/sonar/moveme";
// var moveTo = process.cwd()+"/moveto/";//"/home/mike/dev/node/sonar/tome"

// // Loop through all the files in the temp directory
// fs.readdir( moveFrom, function( err, files ) {
//         if( err ) {
//             console.error( "Could not list the directory.", err );
//             process.exit( 1 );
//         } 

//         files.forEach( function( file, index ) {
//                 // Make one pass and make the file complete
//                 var fromPath = path.join( moveFrom, file );
//                 var toPath = path.join( moveTo, file );

//                 fs.stat( fromPath, function( error, stat ) {
//                     if( error ) {
//                         console.error( "Error stating file.", error );
//                         return;
//                     }

//                     if( stat.isFile() )
//                         console.log( "'%s' is a file.", fromPath );
//                     else if( stat.isDirectory() )
//                         console.log( "'%s' is a directory.", fromPath );

//                     fs.copy( fromPath, toPath, function( error ) {
//                         if( error ) {
//                             console.error( "File moving error.", error );
//                         }
//                         else {
//                             console.log( "Moved file '%s' to '%s'.", fromPath, toPath );
//                         }
//                     } );
//                 } );
//         } );
// } );






var	appfacConfig = "plugin.config.json";
var mainJSOutput = "build.js";
var requireConfig = "js/run.config.js";

// fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
// 	//console.log(configFile);
// 	var config = JSON.parse(configFile);
// 	runClientBuild(config);
// });

function runClientBuild(config){
	var requirejsConfig = config['requirejs-config'];
	var indexConfig = config['index-config'];

	var pluginConfig = config['plugin-config'];
	var start = pluginConfig.start;
	if(!start.includes('.js')){
		start = start+".js";
	}
	var clientIndex = "";//buildIndexFile(indexConfig,reverse,mainJSOutput,false);
	//generalSupport.writeToFile("index.html",clientIndex);
	var clientMainJS = process.cwd()+"/js/main.js";
	getMainJSAndAppfactoryStarter(clientMainJS,function(mainJSInputFile,appfactorystarterFile){
		var mainJSOutputFile = "./"+start;//mainJSOutput;
		var requirejsConfigurationOutputFile = process.cwd()+"/"+requireConfig;//requirejsConfig['out'];

		requirejsConfig['name'] = mainJSOutputFile;//process.cwd()+"/"+mainJSOutputFile;
		requirejsConfig['out'] = requirejsConfig['out']
		var requirejsConfigurationInputFile = JSON.stringify(requirejsConfig, null, 4);
		fileWriteSetup(requirejsConfigurationInputFile
			  ,mainJSInputFile
			  ,appfactorystarterFile
			  ,mainJSOutputFile
			  ,requirejsConfigurationOutputFile);


		// async function copyFiles () {
		//   try {
		//     await fs.copy('/tmp/myfile', '/tmp/mynewfile')
		//     console.log('success!')
		//   } catch (err) {
		//     console.error(err)
		//   }
		// }



		// copyFiles()

		//runNodeJSCommand(requirejsConfigurationOutputFile);
	});
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
	
	//console.log(res);
	generalSupport.writeToFile(mainJSOutputFile, `define(${JSON.stringify(res().config.require.require)}, ${res().cb})`);
	generalSupport.writeToFile(requirejsConfigurationOutputFile, JSON.stringify(res().config.config, null, 4));
}
function createNewMainFile(configFile,appfactorystarterFile,mainFile){
	var a = `
var configFileString = ${configFile};
			`;
	var all = a+"\n\n\n"+appfactorystarterFile+"\n\n\n"+mainFile;
	all = all.replace(/AppFactoryStart.NoCapture/g,"AppFactoryStart.Capture");
	//var res = _eval(all2 /*, filename, scope, includeGlobals */)

	//console.log("================================================================================")
	//console.log(all);
	//console.log("================================================================================")
	var res = _eval( 'module.exports = function () { '+all+' \nreturn AppFactoryStart; }' );
	return res;
}






function zipPluginDirectory(archiveDir,archiveDirName,zip_file,callback){

	var output = fs.createWriteStream(zip_file);
	var archive = archiver('zip');

	output.on('close', function () {
	    console.log(archive.pointer() + ' total bytes');
	    //console.log('archiver has been finalized and the output file descriptor has closed.');

	    if(callback!=undefined) callback();
	});

	archive.on('error', function(err){
		console.log(err);
	    throw err;
	});

	archive.pipe(output);


	// append files from a sub-directory and naming it `new-subdir` within the archive
	//archive.directory(process.cwd()+"/"+name, 'new-subdir');
	//archive.directory(archiveDir, archiveDirName);
	 
	// append files from a sub-directory, putting its contents at the root of archive
	//archive.directory('subdir/', false);
	archive.directory(archiveDir, false);


	// archive.bulk([
	//     { expand: true, cwd: 'source', src: ['**'], dest: 'source'}
	// ]);
	archive.finalize();


}


// appfactory plugin --register --user "" --pass ""
// {
// 	name: "",
// 	version: "0.0.1",

// }


function requestAndUnzipPluginDirectory(){
	const source = `http://plugins.appfactoryjs.com/plugins`;
	const zipFile = 'master.zip';
	request
		.get(source)
		.on('error', function(error) {
			console.log(error);
		})
		.pipe(fs.createWriteStream(zipFile))
		.on('finish', function() {
			var zip = new AdmZip(zipFile);
			var zipEntries = zip.getEntries(); // an array of ZipEntry records

			var dirName = zipEntries[0].entryName;
			zip.extractAllTo(dirName, outputDir, true);
			fs2.moveSync(dirName+"/"+dirName, process.cwd()+"/"+newDir, { overwrite: true });
			fs2.removeSync(dirName);
			fs2.removeSync(zipFile);
	});
}



function sendPlugin(pluginName,callback){


	// console.log(process.cwd() + "/" + name);


	//this gives the directory path to this cli 
	//__dirname
	//vs process.cwd() which gives the directory the command is running in

	var formData = {
	  // // Pass a simple key-value pair
	  // upload: 'my_value',
	  // foldername: 'folder123',
	  // Pass data via Buffers
	  // my_buffer: Buffer.from([1, 2, 3]),
	  // // Pass data via Streams
	   my_file: fs.createReadStream(pluginName)
	  // // Pass multiple values /w an Array
	  //attachments: [
	    //fs.createReadStream(process.cwd() + "/" + name)//'/attachment1.jpg'),
	    //fs.createReadStream(__dirname + '/attachment2.jpg')
	  //],
	  // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
	  // Use case: for some types of streams, you'll need to provide "file"-related information manually.
	  // See the `form-data` README for more information about options: https://github.com/form-data/form-data
	  // custom_file: {
	  //   value:  fs.createReadStream('/dev/urandom'),
	  //   options: {
	  //     filename: 'topsecret.jpg',
	  //     contentType: 'image/jpeg'
	  //   }
	  // }
	};
	request.post({
		url:'http://plugins.appfactoryjs.com/includes/uploads.php', 
		formData: formData,
		headers: {'Content-Type':'multipart/form-data'}
	}, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }

	  if(callback!=undefined) callback();


	  //console.log('Upload successful!');
	});


}

function sendPluginTemplate(pluginName){

	var formData = {
	   plugin_template_upload: fs.createReadStream(pluginName)
	};
	request.post({
		url:'http://plugins.appfactoryjs.com/includes/uploads.php', 
		formData: formData,
		headers: {'Content-Type':'multipart/form-data'}
	}, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }

	  console.log(body.trim());
	  console.log('Upload successful!');
	});
}










// creating archives
//var zip = new AdmZip();

// add file directly
//var content = "inner content of the file";
//zip.addFile("test.txt", Buffer.alloc(content.length, content), "entry comment goes here");
// add local file
// zip.addLocalFile("/home/me/some_picture.png");

// zip.addLocalFile(process.cwd()+"/"+name)
// // get everything as a buffer
// var willSendthis = zip.toBuffer();
// // or write everything to disk
// zip.writeZip(/*target file name*/process.cwd()+"/filesforme.zip");


// return;
// var filename = name;//"myplugin";//process.argv[2];

// var target = 'http://plugins.appfactoryjs.com/includes/uploads.php';

// var rs = fs.createReadStream(filename);
// var ws = request.post(target);

// ws.on('drain', function () {
//   console.log('drain', new Date());
//   rs.resume();
// });

// rs.on('end', function () {
//   console.log('uploaded to ' + target);
// });

// ws.on('error', function (err) {
//   console.error('cannot send file to ' + target + ': ' + err);
// });

// rs.pipe(ws);






















	
}

















