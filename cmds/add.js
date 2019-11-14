require('../utils/polyfills');

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

const prompt = require('prompts');

var request = require('request');
var path = require('path');
var archiver = require('archiver');
var ip = require('ip');
const _eval = require('eval');
const strip = require('strip-comments');
var loginSupport = require('./support/login_support')();
var generalSupport = require('./support/general_support')();


module.exports = (args) => {


	function isExecutedFromRoot(){
		var isRoot = true;
		var currentDir = process.cwd()+"/.it";
		return fs.pathExistsSync(currentDir);	
	}

	if(args.component!=undefined){
		createNewComponent();
	}else if(args.class!=undefined){
		createNewClass();
	}


	//appfactory add --component "plugin_name|theme_name|component_name" 
	function createNewComponent(){
		if(!isExecutedFromRoot()){
			Console.log("Please run command from application root directory");
			return false;
		}

		var opts = null;
		if(args.component.includes(",")){
			opts = args.component.split(",");
		}else if(args.component.includes(" ")){
			opts = args.component.split(" ");
		}
		if(opts.length<3){
			console.log("Please provide all params \"plugin_name|theme_name|component_name\"");
			return;
		}

		var pluginName = opts[0];
		var themeName = opts[1];
		var compName = opts[2];

		var path = "client";
		if(args.a!=undefined){
			path = "admin";
		}


		// check that plugin exist
		var pluginPath = process.cwd()+"/js/plugins/"+pluginName;
		var pluginDoesExist = fs.pathExistsSync(pluginPath);
		if(!pluginDoesExist){
			console.log("Plugin does not exist: "+pluginName);
			return;
		}

		// check that theme exist
		var themePath = process.cwd()+"/js/plugins/"+pluginName+"/"+path+"/themes/"+themeName;
		var themeDoesExist = fs.pathExistsSync(themePath);
		if(!themeDoesExist){
			console.log("Plugin theme does not exist: "+themeName);
			return;
		}

		// check that component has no spaces and any special characters except _
		var isNameValid = generalSupport.checkIfValid(compName);
		if(!isNameValid){
			console.log("Please provide a valid component name");
			return;
		}

		compComponentOption(pluginName,themeName,compName,path);

	}


	//appfactory add --class "default|JumpNow" 
	function createNewClass(){

		if(!isExecutedFromRoot()){
			Console.log("Please run command from application root directory");
			return false;
		}

		var opts = null;
		if(args.class.includes("|")){
			opts = args.class.split("|");
		}else if(args.class.includes(" ")){
			opts = args.class.split(" ");
		}
		if(opts.length<2){
			console.log("Please provide all params \"plugin_name|class_name\"");
			return;
		}

		var pluginName = opts[0];
		var className = opts[1];

		var path = "client";
		if(args.a!=undefined){
			path = "admin";
		}


		// check that plugin exist
		var pluginPath = process.cwd()+"/js/plugins/"+pluginName;
		var pluginDoesExist = fs.pathExistsSync(pluginPath);
		if(!pluginDoesExist){
			console.log("Plugin does not exist: "+pluginName);
			return;
		}

		// check that component has no spaces and any special characters except _
		var isNameValid = generalSupport.checkIfValid(className);
		if(!isNameValid){
			console.log("Please provide a valid component name");
			return;
		}

		classComponentOption(pluginName,className,path);

	}




	//addPluginComponentToProject();

	function addPluginComponentToProject(){

	var name = "";
	if(args.name!=undefined){
		name = args.name;
	}else if(args.n!=undefined){
		name = args.n;
	}else{
		console.log("Please provide a component name");
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

	/*
	appfactory add --component "plugin_name|theme_name|component_name" -ea
	appfactory add --class "plugin_name|class_name" -ec

	appfactory add --name "" -sa
	appfactory add --name "" -sc
	*/
	
	var selectedAlready = false;
	if(args.e!=undefined){
		selectedAlready = true;
		compComponentOption(name,isAdmin);
	}
	
	if(args.s!=undefined && selectedAlready==false){
		classComponentOption(name,isAdmin);
	}


}


//function compComponentOption(name,isAdmin){
function compComponentOption(pluginName,themeName,compName,path){

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


	var pathExist = process.cwd()+"/js/plugins/"+pluginName+"/"+path+"/themes/"+themeName+"/components/"+type;

	// check is path exist if not then create
	//var doesExist = fs.pathExistsSync(pathExist);
	
	var location = pathExist+"/"+name;

	if(fs.pathExistsSync(location)){
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
function classComponentOption(pluginName,className,path){


	var name = className;

	var check_name;
	if(name.includes(".js")){
		check_name = name;
	}else{
		check_name = name+".js";
	}
	//check_name = path+"/classes/"+check_name;

	var _checkIfClassExist2 = process.cwd()+"/js/plugins/"+pluginName+"/"+path+"/classes/";
	var _checkIfClassExist = process.cwd()+"/js/plugins/"+pluginName+"/"+path+"/classes/"+check_name;



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
		console.log("Class already exist: "+name);
		return;
	}

	fs.writeFile(_checkIfClassExist, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("class "+name+" created");
	}); 





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
				pathExist = process.cwd()+"/js/plugins/"+plugin+"/client/classes/";
				type = "";
			}else{
				pathExist = process.cwd()+"/js/plugins/"+plugin+"/client/components/"+type;
			}
		}else{
			if(isClass){
				pathExist = process.cwd()+"/js/plugins/"+plugin+"/admin/classes/";
				type = "";
			}else{
				pathExist = process.cwd()+"/js/plugins/"+plugin+"/admin/components/"+type;
			}
		}

		var u = process.cwd()+"/js/plugins/"+plugin;
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
				pathExist = process.cwd()+"/js/client/classes/";
			}else{
				pathExist = process.cwd()+"/js/client/components/"+type;
			}
		}else{
			if(isClass){
				pathExist = process.cwd()+"/js/admin/classes/";
			}else{
				pathExist = process.cwd()+"/js/admin/components/"+type;
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



