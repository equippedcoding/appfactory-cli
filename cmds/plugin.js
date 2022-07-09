import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import ora from 'ora';

const ghdownload = require('github-download'); 
const exec = require('exec');
// const request = require('superagent');
const fs = require('fs');
const ncp = require('ncp').ncp;
const fse = require('fs-extra');

const AdmZip = require('adm-zip');
//const appUtils = require('../utils/app.js'); 


const prompt = require('prompts');

var request = require('request');
var archiver = require('archiver');
var ip = require('ip');
const _eval = require('eval');
const strip = require('strip-comments');
//var loginSupport = require('./support/login_support')();
//var generalSupport = require('./support/general_support')();
import { GeneralSupport } from './support/general_support.js';
const generalSupport = new GeneralSupport();

//var pluginInit = require('./support/file_creator')();
import { FileCreator } from './support/file_creator.js';
const pluginInit = new FileCreator();

var pathModule = require('path');

var ftp = require("basic-ftp");

var Hjson = require('hjson');


var mainConfigFile = "main.config.json"; 


//pluginManager( {r:true}, function(appfacConfig){}, newDir);
export async function PluginSupport(args,gl_callback) {

var currentDir = process.cwd()+"/.it";
var isInRootDir = fse.pathExistsSync(currentDir);
if(!isInRootDir){
	console.log("Please run command from application root directory");
	return false;
}


// if(!isExecutedFromRoot()){
// 	Console.log("Please run command from application root directory");
// 	return false;
// }

var gl_restore = null;

// function GetExecutionDirectory(){
// 	return (gl_directory==undefined) ? process.cwd() : process.cwd()+"/"+gl_directory
// }

// appfactory plugin --create "Plugin Name" --dir "" 
// appfactory plugin --restore plugin_name 
// appfactory plugin -i plugin_dir
// appfactory plugin --import plugin_dir -f

if(args.create!=undefined || args.c!=undefined){
	createNewPluginTemplate();
}else if(args.restore!=undefined || args.r!=undefined){
	restorePlugin();
}else if(args.i!=undefined || args.import!=undefined){
	importPlugin();
}else if(args.css!=undefined){
	createThemeHTMLHeadTagCSS();
}else if(args.o!=undefined || args.on!=undefined){
	turnPluginOnOff();
}


function importPlugin(){
	var srcDir = getPluginPath();
	var destDir = process.cwd()+"/plugins";

	if(typeof srcDir === 'boolean'){
		restorePlugin();
		return;
	}

	if(fs.existsSync(srcDir+"/plugin.config.json")==false){
		console.log("Path given is not a plugin directory");
		return;	
	}

	// https://stackoverflow.com/questions/16695369/how-to-get-last-folder-name-from-folder-path-in-javascript
	var dirname = srcDir.match(/([^\/]*)\/*$/)[1];

	var pluginConfig = fse.readFileSync(srcDir+"/plugin.config.json");

	const filterFunc = (src, dest) => {
		//generalSupport.trace(dest);

		if(fs.existsSync(src)){
			var basename = pathModule.basename(src);
			if(basename.charAt(0) == "."){
				return false;
			}
			return true;
		}
		return false;
	}

	fse.copy(srcDir, destDir+"/"+dirname, { filter: filterFunc }, function (err) {
		if (err) {
			generalSupport.trace(err);
		}// else {
			setTimeout(function(){ 
				restorePlugin();
			},2000);
		//}
	});


}
function getPluginPath(){
	var plugin_path = null;
	if(args.i!=undefined){
		plugin_path = args.i;
	}else if(args.import!=undefined){
		plugin_path = args.import;
	}
	return plugin_path;
}

function turnPluginOnOff(){
	var appfacConfigFile = process.cwd() + "/" + mainConfigFile;
	var on = getIsOn();
	var directory = getDirectory();

	generalSupport.readFile(appfacConfigFile, function(contents){
		var appfacConfig = JSON.parse(contents);
		getPluginConfigFiles(function(pluginConfigs){
			for (var i = 0; i < pluginConfigs.length; i++) {
				if(pluginConfigs[i]['directory']==directory){
					pluginConfigs[i].on = on;
					if(on){
						restorePlugin(pluginConfigs[i],appfacConfig);
					}else{
						updateRestore(pluginConfigs,appfacConfig,appfacConfigFile);
					}
				}
			}
		});
	});
}

function restorePlugin(whichPlugin,appfacConfig){
	if(args.restore!=undefined)
		gl_restore = args.restore;
	else
		gl_restore = args.r;

	var appfacConfigFile = process.cwd() + "/" + mainConfigFile;
	getPluginConfigFiles(function(pluginConfigs){
		//generalSupport.trace(2);
		generalSupport.readFile(appfacConfigFile, function(contents){
			var appfacConfig = JSON.parse(contents);
			//generalSupport.trace(3);
			updateRestore(pluginConfigs,appfacConfig,appfacConfigFile);
		});
	});
}
function updateRestore(pluginConfigs,appfacConfig,appfacConfigFile){
	//generalSupport.trace(4);
	updateConfigPlugins(appfacConfig,pluginConfigs,appfacConfigFile);

	updateIncludesAndPath(pluginConfigs,appfacConfig);

	updateInitFiles(pluginConfigs);

	updateStylesFiles(pluginConfigs,appfacConfig);

	pluginInit.createMainJSFile(appfacConfig);



	var other = appfacConfig["requirejs-config"]["paths"];
	appfacConfig["requirejs-config"]["paths"] = {};
	for(var prop in appfacConfig["requirejs-config"]["libs"]){
		appfacConfig["requirejs-config"]["paths"][prop] = appfacConfig["requirejs-config"]["libs"][prop];
	}
	for(prop in other){
		if(appfacConfig["requirejs-config"]["libs"][prop]==undefined)
			appfacConfig["requirejs-config"]["paths"][prop] = other[prop];
	}

	//generalSupport.writeToFile(appfacConfigFile, JSON.stringify(appfacConfig, null, 4));
	

	var index = -1;
	for(var i=0; i < appfacConfig['indexes']['index']['body'].length; i++){
		if(appfacConfig['indexes']['index']['body'][i].includes('require')){
			index = i;
			break;
		}
	}
	if(index!=-1){
		var x = "<script data-main=\"static/main.js\" src=\"static/requirejs/require.js\"></script>";
		appfacConfig['indexes']['index']['body'][index] = x;		
	}

	fs.writeFileSync(appfacConfigFile, JSON.stringify(appfacConfig, null, 4));


	if(gl_callback!=undefined && typeof gl_callback === 'function'){
		gl_callback(appfacConfig);
	}

	if(args.u!=undefined){
		setTimeout(function(){
			uploadStandardFiles();
		},1000);		
	}

}
function updateStylesFiles(pluginConfigs,appfacConfig){
	if(appfacConfig['indexes']['all']['manual']!=undefined){
		for (var i = 0; i < appfacConfig['indexes']['all']['manual'].length; i++) {
			var does = false;
			var index = -1;
			for (var n = 0; n < appfacConfig['indexes']['all']['head'].length; n++) {
				const found = appfacConfig['indexes']['all']['head'][n].match(appfacConfig['indexes']['all']['manual'][i]);
				if(found){
					does = true;
					break;					
				}
			}

			if(does==false){
				appfacConfig['indexes']['all']['head'].push(appfacConfig['indexes']['all']['manual'][i])
			}
		}

		appfacConfig['indexes']['all']['head'].concat(appfacConfig['indexes']['all']['manual']);
	}
	for(var i=0; i < pluginConfigs.length; i++){
		var plugin = pluginConfigs[i];

		if(plugin['client-active-theme']==undefined)
			continue;

		var registeredActiveThemeDir = plugin['client-active-theme'].split("|")[1];

		if(plugin['client-themes']==undefined)
			continue;

		for(var n=0; n < plugin['client-themes'].length; n++){
			if(plugin['client-themes'][n]['directory'] == registeredActiveThemeDir){

				if(plugin['client-themes'][n]['head']!=undefined && Array.isArray(plugin['client-themes'][n]['head'])){

					for (var v = 0; v < appfacConfig['indexes']['all']['head'].length; v++) {
						var does = false;
						for (var m = 0; m < appfacConfig['indexes']['all']['head'].length; m++) {
							var found = appfacConfig['indexes']['all']['head'][m].match(plugin['client-themes'][n]['head'][v]);
							if(found){
								does = true;
								break;
							}
						}

						if(does==false)
							appfacConfig['indexes']['all']['head'].push(plugin['client-themes'][n]['head'][v]);

					}

				}
				break;
			}
		}
	}
}

function doesExistInHead(appfacConfig){
	var does = false;
	for (var n = 0; n < appfacConfig['indexes']['all']['head'].length; n++) {
		const found = appfacConfig['indexes']['all']['head'][n].match(appfacConfig['indexes']['all']['manual'][i]);
		if(found){
			does = true;
			break;					
		}
	}
	return does;
}

function getDirectory(){
	var directory = "";
	if(args.import!=undefined){
		directory = args.import;
	}else if(args.i!=undefined){
		directory = args.i;
	}
	return directory;
}
function getIsOn(){
	var on = true;
	if(args.f!=undefined && typeof args.f === 'boolean'){
		on = !args.f;
	}
	return on;
}
function updateIncludesAndPath(pluginConfigs,appfacConfig){
	if(appfacConfig['requirejs-config']['libs']==undefined){
		var paths = appfacConfig['requirejs-config']['paths'];
		delete appfacConfig['requirejs-config']['paths'];
		appfacConfig['requirejs-config']['libs'] = {};
		appfacConfig['requirejs-config']['paths'] = paths;

	}

	if(appfacConfig['includes']==undefined)
		appfacConfig['includes'] = {};

	if(appfacConfig['indexes']['all']['head']==undefined){
		appfacConfig['indexes']['all']['head'] = [];
	}

	for (var i = 0; i < pluginConfigs.length; i++) {

		if(pluginConfigs[i]['head']==undefined)
			continue;

		for(var n=0; n < pluginConfigs[i]['head'].length; n++){
			if(pluginConfigs[i]['head']!=undefined){
				var does = false;
				var index = -1;
				for (var m = 0; m < appfacConfig['indexes']['all']['head'].length; m++) {
					if(appfacConfig['indexes']['all']['head'][m] == pluginConfigs[i]['head'][n]){
						does = true;
						index = m;
					}
				}

				if(pluginConfigs[i]['on']==undefined || (pluginConfigs[i]['on']==true)){
					if(does==false){
						appfacConfig['indexes']['all']['head'].push(pluginConfigs[i]['head'][n]);

					}
				}else if(pluginConfigs[i]['on']!=undefined && (pluginConfigs[i]['on']==false)){
					if(does){
						delete appfacConfig['indexes']['all']['head'][index]
					}

				}
			}

		}

	}

	for (var i = 0; i < pluginConfigs.length; i++) {
		if(pluginConfigs[i]['libs']==undefined)
			continue;

		if(appfacConfig['requirejs-config']['libs']==undefined){
			appfacConfig['requirejs-config']['libs'] = {};
		}

		for(prop in pluginConfigs[i]['libs']){
			var includePath = pluginConfigs[i]['libs'][prop];
			var does = false;
			for(prop2 in appfacConfig['requirejs-config']['libs']){
				if(appfacConfig['requirejs-config']['libs'][prop2]==includePath){
					does = true;
					break;
				}
			}
			if(does==false){
				//console.log(pluginConfigs[i]['directory'] + " - " + pluginConfigs[i]['on']);
				if(pluginConfigs[i]['on']==undefined || (pluginConfigs[i]['on']==true)){
					appfacConfig['requirejs-config']['libs'][prop] = pluginConfigs[i]['libs'][prop];
				}else{
					delete appfacConfig['requirejs-config']['libs'][prop];
				}
			}else if(pluginConfigs[i]['on']!=undefined && (pluginConfigs[i]['on']==false)){
				delete appfacConfig['requirejs-config']['libs'][prop];
			}
		}
	}
	for (var i = 0; i < pluginConfigs.length; i++) {
		if(pluginConfigs[i]['includes']!=undefined){
			for(prop in pluginConfigs[i]['includes']){
				var includePath = pluginConfigs[i]['includes'][prop];
				var does = false;
				for(prop2 in appfacConfig['includes']){
					if(appfacConfig['includes'][prop2]==includePath){
						does = true;
						break;
					}
				}
				if(does==false){
					//console.log(pluginConfigs[i]['directory'] + " - " + pluginConfigs[i]['on']);
					if(pluginConfigs[i]['on']==undefined || (pluginConfigs[i]['on']==true)){
						appfacConfig['includes'][prop] = pluginConfigs[i]['includes'][prop];
					}else{
						delete appfacConfig['includes'][prop];
					}
				}else if(pluginConfigs[i]['on']!=undefined && (pluginConfigs[i]['on']==false)){
					delete appfacConfig['includes'][prop];
				}
			}
		}	
	}
	for (var i = 0; i < pluginConfigs.length; i++) {
		if(pluginConfigs[i]['paths']!=undefined){
			for(prop in pluginConfigs[i]['paths']){
				var includePath = pluginConfigs[i]['paths'][prop];
				var does = false;
				for(prop2 in appfacConfig['requirejs-config']['paths']){
					if(appfacConfig['requirejs-config']['paths'][prop2]==includePath){
						does = true;
						break;
					}
				}
				if(does==false){
					if(pluginConfigs[i]['on']==undefined || (pluginConfigs[i]['on']==true)){
					//console.log(pluginConfigs[i]);
						appfacConfig['requirejs-config']['paths'][prop] = pluginConfigs[i]['paths'][prop];
					}else{
						delete appfacConfig['requirejs-config']['paths'][prop];
					}
				}else if(pluginConfigs[i]['on']!=undefined && (pluginConfigs[i]['on']==false)){
					//console.log(44);
					//console.log(pluginConfigs[i]);
					delete appfacConfig['requirejs-config']['paths'][prop];
				}
			}
		}	
	}
}
function updateInitFiles(pluginConfigs){
	for (var i = 0; i < pluginConfigs.length; i++) {
		var pluginDirectory = pluginConfigs[i].directory;
		pluginInit.buildInitFile(pluginDirectory,"default","default",pluginConfigs[i]);
	}	
}
function updateConfigPlugins(appfacConfig,pluginConfigs,appfacConfigFile){

	appfacConfig['application']['plugins'] = [];

	for(var i=0; i < pluginConfigs.length; i++){
		if(pluginConfigs[i].name==undefined || pluginConfigs[i].directory==undefined){
			continue;
		}

		var doesExist = false;
		for (var n = 0; n < appfacConfig['application']['plugins'].length; n++) {
			if(appfacConfig['application']['plugins'][n].directory==pluginConfigs[i].directory){
				doesExist = true;
				break;
			}
		}

		if(doesExist==false){
			if(pluginConfigs[i].on==undefined || (pluginConfigs[i].on!=undefined && pluginConfigs[i].on)){
				if(pluginConfigs[i].active!=undefined && pluginConfigs[i].active==true){
					appfacConfig['application']['plugins'].push({
						'name': pluginConfigs[i].name,
						'directory': pluginConfigs[i].directory,
						'active': true
					});		
				}else{
					appfacConfig['application']['plugins'].push({
						'name': pluginConfigs[i].name,
						'directory': pluginConfigs[i].directory
					});					
				}
			}

		}
	}
}
function getPluginConfigFiles(callback){
	var pluginDirectory = process.cwd() + "/plugins";
	fs.readdir(pluginDirectory, function (err, files) {
		if (err) {
			console.error("Could not list the directory.", err);
			process.exit(1);
		}

		var pluginConfigs = [];

		var found = false;

		files.forEach(function (file, index) {
			// Make one pass and make the file complete
			var fromPath = pathModule.join(pluginDirectory, file);

			fs.stat(fromPath, function (error, stat) {
				if (error) {
				console.error("Error stating file.", error);
				return;
				}

				if (stat.isFile()){
					//console.log("'%s' is a file.", fromPath);
				}else if (stat.isDirectory()){
					//console.log("'%s' is a directory.", fromPath);

					var plugin_config_file = fromPath + "/plugin.config.json";

					if(fs.existsSync(plugin_config_file)){

						generalSupport.readFile(plugin_config_file, function(contents){
							try{

								var p = JSON.parse(contents);

								if(typeof gl_restore === 'string'){
									if(p.directory == gl_restore){
										pluginConfigs.push(p);
										found = true;
									}
								}else{	
									pluginConfigs.push(p);
								}

							}catch(e){
								console.log("Plugin "+file+" JSON config file could not be parsed");
							}
						});
					}
				}
			});
		});

		if(typeof gl_restore === 'string' && found==false){
			console.log("No plugin found for: " + gl_restore);
			return;
		}

		setTimeout(function(){
			//console.log(pluginConfigs);
			callback(pluginConfigs);
		},3000);

	});
}

function createNewPluginTemplate(){

	var currentDir = process.cwd()+"/.it";
	var isInRootDir = fse.pathExistsSync(currentDir);
	if(!isInRootDir){
		console.log("Please run command from application root directory");
		return false;
	}


	if(typeof args.c === "string"){

		var answers = {
			name: args.c,
			directory: args.c
		};
		createNewPluginTemplate11(answers);
	}else if(typeof args.c === "boolean"){
		let interval;
		(async function(){

			var dir_id = "";
			const questions = [
				{
					type: 'text',
					name: 'name',
					message: `Enter Plugin Name (required)`,
					validate: function(value){
						if(value==""){
							return "Plugin name is required";
						}else if(generalSupport.checkIfValid(value,["_",".","-"," "])==false){
							return "Plugin name is not valid";
						}else{
							return true;
						}
					}

				},
				{
					type: 'text',
					name: 'id',
					message: function(prev, values){
						return `Enter Plugin ID - if you want directory name the same add -y flag`;
					},
					validate: function(value){
						var newvalue = value.split(" -y")[0];
						//console.log("|"+newvalue+"|");
						if(value==""){
							return "Plugin id is required";
						}else if(generalSupport.checkIfValid(newvalue,["_","-"])==false){
							return "Plugin id is not valid";
						}else{
							return true;
						}
					}
				},
				{
					type: prev => testPrevAnswer(prev) ? 'text' : null,
					name: 'directory',
					message: function(prev, values){
						return `Enter Plugin Directory Name: (required)`;
					},
					validate: function(value){
						if(value==""){
							return "Directory is required";
						}else if(generalSupport.checkIfValid(value,["_",".","-"])==false){
							return "Directory is not valid";
						}else{
							return true;
						}
					}
				}
				/*
				,{
				type: 'text',
				name: 'id',
				message: function(prev, values){
				return `Enter Plugin ID: (${prev})`;
				}
				},
				{
				type: 'text',
				name: 'init',
				message: `Enter Plugin start file: (optional)`,

				},
				{
				type: 'text',
				name: 'url',
				message: `Enter Plugin URL: (optional)`,

				}
				*/      
			];

			const answers = await prompt(questions, {onCancel:cleanup, onSubmit:cleanup});

			answers.id = answers.id.split(" -y")[0];
			if(answers.directory==undefined){
				answers.directory = answers.id;
			}

			console.log(answers);

			createNewPluginTemplate11(answers);


			function testPrevAnswer(prev){
				var t1 = prev.split();
				var isdirectoryToo = false;
				for (var i = 0; i < t1.length; i++) {
					if(t1[i] == "-y"){
						isdirectoryToo = true;
						break;
					}
				}
				return isdirectoryToo;
			}

		})();

		function cleanup() {
		clearInterval(interval);
		}
	}

}
function readDirNow2(){
	fs.readdir(plugin_path, function (err, files) {
		if (err) {
			console.error("Could not list the directory.", err);
			process.exit(1);
		}

		files.forEach(function (file, index) {
			// Make one pass and make the file complete
			var fromPath = pathModule.join(pluginDirectory, file);

			fs.stat(fromPath, function (error, stat) {
				if (error) {
				console.error("Error stating file.", error);
				return;
				}

				if (stat.isFile()){
					//console.log("'%s' is a file.", fromPath);
				}else if (stat.isDirectory()){
					//console.log("'%s' is a directory.", fromPath);
				}
			});
		});
	});	
}
function createNewPluginTemplate11(answers){

	// appfactory add -admin -plugin "" -name "componentName" -type "js"

	var createNewPluginName = answers.name;
	var createNewPluginDir = answers.directory;
	var createNewPluginId = answers.id;
	/*
	var createNewPluginWithId = answers.id;
	var createNewPluginWithURL = answers.url;
	var createNewPluginInit = answers.init;


	"default":{
	"name": "Default",
	"directory":"default",
	"start":"init"
	"admin-active":true,
	"client-active":true
	}
	*/

	var appfacConfigFile = process.cwd()+"/"+mainConfigFile;
	var appfacConfig = fse.readFileSync(appfacConfigFile);
	appfacConfig = JSON.parse(appfacConfig);

	var plugins = appfacConfig.application.plugins;
	var doesPluginExist = false;
	for (var property in plugins) {
		if (property == createNewPluginId) {
			doesPluginExist = true;
			break;
		}
	}
	if(doesPluginExist){
		console.log("Plugin id already exist: "+createNewPluginId+" - Plugin was Not Created");
		return;
	}

	var allplugins = process.cwd()+"/plugins/";

	fs.readdir(allplugins, function (err, files) {
		if (err) {
			console.error("Could not list the directory.", err);
			process.exit(1);
		} 

		for (var i = 0; i < files.length; i++) {
			if(createNewPluginDir == files[i]){
				console.log("Plugin directory already exist: "+createNewPluginDir+" - Plugin was Not Created");
				return;
			}
		}

		//console.log(createNewPluginName);

		appfacConfig.application.plugins[createNewPluginDir] = {
			"name": createNewPluginName,
			"directory": createNewPluginDir
			// ,"start":"init",
			// "admin-active":true,
			// "client-active":true
		};

		generalSupport.writeToFile(appfacConfigFile, JSON.stringify(appfacConfig, null, 4));

		// plugin directory
		var plugin_admin = process.cwd()+"/plugins/"+createNewPluginDir+"/admin";
		fse.ensureDirSync(plugin_admin);

		var plugin_admin_classes = process.cwd()+"/plugins/"+createNewPluginDir+"/admin/classes";
		fse.ensureDirSync(plugin_admin_classes);

		var plugin_admin_theme = process.cwd()+"/plugins/"+createNewPluginDir+"/admin/themes";
		fse.ensureDirSync(plugin_admin_theme);

		var plugin_client = process.cwd()+"/plugins/"+createNewPluginDir+"/client";
		fse.ensureDirSync(plugin_client);

		var plugin_client_classes = process.cwd()+"/plugins/"+createNewPluginDir+"/client/classes";
		fse.ensureDirSync(plugin_client_classes);

		var plugin_client_theme = process.cwd()+"/plugins/"+createNewPluginDir+"/client/themes";
		fse.ensureDirSync(plugin_client_theme);

		var jsonPluginConfig = pluginInit.createTemplatePluginConfig(createNewPluginName,createNewPluginId,createNewPluginDir);


		var jsonPluginConfigString = jsonPluginConfig;
		var filename = process.cwd()+"/plugins/"+createNewPluginDir+"/plugin.config.json";
		generalSupport.writeToFile(filename, jsonPluginConfigString);

		pluginInit.constructThemeDirectory(createNewPluginName,createNewPluginDir,"default", JSON.parse(jsonPluginConfig));

		pluginInit.createMainJSFile(appfacConfig);

	});

}

