import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import('../utils/polyfills.js');
const fs = require('fs-extra');

import { GeneralSupport } from './support/general_support.js';

const generalSupport = new GeneralSupport();
const mainConfigFile = "main.config.json";
/*
const ora = require('ora');
const ghdownload = require('github-download'); 
const exec = require('exec');
// const request = require('superagent');
const fs2 = require('fs');
const ncp = require('ncp').ncp; 

const AdmZip = require('adm-zip');
const appUtils = require('../utils/app.js');

var formidable = require('formidable');

const prompt = require('prompts');

var request = require('request');
var path = require('path');
var archiver = require('archiver');
var ip = require('ip');
const _eval = require('eval');
const strip = require('strip-comments');
const exp = require('constants');
var loginSupport = require('./support/login_support')();
var generalSupport = require('./support/general_support')();

var mainConfigFile = generalSupport.mainConfigFile;
*/


export function Add(args){
	if(isExecutedFromRoot()){
		if(args.component!=undefined){
			configureComponent(args);
		}else if(args.class!=undefined){
			createNewClass(args);
		}
	}
};
function isExecutedFromRoot(){
	var isRoot = true;
	var currentDir = process.cwd()+"/main.config.json";
	const isroot = fs.pathExistsSync(currentDir);
	if(isroot==false)
		console.log("Please run command in project root directory!");
	return isroot;	
}
function createNewClass(args){
	getAppfacConfigFile(args, 'class', args.class, function(){

		var opts = null;
		if(args.class.includes("|")){
			opts = args.class.split("|");
		}else if(args.class.includes(" ")){
			opts = args.class.split(" ");
		}else{
			opts = args.class.split(" ");
		}

		if(opts.length==1){
			var _n1 = opts[0];
			opts[0] = "app";
			opts[1] = _n1
		}else if(opts.length==0){
			console.log("Please provide all params \"plugin_name class_name\"");
			return;
		}

		var pluginName = opts[0];
		var className = opts[1];

		var path = "client";
		if(args.a!=undefined){
			path = "admin";
		}

		// check that plugin exist
		var pluginPath = process.cwd()+"/plugins/"+pluginName;
		var pluginDoesExist = fs.pathExistsSync(pluginPath);
		if(!pluginDoesExist){
			console.log("Plugin does not exist: "+pluginName);
			return;
		}

		// check that component has no spaces and any special characters except _
		var isNameValid = generalSupport.checkIfValid(className,["_","-"," ",".","/","(",")","[","]","+","=","*","*","%","$","#","@","!","|","\\"]);
		if(!isNameValid){
			console.log("Please provide a valid class name");
			return;
		}
		
		var configFile = process.cwd()+"/"+mainConfigFile;
		var pluginConfigFile = process.cwd()+"/plugins/"+pluginName+"/plugin.config.json";
		generalSupport.readFile(configFile,function(content){
			var config = JSON.parse(content);
			generalSupport.readFile(pluginConfigFile,function(content2){
				var pluginConfig = JSON.parse(content2);
				classComponentOption(pluginName,className,path,config,configFile,pluginConfig,pluginConfigFile);
			});
		});
	});
}
function configureComponent(args){
	getAppfacConfigFile(args,'component', args.component, function(pluginName,themeName,compName,appfacConfig){

		var path = "client";
		if(args.a!=undefined){
			path = "admin";
		}

		var pluginConfigFile = process.cwd()+"/plugins/"+pluginName+"/plugin.config.json";

		// check that plugin exist
		var pluginPath = process.cwd()+"/plugins/"+pluginName;
		var pluginDoesExist = fs.pathExistsSync(pluginPath);
		if(!pluginDoesExist){
			console.log("Plugin does not exist: "+pluginName);
			return;
		}

		// check that theme exist
		var themePath = process.cwd()+"/plugins/"+pluginName+"/"+path+"/themes/"+themeName;
		var themeDoesExist = fs.pathExistsSync(themePath);
		if(!themeDoesExist){
			console.log("Plugin theme does not exist: "+themeName);
			return;
		}

		// check that component has no spaces and any special characters except _
		var isNameValid = generalSupport.checkIfValid(compName,["_","-"]);
		if(!isNameValid){
			console.log("Please provide a valid component name");
			return;
		}

		var configFile = process.cwd()+"/"+mainConfigFile;
		var pluginConfigFile = process.cwd()+"/plugins/"+pluginName+"/plugin.config.json";
		generalSupport.readFile(configFile,function(content){
			var config = JSON.parse(content);

			generalSupport.readFile(pluginConfigFile,function(content2){
				var pluginConfig = JSON.parse(content2);

				compComponentOption(args,pluginName,themeName,compName,path,config,configFile,pluginConfig,pluginConfigFile);

			});
		});
	});
}
function getAppfacConfigFile(args,type,param,callback){
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

		if(type=='class'){

			var filename = "";
			var opts = null;
			if(param.includes("|")){
				opts = param.split("|");
			}else if(param.includes(" ")){
				opts = param.split(" ");
			}else{
				opts = param.split(" ");
			}

			if(opts.length==1){
				pluginDir = "app";
				filename = p[0];
			}else if(opts.length==2){
				pluginDir = p[0];
				filename = p[1];
			}

			var obj = {
				plugin: pluginDir,
				filename: filename
			};


			callback(obj);

		}else if(type=='component'){
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

			callback(pluginDir,theme,css_file,appfacConfig);
		}

		
	});
}
function compComponentOption(args,pluginName,themeName,compName,path,config,configFile,pluginConfig,pluginConfigFile){

	// path = client | admin 

	var jsComponent = 
`define(function(require, exports, module){

function init(app){


}

return init;

});

	`;


	var name = compName;

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


	var filepath = "plugins/"+pluginName+"/"+path+"/themes/"+themeName+"/components/"+type;
	var pathExist = process.cwd()+"/"+filepath;

	// check is path exist if not then create
	//var doesExist = fs.pathExistsSync(pathExist);

	var requireFilePathWithExtension = filepath+"/"+name;
	var requireFilePathWithOutExtension = filepath+"/"+compName;
	
	var location = pathExist+"/"+name;

	if(fs.pathExistsSync(location)){
		writeToObjects();
		console.log("Component already exist: "+name);
		return;
	}

	fs.ensureDirSync(pathExist);

	if(type=="html"){
		defaultFileStructure = "";
	}

	fs.writeFile(location, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    if(type=="html")
	    	writeHTML();
	    else
	    	writeToObjects();
	    

	    console.log("component "+name+" created");
	}); 

	function writeHTML(){
		if(pluginConfig['includes']==undefined){
			pluginConfig['includes'] = {};
		}

		pluginConfig['includes'][compName] = requireFilePathWithOutExtension;
		generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));

		if(config['includes']==undefined) config['includes'] = {};
		config['includes'][compName] = requireFilePathWithExtension;
		generalSupport.writeToFile(configFile,JSON.stringify(config,null,4));
	}


	function writeToObjects(){
		if(pluginConfig['paths']==undefined){
			pluginConfig['paths'] = {};
		}

		pluginConfig['paths'][compName] = requireFilePathWithOutExtension;
		generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));


		config['requirejs-config']['paths'][compName] = requireFilePathWithOutExtension;
		generalSupport.writeToFile(configFile,JSON.stringify(config,null,4));
	}


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
function classComponentOption(pluginName,className,path,config,configFile,pluginConfig,pluginConfigFile){
	var name = className;
	var check_name;
	if(name.includes(".js")){
		check_name = name;
	}else{
		check_name = name+".js";
	}
	//check_name = path+"/classes/"+check_name;

	var _checkIfClassExist2 = process.cwd()+"/plugins/"+pluginName+"/"+path+"/classes/";
	var _checkIfClassExist = process.cwd()+"/plugins/"+pluginName+"/"+path+"/classes/"+check_name;

	var requirePath = "plugins/"+pluginName+"/"+path+"/classes/"+check_name;

	var classComponent = 
`define(function(require, exports, module){

function ${name}(){

}
${name}.prototype = {

};


return ${name};

});

`;

	
	var defaultFileStructure = classComponent;

	fs.ensureDirSync(_checkIfClassExist2);

	if(fs.pathExistsSync(_checkIfClassExist)){
		writeToObjects();
		console.log("Class already exist: "+name);
		return;
	}

	fs.writeFile(_checkIfClassExist, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }

		for(var prop in pluginConfig['paths']){
			if(prop == name){
				writeToObjects();
				console.log("path exist for: "+ name);
				return;
			}
		}

		writeToObjects();

	    console.log("class "+name+" created");
	}); 


	function writeToObjects(){

		if(pluginConfig['paths']==undefined){
			pluginConfig['paths'] = {};
		}

		pluginConfig['paths'][name] = requirePath.split('.').slice(0, -1).join('.');
		generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));

		config['requirejs-config']['paths'][name] = requirePath.split('.').slice(0, -1).join('.');
		generalSupport.writeToFile(configFile,JSON.stringify(config,null,4));

	}
}






















































