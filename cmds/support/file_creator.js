
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

	var fs2 = fs;


// path = admin|client
// plugin = plugin directory

function constructThemeDirectory(pluginName,pluginDir,themeName){
    constructTypeThemeDirectory("admin",pluginDir,themeName,pluginName);
    constructTypeThemeDirectory("client",pluginDir,themeName,pluginName);
    buildInitFile(pluginDir,themeName,"theme_interface.js");
    buildInitFile(pluginDir,themeName,"theme_interface.js");
}
function constructTypeThemeDirectory(type,pluginDir,themeName,pluginName){
	var plugin_theme_dir = process.cwd()+"/js/plugins/"+pluginDir+"/"+type+"/themes/"+themeName;
    fs2.ensureDirSync(plugin_theme_dir);

    var plugin_theme_dir_comp = process.cwd()+"/js/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/components";
    fs2.ensureDirSync(plugin_theme_dir_comp);

    var plugin_theme_dir_styles = process.cwd()+"/js/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/styles";
    fs2.ensureDirSync(plugin_theme_dir_styles);

    var plugin_theme_dir_styles_css = process.cwd()+"/js/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/styles/css";
    fs2.ensureDirSync(plugin_theme_dir_styles_css);

    var plugin_theme_dir_styles_sass = process.cwd()+"/js/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/styles/sass";
    fs2.ensureDirSync(plugin_theme_dir_styles_sass);

    generalSupport.writeToFile(plugin_theme_dir_styles_css+"/styles.css", "");

    var themeString = createThemeInterfaceScript(pluginName,themeName,type,pluginDir);
    var themepath = process.cwd()+"/js/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/theme_interface.js"
    generalSupport.writeToFile(themepath,themeString);

}
function buildInitFile(pluginDir,adminThemeName,themeName,start){

	var a = "e"+generalSupport.random(12,false,true);
	var c = "e"+generalSupport.random(12,false,true);

	var adminThemeName = themeName;
	var clientThemeName = themeName;

    //var initfile = createInitFile(pluginDir,themeName,{
    var initfile = createInitFile(pluginDir,adminThemeName,clientThemeName,{
        "directory": adminThemeName,
        "start": "theme_interface",
        "component": a
    },{
        "directory": clientThemeName,
        "start": "theme_interface",
        "component": c
    });

    initfile = initfile.replace("\""+a+"\"",a);
    initfile = initfile.replace("\""+c+"\"",c);

    var p = process.cwd()+"/js/plugins/"+pluginDir+"/init.js";

    generalSupport.writeToFile(p, initfile);

}
function changeTheme(plugin,newTheme,isClient){

/* ---------------------------------------------------------------------------
	file: config.appfac.js
    "client-active-theme": "default|default",
    "admin-active-theme": "default|default",
	---------------------------------------------------------------------------
	file: plugin.config.js
    "client-themes": [
        {
            "directory": "default",
            "start": "theme_interface",
            "head": [
                "<link rel=\"stylesheet\" type=\"text/css\" class=\"default\" href=\"./js/plugins/default/client/themes/default/styles/css/styles.css\">"
            ]
        },
        {
            "theme": "newTheme",
            "start": "theme_interface",
            "head": [
                "<link rel=\"stylesheet\" type=\"text/css\" class=\"default\" href=\"./js/plugins/yougo/client/themes/newTheme/styles/css/styles.css\">"
            ]
        }
    ]
	---------------------------------------------------------------------------
	file: init.js
	var plugin = {
		directory:'yougo',
		"admin-themes": [{
		    "directory": "newTheme",
		    "start": "theme_interface",
		    "component": exSqLtIo33djD
		}],
		"client-themes": [{
		    "directory": "newTheme",
		    "start": "theme_interface",
		    "component": ePdUjl91YcOTS
		}]
	}
	---------------------------------------------------------------------------

*/
	var mainConfigFile = process.cwd()+"/config.appfac.js";
	generalSupport.readFile(mainConfigFile,function(content1){

		var mainConfig = JSON.parse(content1);

		var client_active_theme = mainConfig['application']['client-active-theme'];
		var admin_active_theme = mainConfig['application']['admin-active-theme'];

		var path = process.cwd()+"/js/plugins/"+plugin+"/plugin.config.json";
		generalSupport.readFile(path,function(content2){

			var pluginConfig = JSON.parse(content2);

			var adminThemes = pluginConfig['admin-themes'];
			var clientThemes = pluginConfig['client-themes'];

			var adminThemeName = null;
			var clientThemeName = null;

			var clientThemeObj = null;

			if(isClient){
				for (var i = 0; i < clientThemes.length; i++) {
					if(clientThemes[i].directory==newTheme){
						clientThemeObj = clientThemes[i];
						break;
					}
				}

				adminThemeName = mainConfig['application']['admin-active-theme'].split("|")[1];
				
				//console.log(clientThemeObj);

				if(clientThemeObj==null){
					console.log("there is no theme named: "+ newTheme +", for plugin: "+plugin);
					return;
				}

				clientThemeName = clientThemeObj.directory;

				mainConfig['application']['client-active-theme'] = plugin+"|"+newTheme				//mainConfig['application']['admin-active-theme'] = "|";

			}else{

				mainConfig['application']['admin-active-theme'] = plugin+"|"+newTheme;
				//mainConfig['application']['admin-active-theme'] = "|";
			}


			var a = "e"+generalSupport.random(12,false,true);
			var c = "e"+generalSupport.random(12,false,true);

		    var initfile = createInitFile(plugin,adminThemeName,clientThemeName,{
		        "directory": adminThemeName,
		        "start": "theme_interface",
		        "component": a
		    },{
		        "directory": clientThemeName,
		        "start": "theme_interface",
		        "component": c
		    });

		    initfile = initfile.replace("\""+a+"\"",a);
		    initfile = initfile.replace("\""+c+"\"",c);

		    var mn = process.cwd()+"/js/plugins/"+plugin+"/init.js";
		    generalSupport.writeToFile(mn,initfile);

		    generalSupport.writeToFile(mainConfigFile,JSON.stringify(mainConfig,null,4));


		    generalSupport.writeToFile(process.cwd()+"/js/main.js",
`// This file is auto generated. Any changes will be over written.
$.getJSON( "config.appfac.js", function( config ) {
	require.config(config);
	requirejs(['./plugins/${plugin}/init'],function(activePlugin){
		var app = new ApplicationContextManager(config);
		app.initializeApplication(true,activePlugin);
	});
});
`);

		});
	});


}