function createThemeHTMLHeadTagCSS(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

	getAppfacConfigFile(args.css, function(pluginDir, theme, css_file, appfacConfig){

	 	if(!css_file.endsWith(".css")){
	 		css_file = css_file+".css";
	 	}

		var pluginConfigFile = process.cwd()+"/plugins/"+pluginDir+"/plugin.config.json";
		generalSupport.readFile(pluginConfigFile,function(content){
			var config = null;
			try{
				config = JSON.parse(content);
			}catch(e){
				console.error('plugin.config.json is missing or not valid JSON for plugin: '+pluginDir);
			}

			if(config==null){
				return;
			}

			var css;
			var cssDir;
			var typePath;
			if(args.a==undefined){
				typePath = 'client';
				css = process.cwd()+"/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/"+css_file;
				cssDir = process.cwd()+"/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/";
			}else{
				typePath = 'admin';
				css = process.cwd()+"/plugins/"+pluginDir+"/admin/themes/"+theme+"/styles/css/"+css_file;
				cssDir = process.cwd()+"/plugins/"+pluginDir+"/admin/themes/"+theme+"/styles/css/";
			}

			var doesAdminExist = fs.pathExistsSync(cssDir);
			if(!doesAdminExist){
				fs.ensureDirSync(cssDir);
			}

			generalSupport.writeToFile(css,"");

			var clientConfig = config['client-themes'];
			if(args.a!=undefined){
				clientConfig = config['admin-themes'];
			}

			for (var i = 0; i < clientConfig.length; i++) {
				if(clientConfig[i].directory==theme){
					var csspath = "";
					if(args.a!=undefined)
						csspath = "<link rel=\"stylesheet\" type=\"text/css\" href=\"../../plugins/"+pluginDir+"/"+typePath+"/themes/"+theme+"/styles/css/"+css_file+"\">";
					else
						csspath = "<link rel=\"stylesheet\" type=\"text/css\" href=\"plugins/"+pluginDir+"/"+typePath+"/themes/"+theme+"/styles/css/"+css_file+"\">";
	         		if(clientConfig[i].head==undefined || clientConfig[i].head==null){
	         			clientConfig[i].head = [];
	         		}
	     			clientConfig[i].head.push(csspath);
	     			break;
				}
			}

			if(args.a==undefined)
				config['client-themes'] = clientConfig;
			else
				config['admin-themes'] = clientConfig;

			var configString = JSON.stringify(config, null, 4);
			generalSupport.writeToFile(pluginConfigFile,configString);

		});

	});

} // end of createThemeHTMLHeadTagCSS