export function  Me(args) {


// 


	function isExecutedFromRoot(){
		var isRoot = true;
		var currentDir = process.cwd()+"/main.config.json";
		return fs.pathExistsSync(currentDir);	
	}

	if(args.component!=undefined){
		createNewComponent();
	}else if(args.class!=undefined){
		createNewClass();
	}

	function getAppfacConfigFile(type,param,callback){

		//console.log(param);
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

			if(type=='class'){

				var filename = "";
				var opts = null;
				if(param.includes("|")){
					opts = param.split("|");
				}else if(param.includes(" ")){
					opts = param.split(" ");
				}else{
					opts = param.split(" ");
				}

				if(opts.length==1){
					pluginDir = "app";
					filename = p[0];
				}else if(opts.length==2){
					pluginDir = p[0];
					filename = p[1];
				}

				var obj = {
					plugin: pluginDir,
					filename: filename
				};


				callback(obj);

			}else if(type=='component'){
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

			 	callback(pluginDir,theme,css_file,appfacConfig);
			}

			
		});
	}


	//appfactory add --component "plugin_name|theme_name|component_name" 
	function createNewComponent(){
		if(!isExecutedFromRoot()){
			console.log("Please run command from application root directory");
			return false;
		}

		getAppfacConfigFile('component', args.component,function(pluginName,themeName,compName,appfacConfig){

			var path = "client";
			if(args.a!=undefined){
				path = "admin";
			}

			var pluginConfigFile = process.cwd()+"/plugins/"+pluginName+"/plugin.config.json";

			// check that plugin exist
			var pluginPath = process.cwd()+"/plugins/"+pluginName;
			var pluginDoesExist = fs.pathExistsSync(pluginPath);
			if(!pluginDoesExist){
				console.log("Plugin does not exist: "+pluginName);
				return;
			}

			// check that theme exist
			var themePath = process.cwd()+"/plugins/"+pluginName+"/"+path+"/themes/"+themeName;
			var themeDoesExist = fs.pathExistsSync(themePath);
			if(!themeDoesExist){
				console.log("Plugin theme does not exist: "+themeName);
				return;
			}

			// check that component has no spaces and any special characters except _
			var isNameValid = generalSupport.checkIfValid(compName,["_","-"]);
			if(!isNameValid){
				console.log("Please provide a valid component name");
				return;
			}

			var configFile = process.cwd()+"/"+mainConfigFile;
			var pluginConfigFile = process.cwd()+"/plugins/"+pluginName+"/plugin.config.json";
			generalSupport.readFile(configFile,function(content){
				var config = JSON.parse(content);

				generalSupport.readFile(pluginConfigFile,function(content2){
					var pluginConfig = JSON.parse(content2);

					compComponentOption(pluginName,themeName,compName,path,config,configFile,pluginConfig,pluginConfigFile);

				});
			});
		});
	}


	//appfactory add --class "default|JumpNow" 
	function createNewClass(){

		if(!isExecutedFromRoot()){
			console.log("Please run command from application root directory");
			return false;
		}

		getAppfacConfigFile('class', args.class, function(){

			var opts = null;
			if(args.class.includes("|")){
				opts = args.class.split("|");
			}else if(args.class.includes(" ")){
				opts = args.class.split(" ");
			}else{
				opts = args.class.split(" ");
			}
			if(opts.length==1){
				var _n1 = opts[0];
				opts[0] = "app";
				opts[1] = _n1

			}else if(opts.length==0){
				console.log("Please provide all params \"plugin_name class_name\"");
				return;
			}

			var pluginName = opts[0];
			var className = opts[1];

			var path = "client";
			if(args.a!=undefined){
				path = "admin";
			}

			//console.log(pluginName);


			// check that plugin exist
			var pluginPath = process.cwd()+"/plugins/"+pluginName;
			var pluginDoesExist = fs.pathExistsSync(pluginPath);
			if(!pluginDoesExist){
				console.log("Plugin does not exist: "+pluginName);
				return;
			}

			// check that component has no spaces and any special characters except _
			var isNameValid = generalSupport.checkIfValid(className,["_","-"," ",".","/","(",")","[","]","+","=","*","*","%","$","#","@","!","|","\\"]);
			if(!isNameValid){
				console.log("Please provide a valid class name");
				return;
			}


			var configFile = process.cwd()+"/"+mainConfigFile;
			var pluginConfigFile = process.cwd()+"/plugins/"+pluginName+"/plugin.config.json";
			generalSupport.readFile(configFile,function(content){
				var config = JSON.parse(content);

				generalSupport.readFile(pluginConfigFile,function(content2){
					var pluginConfig = JSON.parse(content2);

					classComponentOption(pluginName,className,path,config,configFile,pluginConfig,pluginConfigFile);

				});
			});
		});
	}




	//addPluginComponentToProject();

	// function addPluginComponentToProject(){

	// var name = "";
	// if(args.name!=undefined){
	// 	name = args.name;
	// }else if(args.n!=undefined){
	// 	name = args.n;
	// }else{
	// 	console.log("Please provide a component name");
	// 	return;		
	// }	

	
	// var isNameValid = generalSupport.checkIfValid(name);
	// if(!isNameValid){
	// 	console.log("Please provide a valid component name");
	// 	return;
	// }

	// var isAdmin = false;
	// if(args.a!=undefined){
	// 	isAdmin = true;
	// }

	// /*
	// appfactory add --component "plugin_name|theme_name|component_name" -ea
	// appfactory add --class "plugin_name|class_name" -ec

	// appfactory add --name "" -sa
	// appfactory add --name "" -sc
	// */
	
	// var selectedAlready = false;
	// if(args.e!=undefined){
	// 	selectedAlready = true;
	// 	compComponentOption(name,isAdmin);
	// }
	
	// if(args.s!=undefined && selectedAlready==false){
	// 	classComponentOption(name,isAdmin,);
	// }