function createTemplatePluginConfig(pluginName,pluginId,pluginDir){

  var jsonPluginConfig = {
    "name": pluginName,
    "id": pluginId,
    "url": "-",
    "start":"init",
    "active": true,
    "directory": pluginDir,
    "admin-themes": [
        {
            "directory": "default",
            "start": "theme_interface"
        }
    ],
    "client-themes": [
        {
            "directory": "default",
            "start": "theme_interface",
            "head": [
                "<link rel=\"stylesheet\" type=\"text/css\" class=\"default\" href=\"./js/plugins/default/client/themes/default/styles/css/styles.css\">"
            ]
        }
    ]


  };

  return JSON.stringify(jsonPluginConfig,null,4);
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

	// create default styles.css
	var pathAdminExist = process.cwd()+"/js/plugins/"+pluginDir+"/"+path+"/themes/"+dir+"/styles/css/";
	var doesAdminExist = fs.pathExistsSync(pathAdminExist);
	if(!doesAdminExist){
		fs.ensureDirSync(pathAdminExist);
	}

	var defaultStyles = process.cwd()+"/js/plugins/"+pluginDir+"/"+path+"/themes/"+dir+"/styles/css/styles.css";
	doesExist = fs.pathExistsSync(defaultStyles);
	if(!doesExist){
		fs.writeFile(defaultStyles, "", function(err) {
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


function createInitFile(pluginDir,adminThemeName,clientThemeName,adminObj,clientObj){

		var defaultFileStructure = 

`/* This file is auto generated */
define(["appfactory",
	 "./admin/themes/${adminThemeName}/theme_interface"
	,"./client/themes/${clientThemeName}/theme_interface"]
	,function(appfac,${adminObj.component},${clientObj.component}){

		var plugin = {
			directory:'${pluginDir}',
			"admin-themes": [${JSON.stringify(adminObj,null,4)}],
			"client-themes": [${JSON.stringify(clientObj,null,4)}]
		};
	RegisterAppFactoryPlugin(plugin); 

	return plugin;

});
`;

return defaultFileStructure;


}

//function createStartInitScript(dir,path,pluginDir){
function createThemeInterfaceScript(pluginName,themeName,path,pluginDir){

		var startInitContents =
`define(function(require, exports, module){
	


	function init(app){


	    app.Manager.register('main:section',function(obj){

			var header = app.Factory.container({
				style: "margin-top:5%;",
				body: Brick.stack().div(
					"<h3>Welcome, AppfactoryJS</h3>"+
					"<h5>Plugin ${pluginName} </h5>"+
					"<h5>Theme ${themeName}</h5>")
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

		// start the application life cycle without routing
		// must return an appfactory object 
		//app.Manager.init();

		// an element is only being returned because this
		// sample application handled the container and 
		// displays it, but since this is the starting
		// point of the app the container element should 
		// either be appended to the dom are using the init()
		// method. 
		//return container;


	}



	return init;

});



`;

return startInitContents;

}
function createStartInitScript2(dir,path,pluginDir){
			var startInitContents2 =
`define(function(require, exports, module){

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


function createArray(obj,path){

	/*

    "plugins" : {
        "default":{
            "directory":"default",
            "start":"init"
            "admin-active":true,
            "client-active":true
        }
    }

    {
        "directory": "default",
        "start": "theme_interface",
        "component": eod34BWyyjxcs
    }


	var array_client = createArray(config["client"],"client");
	var componentObjs_client = array_client[0];
	var componentFiles_client  = array_client[1];
	var themeArray_client  = array_client[2];

function createInitFile(pluginDir,
	componentFiles_admin,componentObjs_admin,themeString2_admin,
	componentObjs_client,componentFiles_client,themeString2_client){

		var defaultFileStructure = 


define([
	,${componentFiles_admin}
	,${componentFiles_client}]
	,function(${componentObjs_admin},${componentObjs_client}){

	RegisterAppFactoryPlugin({
		directory:'${pluginDir}',
		admin: ${themeString2_admin},
		client: ${themeString2_client}
	}); 

});


	*/

	var elementObj = "e"+generalSupport.random(12,false,true);





	var th = array;

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









	var elementObj = "e"+generalSupport.random(12,false,true);
	componentObjs.push(elementObj);


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
	constructThemeDirectory: constructThemeDirectory,
	changeTheme: changeTheme,
	createTemplatePluginConfig: createTemplatePluginConfig,
	constructTypeThemeDirectory: constructTypeThemeDirectory
};


};