function getAppfacConfigFile(param,callback){
	var _config_file = process.cwd()+"/"+mainConfigFile;
	generalSupport.readFile(_config_file,function(content){
		var appfacConfig = JSON.parse(content);
		var appfacActiveTheme = null;
		var appfacActivePlugin = null;
		var p;
		if(args.a==undefined){
			var p1 = appfacConfig['application']['client-active-theme'];
			if(p1!=undefined && p1!=null)
				p = p1.split("|");
		}else{
			var p1 = appfacConfig['application']['admin-active-theme'];
			if(p1!=undefined && p1!=null)
				p = p1.split("|");
		}
		if(p.length==2){
			appfacActivePlugin = p[0];
			appfacActiveTheme = p[1];
		}

		var opts = null;
		if(param.includes("|")){
			opts = param.split("|");
		}else if(param.includes(" ")){
			opts = param.split(" ");
		}else{
			opts = param.split(" ");
		}
		if(opts.length==1){
			var _n1 = opts[0];
			opts[0] = (appfacActivePlugin==null) ? "app" : appfacActivePlugin;
			opts[1] = (appfacActiveTheme==null) ? "default" :appfacActiveTheme;
			opts[2] = _n1;
		}else if(opts.length==2){
			var _n1 = opts[0];
			var _n2 = opts[1];
			opts[0] = (appfacActivePlugin==null) ? "app" : appfacActivePlugin;
			opts[1] = _n1;
			opts[2] = _n2;
		}else if(opts.length==0){
			console.log("Please provide all params \"plugin_name|theme_name|component_name\"");
			return;
		}

		var pluginDir = opts[0];
		var theme = opts[1];
	 	var css_file = opts[2];
		callback(pluginDir, theme, css_file, appfacConfig);
	});
}