//}


//function compComponentOption(name,isAdmin){
function compComponentOption(pluginName,themeName,compName,path,config,configFile,pluginConfig,pluginConfigFile){

	// path = client | admin 

	var jsComponent = 
`define(function(require, exports, module){

function init(app){


}

return init;

});

	`;


	var name = compName;

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


	var filepath = "plugins/"+pluginName+"/"+path+"/themes/"+themeName+"/components/"+type;
	var pathExist = process.cwd()+"/"+filepath;

	// check is path exist if not then create
	//var doesExist = fs.pathExistsSync(pathExist);

	var requireFilePathWithExtension = filepath+"/"+name;
	var requireFilePathWithOutExtension = filepath+"/"+compName;
	
	var location = pathExist+"/"+name;

	if(fs.pathExistsSync(location)){
		writeToObjects();
		console.log("Component already exist: "+name);
		return;
	}

	fs.ensureDirSync(pathExist);

	if(type=="html"){
		defaultFileStructure = "";
	}

	fs.writeFile(location, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    if(type=="html")
	    	writeHTML();
	    else
	    	writeToObjects();
	    

	    console.log("component "+name+" created");
	}); 

	function writeHTML(){
		if(pluginConfig['includes']==undefined){
			pluginConfig['includes'] = {};
		}

		pluginConfig['includes'][compName] = requireFilePathWithOutExtension;
		generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));

		if(config['includes']==undefined) config['includes'] = {};
		config['includes'][compName] = requireFilePathWithExtension;
		generalSupport.writeToFile(configFile,JSON.stringify(config,null,4));
	}


	function writeToObjects(){
		if(pluginConfig['paths']==undefined){
			pluginConfig['paths'] = {};
		}

		pluginConfig['paths'][compName] = requireFilePathWithOutExtension;
		generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));


		config['requirejs-config']['paths'][compName] = requireFilePathWithOutExtension;
		generalSupport.writeToFile(configFile,JSON.stringify(config,null,4));
	}


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
function classComponentOption(pluginName,className,path,config,configFile,pluginConfig,pluginConfigFile){


	var name = className;

	var check_name;
	if(name.includes(".js")){
		check_name = name;
	}else{
		check_name = name+".js";
	}
	//check_name = path+"/classes/"+check_name;

	var _checkIfClassExist2 = process.cwd()+"/plugins/"+pluginName+"/"+path+"/classes/";
	var _checkIfClassExist = process.cwd()+"/plugins/"+pluginName+"/"+path+"/classes/"+check_name;

	var requirePath = "plugins/"+pluginName+"/"+path+"/classes/"+check_name;

	var classComponent = 
`define(function(require, exports, module){

function ${name}(){

}
${name}.prototype = {

};


return ${name};

});

`;

	
	var defaultFileStructure = classComponent;

	fs.ensureDirSync(_checkIfClassExist2);

	if(fs.pathExistsSync(_checkIfClassExist)){
		writeToObjects();
		console.log("Class already exist: "+name);
		return;
	}

	fs.writeFile(_checkIfClassExist, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }

		for(var prop in pluginConfig['paths']){
			if(prop == name){
				writeToObjects();
				console.log("path exist for: "+ name);
				return;
			}
		}

		writeToObjects();

	    console.log("class "+name+" created");
	}); 


	function writeToObjects(){

		if(pluginConfig['paths']==undefined){
			pluginConfig['paths'] = {};
		}

		pluginConfig['paths'][name] = requirePath.split('.').slice(0, -1).join('.');
		generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));

		config['requirejs-config']['paths'][name] = requirePath.split('.').slice(0, -1).join('.');
		generalSupport.writeToFile(configFile,JSON.stringify(config,null,4));

	}





}// END



























































































































