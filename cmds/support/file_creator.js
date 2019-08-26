
const ora = require('ora');
const exec = require('exec');
const ncp = require('ncp').ncp;
const fs = require('fs-extra');

var path = require('path');
var archiver = require('archiver');
const _eval = require('eval');

var loginSupport = require('./login_support')();
var generalSupport = require('./general_support')();


module.exports = () => {


// path = admin|client
// plugin = plugin directory

function constructThemeDirectory(

	pluginThemeFile,

	pluginDir,

	dir,

	startScript,

	config,

	path){

	//console.log(config);

	var array_admin = createArray(config["admin"],"admin");
	var componentObjs_admin = array_admin[0];
	var componentFiles_admin = array_admin[1];
	var themeArray_admin = array_admin[2];

	var array_client = createArray(config["client"],"client");
	var componentObjs_client = array_client[0];
	var componentFiles_client  = array_client[1];
	var themeArray_client  = array_client[2];

	var a1 = createSomething(componentObjs_admin,componentFiles_admin,themeArray_admin,pluginThemeFile,config["admin"],"admin",config);
	var a2 = createSomething(componentObjs_client,componentFiles_client,themeArray_client,pluginThemeFile,config["client"],"client",config);
	
	var defaultFileStructure = createInitFile(pluginDir,
		componentFiles_admin, componentObjs_admin, a1[1],
		componentObjs_client, componentFiles_client, a2[1]
	);

	if(path!=null && path!=undefined && path!=""){
		createDirectoryAndFiles(path,startScript,pluginDir,dir);
	}else{

		/*
		var admin_themes = config['admin'];
		var client_themes = config['client'];

		for(var i=0; i<admin_themes.length; i++){
			
			var directory = process.cwd()+"/js/plugins/"+pluginDir+"/"+admin_themes[i];
			var doesExist = fs.pathExistsSync(directory);
			if(!doesExist){
				createDirectoryAndFiles(path);
			}


		}
		*/

		/*
		createIfNotExist("admin",pluginDir,dir);
		createIfNotExist("client",pluginDir,dir);

		createWriteFile("admin",pluginDir,dir,startScript,startInitContents2);
		createWriteFile("client",pluginDir,dir,startScript,startInitContents);
		*/
	}

	createWriteInitFile(pluginDir,defaultFileStructure);
}

function createDirectoryAndFiles(path,startScript,pluginDir,dir){
	if(path=="admin"){
		var startInitContents2 = createStartInitScript2(dir,path,pluginDir);
		createIfNotExist("admin",pluginDir,dir);
		createWriteFile("admin",pluginDir,dir,startScript,startInitContents2);
	}else if(path=="client"){
		var startInitContents = createStartInitScript(dir,path,pluginDir);
		createIfNotExist("client",pluginDir,dir);
		createWriteFile("client",pluginDir,dir,startScript,startInitContents);
	}
}

function createWriteFile(path,pluginDir,dir,startScript,startInitContents){
	var starInitFile = process.cwd()+"/js/plugins/"+pluginDir+"/"+path+"/themes/"+dir+"/"+startScript;
	
	var doesExist = fs.pathExistsSync(starInitFile);
	if(!doesExist){
		fs.writeFile(starInitFile, startInitContents, function(err) {
		    if(err) {return console.log(err);}}); 
	}

}

function createWriteInitFile(pluginDir,defaultFileStructure){
	//var location = process.cwd()+"/js/client/components/"+type+"/"+name;
	var location = process.cwd()+"/js/plugins/"+pluginDir+"/init.js";

	fs.writeFile(location, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    //console.log("Theme created");
	}); 
}

function createIfNotExist(path,pluginDir,dir){

	var pathAdminExist = process.cwd()+"/js/plugins/"+pluginDir+"/"+path+"/themes/"+dir;
	var doesAdminExist = fs.pathExistsSync(pathAdminExist);
	if(!doesAdminExist){
		fs.ensureDirSync(pathAdminExist);
	}

	var pathClientExist = process.cwd()+"/js/plugins/"+pluginDir+"/"+path+"/themes";
	var doesClientExist = fs.pathExistsSync(pathClientExist);
	if(!doesClientExist){
		fs.ensureDirSync(pathClientExist);
	}

}