function uploadStandardFiles(){
	// https://www.npmjs.com/package/basic-ftp
	// var files = [
	// 	// main.js 
	// 	process.cwd() + "plugins" +
	// ];

	var ftpConfig = getFTPUploadConfig();
	if(ftpConfig==null){
		console.log("No ftp config found")
		return;
	}

	console.log("Uploading standard files...");

	//var projectDir = getProjectDirectory();

	ftpfiles();
	async function ftpfiles() {

	    try {

	        var projectDir = getProjectDirectory();

	        getFilesToUpload(async function(filenames){

			    const client = new ftp.Client()
			    client.ftp.verbose = (args.v==undefined) ? false : true;

		        for (var i = 0; i < filenames.length; i++) {

			        await client.access({
			            host: ftpConfig['host'],
			            user: ftpConfig['user'],
			            password: ftpConfig['password'],
			            secure: false
			        });

					// Log progress for any transfer from now on.
					if(args.v!=undefined){
						console.log(await client.list());

						client.trackProgress(info => {
						    console.log("File", info.name)
						    console.log("Type", info.type)
						    console.log("Transferred", info.bytes)
						    console.log("Transferred Overall", info.bytesOverall)
						});						
					}


		        	var localeFile = filenames[i];
		        	var remoteFile = filenames[i].replace(process.cwd(), ftpConfig['remote_path']);
		        	//await client.uploadFrom(localeFile, remoteFile);
		        	await client.uploadFrom(localeFile, remoteFile);
		        	await client.uploadFrom(localeFile, remoteFile);
		        	// console.log(localeFile);
		        	// console.log(remoteFile);
		        	 
		        	client.close();

		        }

	        });
	        //await client.downloadTo("README_COPY.md", "README_FTP.md")
	    }
	    catch(err) {
	        console.log(err)
	    }
	}
}
function getProjectDirectory(){
	var h = process.cwd().split("/");
	return h[(h.length-1)];

	// https://stackoverflow.com/questions/42956127/get-parent-directory-name-in-node-js/42956762
	//console.log(pathModule.dirname(filename).split(path.sep).pop())
}
function getFTPUploadConfig(){
	var sftpFilePath = process.cwd()+"/sftp-config.json";
	if(fs.existsSync(sftpFilePath) == false){
		return null;
	}
	var sftpfile = fs.readFileSync(sftpFilePath);
	//console.log(sftpfile.toString());
	var ftpObj = Hjson.parse(sftpfile.toString());
	//console.log(ftpObj);
	return ftpObj;
}
function getFilesToUpload(callback){
	var uploadFiles = [];
	uploadFiles.push(process.cwd()+"/main.config.json");

	var staticFile = process.cwd() + "/static/main.js";
	if(fs.existsSync(staticFile))
		uploadFiles.push(staticFile);	

	var pluginsDir = process.cwd() + "/plugins";
	fs.readdir(pluginsDir, function (err, files) {
		if(err) return;

		var pluginConfigs = [];

		files.forEach(function (file, index) {
			// Make one pass and make the file complete
			var fromPath = pathModule.join(pluginsDir, file);

			fs.stat(fromPath, function (error, stat) {
				if (error) {
					console.error("Error stating file.", error);
					return;
				}

				if (stat.isFile()){

				}else if (stat.isDirectory()){

					var pluginconfigFile = fromPath +  "/plugin.config.json";
					if(fs.existsSync(pluginconfigFile))
						uploadFiles.push(pluginconfigFile);

					var initFile = fromPath + "/init.js";
					if(fs.existsSync(initFile))
						uploadFiles.push(initFile);	
					
				}	
			});
		});



		setTimeout(function(){ 
			callback(uploadFiles);
			
			//console.log(uploadFiles);
		},2000);
			

	});
}








  return;


































































































































  var mainJsonConfigFile = process.cwd()+"/plugins/plugin.config.json";
  var does_main_config_exist = fse.pathExistsSync(mainJsonConfigFile);
  var main_config;
  if(does_main_config_exist){
    generalSupport.readFile(mainJsonConfigFile,function(content){

      if(typeof content == "boolean"){
        content = {
          "directories":[],
          "plugins":[] 
        };
      }

      var main_config = JSON.parse(content);
      setcontent(main_config,appfacConfig);

    });
  }else{

    var main_config = {
      "directories":[],
      "plugins":[] 
    };

    setcontent(main_config,appfacConfig);

  }

  function setcontent(mainJSONConfig,appfacConfig){


  if(mainJSONConfig.directories){
    var does_match = false;
    for(var i=0; i<mainJSONConfig.directories.length; i++){
      var m = mainJSONConfig.directories[i].toLowerCase();
      var n = createNewPlugin.trim().toLowerCase();

      try{

        var file = process.cwd()+"/plugins/"+mainJSONConfig.directories[i]+"/plugin.config.json";

        const obj = fse.readJsonSync(file, { throws: false });

        if(obj==undefined || obj==null) continue;
        var isMatched = false;
        if(obj.name!=null || obj.name!=undefined){
          if(obj.name.trim().toLowerCase() == n){
            isMatched = true;
          }
        }

        if(isMatched){
          console.log("Plugin name already exist: "+createNewPlugin+" - Plugin was Not Created");
          does_match = true;
          break;
        }

      }catch(e){
        console.log(e);
      }
    }

    if(does_match){
      return;
    }
  }else{
    mainJSONConfig.directories = [];
  }


  var pluginExist = fse.pathExistsSync(process.cwd()+"/plugins/"+createNewPluginDir);
  if(pluginExist){
    console.log("Plugin directory already exist: "+createNewPluginDir)
    return;
  }

  // plugin directory
  var plugin_admin = process.cwd()+"/plugins/"+createNewPluginDir+"/admin";
  fse.ensureDirSync(plugin_admin);

  var plugin_admin_classes = process.cwd()+"/plugins/"+createNewPluginDir+"/admin/classes";
  fse.ensureDirSync(plugin_admin_classes);

  var plugin_admin_theme = process.cwd()+"/plugins/"+createNewPluginDir+"/admin/themes";
  fse.ensureDirSync(plugin_admin_theme);

  //var a1 = plugin_admin+"/theme_interface.js";

  var plugin_client = process.cwd()+"/plugins/"+createNewPluginDir+"/client";
  fse.ensureDirSync(plugin_client);

  var plugin_client_classes = process.cwd()+"/plugins/"+createNewPluginDir+"/client/classes";
  fse.ensureDirSync(plugin_client_classes);

  var plugin_client_theme = process.cwd()+"/plugins/"+createNewPluginDir+"/client/themes";
  fse.ensureDirSync(plugin_client_theme);



  // plugin components directory
  //var plugin_admin1 = process.cwd()+"/js/plugins/"+createNewPluginDir+"/admin/components";
  //var plugin_client1 = process.cwd()+"/js/plugins/"+createNewPluginDir+"/client/components";
  //fse.ensureDirSync(plugin_admin1);
  //fse.ensureDirSync(plugin_client1);

  // plugin classes directory
  


  // plugin services directory
  var servicePluginDir = process.cwd()+"/services/plugins/"+createNewPluginDir;
  fse.ensureDirSync(servicePluginDir);

  var jsonPluginConfig = {
    "name": createNewPlugin,
    "id": createNewPluginDir,
    "url": "-",
    "start":"init",
    "active": true,
    "directory": createNewPluginDir,
    "services":{
      "dir": "-"
    },
    "admin": [
        {
            "directory": "default",
            "start": "theme_interface"
        }
    ],
    "client": [
        {
            "directory": "default",
            "start": "theme_interface",
            "head": [
                "<link rel=\"stylesheet\" type=\"text/css\" class=\"default\" href=\"./plugins/default/client/themes/default/styles/css/styles.css\">"
            ]
        }
    ]


  };


/*
"client-active-theme": "zibra5|PlayaTheme03",
"admin-active-themes": [{"zibra5":"default"}]
*/

  var jsonPluginConfigString = JSON.stringify(jsonPluginConfig, null, 4);
  var filename = process.cwd()+"/plugins/"+createNewPluginDir+"/plugin.config.json";
  generalSupport.writeToFile(filename, jsonPluginConfigString);

  
  var pluginThemeFile = process.cwd()+"/plugins/"+createNewPluginDir+"/plugin.config.json";
  pluginInit.constructThemeDirectory(pluginThemeFile,createNewPluginDir,"default","theme_interface.js",jsonPluginConfig,"admin");
  pluginInit.constructThemeDirectory(pluginThemeFile,createNewPluginDir,"default","theme_interface.js",jsonPluginConfig,"client");
    

  var topLevelConfigFile = process.cwd()+"/"+mainConfigFile;
  var topLevelConfigFileContents = fs.readFileSync( topLevelConfigFile );
  var topLevelConfig = JSON.parse(topLevelConfigFileContents);

  if(topLevelConfig["application"]["admin-active-themes"]==undefined){
    topLevelConfig["application"]["admin-active-themes"] = {};
    topLevelConfig["application"]["admin-active-themes"][createNewPluginDir] = "default";
  }else{
    topLevelConfig["application"]["admin-active-themes"][createNewPluginDir] = "default";
  }
  generalSupport.writeToFile( topLevelConfigFile, JSON.stringify(topLevelConfig, null, 4) );

  
  
  mainJSONConfig["directories"].push(createNewPluginDir);
  generalSupport.writeToFile( mainJsonConfigFile, JSON.stringify(mainJSONConfig, null, 4) );

  }// end of function





  

  

  return true;

}// end module