//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
	//////////////////////////////////////////////

	return;

	var currentDir = process.cwd()+"/.it";
	var isInRootDir = fs.pathExistsSync(currentDir);
	if(!isInRootDir){
		console.log("Please run command in the root of your project!");
		return;
	}


	var name = "";
	if(args.name!=undefined){
		name = args.name;
	}else if(args.n!=undefined){
		name = args.n;
	}else{
		console.log("Please provide a component name");
		return;		
	}	
	var isNameValid = checkIfValid(name);
	if(!isNameValid){
		console.log("Please provide a valid component name");
		return;
	}

	var path = "";
	if(args.path!=undefined){
		path = args.path;
	}else if(args.p!=undefined){
		path = args.p;
	}

	var includeIn = "";
	if(args.include!=undefined){
		includeIn = args.include;
	}else if(args.i!=undefined){
		includeIn = args.i;
	}

	var jsComponent = 
`define([],function(){


});

	`;
	var classComponent = 
`define([],function(){

function ${name}(){

}
${name}.prototype = {

};

return ${name}

});


`;

	var defaultFileStructure = "";
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

	if(path!=""){
		if(path.endsWith("/")){
			path = path.slice(0,-1);
		}
		type = type+"/"+path;
	}

	var isClass = false;
	if(args.isClass!=undefined){
		isClass = args.isClass;
	}

	if(includeIn!=""){

	}

	var isAdmin = false;
	if(args.admin!=undefined){
		isAdmin = args.admin;
	}else if(args.p!=undefined){
		isAdmin = args.a;
	}
	

	var pathExist;

	if(plugin!=""){
		if(isAdmin){
			if(isClass){
				pathExist = process.cwd()+"/plugins/"+plugin+"/client/classes/";
				type = "";
			}else{
				pathExist = process.cwd()+"/plugins/"+plugin+"/client/components/"+type;
			}
		}else{
			if(isClass){
				pathExist = process.cwd()+"/plugins/"+plugin+"/admin/classes/";
				type = "";
			}else{
				pathExist = process.cwd()+"/plugins/"+plugin+"/admin/components/"+type;
			}
		}

		var u = process.cwd()+"/plugins/"+plugin;
		var doesExist = fs.pathExistsSync(u);
		if(!doesExist){
			console.log("Plugin does not exist: "+plugin);
			return;
		}
	}else{

		/*
		if(isAdmin){
			pathExist = process.cwd()+"/js/client/components/"+type;
		}else{
			pathExist = process.cwd()+"/js/admin/components/"+type;
		}
		*/


		if(isAdmin){
			if(isClass){
				pathExist = process.cwd()+"/client/classes/";
			}else{
				pathExist = process.cwd()+"/client/components/"+type;
			}
		}else{
			if(isClass){
				pathExist = process.cwd()+"/admin/classes/";
			}else{
				pathExist = process.cwd()+"/admin/components/"+type;
			}
		}
	}
	// appfactory add -admin -plugin "" -name "componentName" -type "js"
	/*
	js/plugins/plugin_name/admin/classes
	js/plugins/plugin_name/admin/classes/js/
	js/plugins/plugin_name/admin/classes/html/
	js/plugins/plugin_name/admin/components
	js/plugins/plugin_name/admin/components/js/
	js/plugins/plugin_name/admin/components/html/

	js/plugins/plugin_name/client/classes
	js/plugins/plugin_name/client/classes/js/
	js/plugins/plugin_name/client/classes/html/
	js/plugins/plugin_name/client/components
	js/plugins/plugin_name/client/components/js/
	js/plugins/plugin_name/client/components/html/
	*/

	
	var doesExist = fs.pathExistsSync(pathExist);
	if(!doesExist){
		fs.ensureDirSync(pathExist);
	}

	//var location = process.cwd()+"/js/client/components/"+type+"/"+name;
	var location = process.cwd()+pathExist+"/"+name;

	fs.writeFile(location, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("component "+name+" created");
	}); 


	function checkIfValid(_chars){
		if(_chars=="" || _chars.includes(" ")){
			return false;
		}
		var isvalid = true;
		var chars = _chars.split("");
		for(var i=0; i<chars.length; i++){
			for(var n=0; n<special_chars.length; n++){
				var matches = false;
				if(chars[i]==special_chars[n]){
					matches = true;
				}
				if(matches){
					break;
				}
				if((n+1)==special_chars.length){
					isvalid = false;
				}
			}
		}
		return isvalid;
	}

	function stringIncludes(){
		if(str.indexOf(substr) > -1) {
			return true;
		}else{
			return false;
		}
	}




};// end