function createInitFile(pluginDir,
	componentFiles_admin,componentObjs_admin,themeString2_admin,
	componentObjs_client,componentFiles_client,themeString2_client){

		var defaultFileStructure = 

`/* This file is auto generated */
define(['appfactory'
	,${componentFiles_admin}
	,${componentFiles_client}]
	,function(app,${componentObjs_admin},${componentObjs_client}){

	RegisterAppFactoryPlugin({
		directory:'${pluginDir}',
		admin: ${themeString2_admin},
		client: ${themeString2_client}
	}); 

});
`;

return defaultFileStructure;


}

function createStartInitScript(dir,path,pluginDir){

		var startInitContents =
`define(LoadDependencies('`+pluginDir+`/`+ path +`',
//components
[],
//views
[],
//libs
[]
), function(){
	


	function init(app,config){


	    app.Manager.register('main:section',function(obj){

			var header = app.Factory.container({
				style: "margin-top:5%;",
				body: Brick.stack().div(
					"<h3>Welcome, AppfactoryJS</h3>"+
					"<h5>Plugin ${pluginDir} </h5>"+
					"<h5>Theme ${dir}</h5>")
					.build()
			});


			var listOf = [
			"Build web apps quick and effecintly.",
			"Component based elements."
			];

			var list = app.Factory.list({
				list: listOf,
				type: "ul",// bootstrap, ul, ol
				items: function(item,index){
					this.label = item;
					return this;
				}
			});

			var body = app.Factory.container({
				style: "margin-top:5%;",
				body: list
			});

			var layout = app.Layout.newLayout()
				.row()
				.col({md:12},[header])
				.row()
				.col({md:12},[body])
				.build();

			var container = app.Factory.container({
				classes: "container",
				body: layout
			});

	      	return layout;
	    });

	    app.Manager.register('homeLayout' ,function(routes){
			var container = app.Factory.container({
				classes: "container",
				body: "@main:section"
			});
	      return container;
	    });


	    // The man init function that starts this theme
	    // application, initializes routes and starts the
	    // so called application life cycle. 
	    app.Manager.init(true,function(){
	      app.Pages.newPageView({
	        baseRoute: 'home',
	        init: true,
	        routes: {
	          '':'homeLayout component main:section'
	        }
	      });
	    });



	}



	return init;

});



`;

return startInitContents;

}
function createStartInitScript2(dir,path,pluginDir){
			var startInitContents2 =
`define(LoadDependencies('`+pluginDir+`/`+ path +`',
//components
[],
//views
[],
//libs
[]
), function(){

	function init(app,config){

		var container = app.Factory.container({
			body: "<h3>Welcome, Theme ${dir}</h3>"
		});

		return container;
	}


	return init;

});
`;

return startInitContents2;
}


function createArray(array,path){
	var componentObjs = [];
	var componentFiles = [];

	// make a copy of array
	var themeArray = JSON.parse(JSON.stringify(array));
	for(var i=0; i<array.length; i++){
		var th = array[i];
		var elementObj = "e"+generalSupport.random(12,false,true);
		componentObjs.push(elementObj);

		var start = "init";
		if(th["start"]!=undefined){
			start = th["start"];
		}

		// './themes/One/init'
		var cf = "\"./"+path+"/themes/"+th["directory"]+"/"+start+"\"";
		componentFiles.push(cf);

		themeArray[i].component = elementObj;
		
	}

	return [
		componentObjs,
		componentFiles,
		themeArray
	]
}

function createSomething(componentObjs,componentFiles,themeArray,pluginThemeFile,array,param,config){
	var kh = componentObjs.slice(0);

	componentObjs = componentObjs.join(',');
	componentFiles = componentFiles.join(',');


	config[param] = array;
	var themeString = JSON.stringify(array, null, 4);
	var themeString2 = JSON.stringify(themeArray, null, 4);

	//var themeString = JSON.stringify(config.themes, null, 4);
	//var themeString2 = JSON.stringify(themeArray, null, 4);

	for(var i=0; i<kh.length; i++){
		themeString2 = themeString2.replace("\""+kh[i]+"\"",kh[i]);
	}

	var configString = JSON.stringify(config, null, 4);
	generalSupport.writeToFile(pluginThemeFile,configString);

	return [
		themeString,
		themeString2
	];
}



return {
	constructThemeDirectory: constructThemeDirectory
};


};