/* login */

/*
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

// appfactory plugin --sass "plugin_directory plugin_theme file_name" -a
// { file name options } +base,parent#sub1/comp1,sub2/comp2,sub3/comp3
if(args.sass!=undefined){
	createThemeSASSFiles();
}

// appfactory plugin --css "plugin_directory plugin_theme file_name" -a
if(args.css!=undefined){
	createThemeHTMLHeadTagCSS();
}


// appfactory plugin --remove plugin
if(args.delete!=undefined){
	// ! DONT EVER DELETE PLUGIN
	//removePlugin();
}

// appfactory plugin --restore plugin
if(args['restore-from-delete']!=undefined){
	restorePlugin();
}


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


*/


function removePlugin(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}


	var pluginToRemove = args.remove;

	var globalPluginsConfigFile = process.cwd()+"/"+mainConfigFile;
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

function restorePlugin2(){

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
				  			var configfile = process.cwd()+"/"+mainConfigFile;




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

function createThemeSASSFiles(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

// 
// appfactory plugin --sass "plugin_directory plugin_theme file_name" -a
// parent#sub1/comp1 sub2/comp2 sub3/comp3
// parent#comp1 comp2 comp3
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

 	//console.log(sassFiles);
	// parent#sub1/comp1,sub2/comp2,sub3/comp3

 	var baseFile = "";
	var sassFiles = getSASSFiles();
	createFilesAndDirectories(sassFiles)
 	if(baseFile!=""){
 		updateSASSBaseFile();
 	}





 	function createFilesAndDirectories(files){
 		var base = "";
 		if(args.a==undefined){
 			base = process.cwd()+"/plugins/"+pluginDir+"/client/themes/"+theme+"/styles/sass/";
 		}else{
 			base = process.cwd()+"/plugins/"+pluginDir+"/admin/themes/"+theme+"/styles/sass/";
 		}
 		

 		for (var i = 0; i < files.length; i++) {
 			if(!files[i].includes("+")){

 				var scss = base+""+files[i]+".scss";

				fs.ensureFile(scss, err => {
				  if(err) console.log(err) // => null
				  //console.log("created");
				});

 			}else{
 				var base_scss = base+""+files[i].split("+")[1]+".scss";

				fs.ensureFile(base_scss, err => {
				  if(err) console.log(err) // => null
				  
				});
 			}
 		}

 		console.log("Done");

 	}
 	function getSASSFiles(){
	 	var some = [];
		var sass_files = sass_file.split(",");
		var parentFolder = "";
	 	for(var i=0; i < sass_files.length; i++){
	 		var files = "";
	 		if(sass_files[i].includes("+")){
	 			baseFile = sass_files[i].split("+")[1];
	 		}
	 		if(sass_files[i].includes('#')){
		 		var filesfolders = sass_files[i].split('#');
		 		parentFolder = filesfolders[0];
		 		files = filesfolders[1].split(",");
	 		}else{
	 			files = sass_files[i].split(",");
	 		}

	 		for(var m=0; m < files.length; m++){
	 			var filepath = "";
	 			if(parentFolder!=""){
	 				filepath = parentFolder + "/";
	 			}

	 			filepath += files[m];
	 			some.push(filepath);
	 		}
	 	}
 		return some;
 	}
 	function updateSASSBaseFile(){
 		var pluginConfigFile = process.cwd()+"/plugins/"+pluginDir+"/plugin.config.json";
 		generalSupport.readFile(pluginConfigFile,function(content){
 			var pluginConfig = JSON.parse(content);

 			var base_dir = "./plugins/"+pluginDir+"/client/themes/"+theme+"/styles";

 			var sassBaseFile = base_dir+"/sass/_"+baseFile+".scss";

 			var compiledCSS = base_dir+"/css/sass_stylesheet.css";

 			var index = -1;
 			for (var i = 0; i < pluginConfig['client-themes'].length; i++) {
 				if(pluginConfig['client-themes'][i].directory==theme){
 					index = i;
 					break;
 				}
 			}

 			if(index!=-1){
 				if(pluginConfig['client-themes'][index]['sass']==undefined){
 					pluginConfig['client-themes'][index]['sass'] = {};
 				}

 				pluginConfig['client-themes'][index]['sass']['base'] = sassBaseFile;
 				pluginConfig['client-themes'][index]['sass']['compiled'] = compiledCSS;
 				
 			}

 			generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));
 		});
 	}



}

function createThemeHTMLHeadTagSASS0123456789(){
	if(!isExecutedFromRoot()){
		Console.log("Please run command from application root directory");
		return false;
	}

// appfactory plugin --sass "plugin_directory|plugin_theme|file_name" -a
//appfactory plugin --sass "standered|default|style99"
// parent#sub1/comp1 sub2/comp2 sub3/comp3,
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

		//var globalPluginsConfigFile = process.cwd()+"/js/plugins/plugin.config.json";
		//generalSupport.readFile(globalPluginsConfigFile,function(globalContent){

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



		  //       globalPluginConfig.sass.push({
		  //       	file: sass_file,
		  //       	plugin: pluginDir,
		  //       	theme: theme,
		  //       	client: (args.a==undefined) ? true : false
		  //       });

				// var globalConfigString = JSON.stringify(globalPluginConfig, null, 4);
				// generalSupport.writeToFile(globalPluginsConfigFile,globalConfigString);


				createHead2(pluginDir,theme,htmlTag,args.a,"sass", css);

			});
		//});
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
	var pluginClientConfig = process.cwd()+"/plugins/"+pluginDirectoryName+"/plugin.config.json";

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

	var configFile = process.cwd()+"/"+mainConfigFile;
	generalSupport.readFile(configFile,function(configContent){

		var config = JSON.parse(configContent);
		var plugins = config.application.plugins;

		if(plugins[plugin] == undefined){
			console.log("Plugin does not exist: "+plugin);
			return;
		}

		var pluginDir = plugins[plugin].directory;

		var pluginConfigFile = process.cwd()+"/plugins/"+pluginDir+"/plugin.config.json";
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
					"<link rel=\"stylesheet\" type=\"text/css\" class=\"default\" href=\"./plugins/"+pluginDir+"/client/themes/"+theme+"/styles/css/styles.css\">"
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

/*

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

*/

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
		pathExist = process.cwd()+"/plugins/"+plugin+"/admin/components/"+type;
	}else{
		pathExist = process.cwd()+"/plugins/"+plugin+"/client/components/"+type;
	}


	// check if plugin exist
	var u = process.cwd()+"/plugins/"+plugin;
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
	var _checkIfClassExist = process.cwd()+"/plugins/"+plugin+"/"+check_name;
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
		pathExist = process.cwd()+"/plugins/"+plugin+"/admin/classes";
	}else{
		pathExist = process.cwd()+"/plugins/"+plugin+"/client/classes";
	}

	var u = process.cwd()+"/plugins/"+plugin;
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
			fse.copy(process.cwd(), dir_name, { filter: filterFunc }, err => {
				if (err) return console.error(err)

				//fse.moveSync(dir_name, move_to, { overwrite: true });
				//fse.removeSync(move_to+"/plugin-build");
				var zip_file = "plugin_template.zip";//content["plugin-config"].dir+".zip";
				zipPluginDirectory(move_to, 'plugin_template', zip_file);
				fse.moveSync( dir_name+"/plugin_template.zip", move_to+"/plugin_template.zip", { overwrite: true });
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


		fse.copy(process.cwd(), dir_name, { filter: filterFunc }, err => {
			if (err) return console.error(err)

			//fse.moveSync(dir_name, move_to, { overwrite: true });
			//fse.removeSync(move_to+"/plugin-build");

			//console.log(dir_name);

			var zip_file = content["plugin-config"].dir+".zip";
			zipPluginDirectory(dir_name, __dirname+"/"+content["plugin-config"].dir, __dirname+"/"+zip_file, function(){

				sendPlugin(__dirname+"/"+zip_file,function(){
					var version = pluginConfig['version'];
					var filename = zip_file;
					loginSupport.getLoginCred(function(isEmail,cred){
						updatePluginLocationOnServer(cred,version,filename,isEmail,function(){
							setTimeout(function(){
								fse.removeSync(__dirname+"/"+zip_file);
								fse.removeSync(__dirname+"/"+currentDirname);

								console.log('Done');
							},2000);
						});
					});

				});

			});
			//sendPlugin(process.cwd()+"/"+zip_file,function(){

			//console.log('success!');
		});

		// fse.copy(process.cwd(), dir_name, { filter: filterFunc }, err => {
		// 	if (err) return console.error(err)

		// 	fse.moveSync(dir_name, move_to, { overwrite: true });
		// 	fse.removeSync(move_to+"/plugin-build");
		// 	var zip_file = content["plugin-config"].dir+".zip";
		// 	zipPluginDirectory(move_to, content["plugin-config"].dir, zip_file);
		// 	sendPlugin(process.cwd()+"/"+zip_file,function(){
		// 		var version = pluginConfig['version'];
		// 		var filename = zip_file;
		// 		loginSupport.getLoginCred(function(isEmail,cred){
		// 			updatePluginLocationOnServer(cred,version,filename,isEmail,function(){
		// 				fse.removeSync(move_to+"/plugin-build");
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
//                 var fromPath = pathModule.join( moveFrom, file );
//                 var toPath = pathModule.join( moveTo, file );

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
	var indexConfig = config['indexes']['index'];

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
			fse.moveSync(dirName+"/"+dirName, process.cwd()+"/"+newDir, { overwrite: true });
			fse.removeSync(dirName);
			fse.removeSync(zipFile);
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






































