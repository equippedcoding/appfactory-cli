
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

function constructThemeDirectory(pluginName,pluginDir,themeName, plugin_config_obj){
    constructTypeThemeDirectory("admin",pluginDir,themeName,pluginName);
    constructTypeThemeDirectory("client",pluginDir,themeName,pluginName);

    var servicesDir = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/services";
    fs2.ensureDirSync(servicesDir);

    var phpDir = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/php";
    fs2.ensureDirSync(phpDir);

    // 4444 - why am i calling this twice
    buildInitFile(pluginDir,themeName,themeName,plugin_config_obj);
    buildInitFile(pluginDir,themeName,themeName,plugin_config_obj);
}
function constructTypeThemeDirectory(type,pluginDir,themeName,pluginName){
	var plugin_theme_dir = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+type+"/themes/"+themeName;
    fs2.ensureDirSync(plugin_theme_dir);

    var plugin_theme_dir_comp = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/components";
    fs2.ensureDirSync(plugin_theme_dir_comp);

    var plugin_theme_dir_styles = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/styles";
    fs2.ensureDirSync(plugin_theme_dir_styles);

    var plugin_theme_dir_styles_css = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/styles/css";
    fs2.ensureDirSync(plugin_theme_dir_styles_css);

    var plugin_theme_dir_styles_sass = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/styles/sass";
    fs2.ensureDirSync(plugin_theme_dir_styles_sass);

    generalSupport.writeToFile(plugin_theme_dir_styles_css+"/styles.css", "");

    var themeString = createThemeInterfaceScript(pluginName,themeName,type,pluginDir);
    var themepath = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+type+"/themes/"+themeName+"/theme_interface.js"
    generalSupport.writeToFile(themepath,themeString);

}
function buildInitFile(pluginDir,adminThemeName,themeName,plugin_config_obj){

	var a = "e"+generalSupport.random(12,false,true);
	var c = "e"+generalSupport.random(12,false,true);

	var adminThemeName = themeName;
	var clientThemeName = themeName;

    //var initfile = createInitFile(pluginDir,themeName,{
    var initfile = createInitFile(pluginDir,adminThemeName,plugin_config_obj,clientThemeName,{
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

    var p = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/init.js";

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
	var mainConfigFile = generalSupport.GetExecutionDirectory()+"/main.config.json";
	generalSupport.readFile(mainConfigFile,function(content1){

		var mainConfig = JSON.parse(content1);

		var client_active_theme = mainConfig['application']['client-active-theme'];
		var admin_active_theme = mainConfig['application']['admin-active-theme'];

		var path = generalSupport.GetExecutionDirectory()+"/plugins/"+plugin+"/plugin.config.json";
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

		    var mn = generalSupport.GetExecutionDirectory()+"/plugins/"+plugin+"/init.js";
		    generalSupport.writeToFile(mn,initfile);

		    generalSupport.writeToFile(mainConfigFile,JSON.stringify(mainConfig,null,4));

// 4444 - not used yet but this definitly needs to change
		    generalSupport.writeToFile(generalSupport.GetExecutionDirectory()+"/plugins/main.js",
`// This file is auto generated. Any changes will be over written.
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
		var config = JSON.parse(xhttp.responseText);
		require.config(config['requirejs-config']);
		requirejs(['appfactory','plugins/${plugin}/init'],function(appfactory,activePlugin){
			var app = new ApplicationContextManager(config);
			app.initializeApplication(true,activePlugin);
		});
    }
};
xhttp.open("GET", "config.appfac.js", true);
xhttp.send();
`);

		});
	});


}


function getRequiredTagsForMainJS(config){
	if(typeof config === 'string')
		config = JSON.parse(config);
	var plugins = config['application']['plugins'];

	if(plugins==undefined)
		return null;

	var pluginsRequire = "";
	for(var i=0; i < plugins.length; i++){
		if(plugins[i]['on']!=undefined && plugins[i]['on']==true){
			pluginsRequire += ", 'plugins/" + plugins[i].directory + "/init'";
		}else if(plugins[i]['on']==undefined){
			pluginsRequire += ", 'plugins/" + plugins[i].directory + "/init'";
		}
	}

	return pluginsRequire;
}
function createMainJSFile(config){

	var pluginsRequire = getRequiredTagsForMainJS(config);


	generalSupport.writeToFile(generalSupport.GetExecutionDirectory()+"/static/main.js",
`// This file is auto generated. Any changes will be over written.
function Ready(fn) {
	if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
function initializeApplication(){  
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			var config = JSON.parse(xhttp.responseText);
			require.config(config['requirejs-config']);
			requirejs(['appfactory'${pluginsRequire}],function(appfactory){
				var app = new ApplicationContextManager(config);
				app.initializeApplication(true);
			});
	    }
	};
	xhttp.open("GET", "main.config.json", true);
	xhttp.send();
}
Ready(initializeApplication); 
`);	



}
function createStartInitScriptForAdmin(dir){
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


function normalMainJSFile(config){

	var pluginsRequire = getRequiredTagsForMainJS(config);

var str = 
`// This file is auto generated. Any changes will be over written.
function Ready(fn) {
	if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
function initializeApplication(){  
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			var config = JSON.parse(xhttp.responseText);
			require.config(config['requirejs-config']);
			requirejs(['appfactory'${pluginsRequire}],function(appfactory){
				var app = new ApplicationContextManager(config);
				app.initializeApplication(true);
			});
	    }
	};
	xhttp.open("GET", "main.config.json", true);
	xhttp.send();
}
Ready(initializeApplication); 

`;
	
return str;

}
function buildMainJSFile(config){

	var pluginsRequire = getRequiredTagsForMainJS(config);

var str =

`// This file is auto generated. Any changes will be over written.
function htmlEntities(str) {
	// &amp;quot;version&amp;quot;: &amp;quot;0.1.4&amp;quot;,
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&amp;quot;');
}
function Ready(fn) {
	if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
function initializeApplication(){  
	var config = document.getElementById('appconfigurationdata').innerHTML;
	config = decodeHtml(config);
	config = JSON.parse(config);
	requirejs(['appfactory'${pluginsRequire}],function(appfactory){
		var app = new ApplicationContextManager(config);
		//app.setHash(window.location.hash);
		app.initializeApplication(true,activePlugin);
	});
}
Ready(initializeApplication);

`; 


return str;


}

function createTemplatePluginConfig(pluginName,pluginId,pluginDir){

  var jsonPluginConfig = {
    "name": pluginName,
    "id": pluginId,
    "url": "-",
    "start":"init",
    "active": false,
    "on": true,
    "client-active-theme": pluginDir+"|default",
    "admin-active-theme": pluginDir+"|default",    
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
            "head": []
        }
    ],
    "includes": {},
    "paths": {}


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
	var starInitFile = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+path+"/themes/"+dir+"/"+startScript;
	
	var doesExist = fs.pathExistsSync(starInitFile);
	if(!doesExist){
		fs.writeFile(starInitFile, startInitContents, function(err) {
		    if(err) {return console.log(err);}}); 
	}

	// create default styles.css
	var pathAdminExist = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+path+"/themes/"+dir+"/styles/css/";
	var doesAdminExist = fs.pathExistsSync(pathAdminExist);
	if(!doesAdminExist){
		fs.ensureDirSync(pathAdminExist);
	}

	var defaultStyles = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+path+"/themes/"+dir+"/styles/css/styles.css";
	doesExist = fs.pathExistsSync(defaultStyles);
	if(!doesExist){
		fs.writeFile(defaultStyles, "", function(err) {
		    if(err) {return console.log(err);}}); 
	}

}

function createWriteInitFile(pluginDir,defaultFileStructure){
	//var location = generalSupport.GetExecutionDirectory()+"/js/client/components/"+type+"/"+name;
	var location = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/init.js";

	fs.writeFile(location, defaultFileStructure, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    //console.log("Theme created");
	}); 
}

function createIfNotExist(path,pluginDir,dir){

	var pathAdminExist = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+path+"/themes/"+dir;
	var doesAdminExist = fs.pathExistsSync(pathAdminExist);
	if(!doesAdminExist){
		fs.ensureDirSync(pathAdminExist);
	}

	var pathClientExist = generalSupport.GetExecutionDirectory()+"/plugins/"+pluginDir+"/"+path+"/themes";
	var doesClientExist = fs.pathExistsSync(pathClientExist);
	if(!doesClientExist){
		fs.ensureDirSync(pathClientExist);
	}

}


function createInitFile(pluginDir,adminThemeName,createInitFile2,clientThemeName,adminObj,clientObj){

		var createInitFileStr = JSON.stringify(createInitFile2);
		var defaultFileStructure = 

`/* This file is auto generated */
define(["appfactory",
	 "./admin/themes/${adminThemeName}/theme_interface"
	,"./client/themes/${clientThemeName}/theme_interface"]
	,function(appfac,${adminObj.component},${clientObj.component}){

		var plugin = {
			directory:'${pluginDir}',
			"config": ${createInitFileStr}, 
			"admin-themes": [${JSON.stringify(adminObj,null,4)}],
			"client-themes": [${JSON.stringify(clientObj,null,4)}]
		};
	RegisterAppFactoryPlugin(plugin); 

	return plugin;

});
`;

return defaultFileStructure;


}



function createThemeInterfaceScript(pluginName,themeName,path,pluginDir){

	var g = "";
	if(path=="client"){
		g = createStartInitScriptForClient(pluginName,themeName,path,pluginDir);
	}else{
		g = createStartInitScriptForAdmin(pluginName);
	}
	
	return g; 

}

//function createStartInitScript(dir,path,pluginDir){
function createStartInitScriptForClient(pluginName,themeName,path,pluginDir){

		var startInitContents =
`define(function(require, exports, module){
	
	function init(app){

	    app.Manager.register('plugin:email',function(obj){

			var header = app.factory.container({
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

			var list = app.factory.list({
				list: listOf,
				type: "ul",// bootstrap, ul, ol
				items: function(item,index){
					this.label = item;
					return this;
				}
			});

			var body = app.factory.container({
				style: "margin-top:5%;",
				body: list
			});

			var layout = app.layout.newLayout()
				.row()
				.col({md:12}, header)
				.row()
				.col({md:12}, body)
				.build();

			var container = app.factory.container({
				className: "container-fluid",
				body: layout
			});

	      	return layout;
	    });

	}

	return init;

});



`;

function help1(){
	var p = `
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
		return container;

`;
}

return startInitContents;

}


// 4444 - replace and put into real file
function index_html_file(content){

	if(typeof content === 'object')
		content = JSON.stringify(content, null, 4);

$str = `

<?php 

$contents1 = <<<EOD
${content}
EOD;

$htmlJSON = json_decode($contents1, true); 

function replace_link($path, $p1){
	preg_match('#\{(.*?)\}#', $p1, $match);
	if(count($match)>0){
		$str = $match[1];
		$p2 = preg_replace('/{.*}/U', $path.$str, $p1);
		return $p2;
	}else{
		return $p1;
	}
}

$PATH = "";
$application = $htmlJSON["application"];

$userStatic = false;
if(array_key_exists("use-static", $application)){
	$userStatic = $htmlJSON["application"]["use-static"];
}

$indexAll = $htmlJSON["indexes"]["all"];
$indexConfig = $htmlJSON["indexes"]["index"];

if($userStatic){
	require_once("static-index.html");
}else{
	$doctype = "";

	if(array_key_exists("settings", $indexConfig)){
		if(array_key_exists('path', $indexConfig['settings'])){
			$PATH = $indexConfig['settings']["path"];
		}
	}
	
	if(array_key_exists("doctype", $indexConfig)){
		$doctype = $indexConfig["doctype"];
	}
	if(array_key_exists("doctype", $indexAll)){
		$doctype = $indexAll["doctype"];
	}

	$head = array();
	if(array_key_exists("head", $indexConfig)){
		$head = $indexConfig["head"];
		if(!is_array($head)){
			$head = array();
		}
	}
	if(array_key_exists("head", $indexAll)){
		$head = array_merge($head,$indexAll["head"]);	
	}

	$meta = array();
	if(array_key_exists("meta", $indexConfig)){
		$meta = $indexConfig["meta"];
		if(!is_array($meta)){
			$meta = array();
		}
	}
	if(array_key_exists("meta", $indexAll)){
		$meta = array_merge($meta,$indexAll["meta"]);
	}

	$body = array();
	if(array_key_exists("body", $indexConfig)){
		$body = $indexConfig["body"];
		if(!is_array($body)){
			$body = array();
		}
	}
	if(array_key_exists("body", $indexAll)){
		$body = array_merge($body,$indexAll["body"]);
	}


	$scripts = array();
	if(array_key_exists("scripts", $indexConfig)){
		$scripts = $indexConfig["scripts"];
		if(!is_array($scripts)){
			echo "Nope";
			$scripts = array();
		}
	}
	if(array_key_exists("scripts", $indexAll)){
		$scripts = array_merge($scripts,$indexAll["scripts"]);
	}

	$title = "";
	if(array_key_exists("title", $indexAll)){
		$title = $indexAll["title"];
	}
	if(array_key_exists("title", $indexConfig)){
		$title = $indexConfig["title"];
	}


	$html = '';
	$html .= $doctype;
	$html .= '<html xmlns="http://www.w3.org/1999/xhtml" lang="en">';
	$html .= '<head>';
	for($i=0; $i < count($meta); $i++ ){
		$html .= $meta[$i];
	}
	for($i=0; $i < count($head); $i++ ){
		$html .= replace_link($PATH,$head[$i]);
	}
	$html .= '<title>'. $title .'</title>';
	$html .= '</head>';
	$html .= '<body>';

	$html .= '<script type="application/json" id="appconfigurationdata">' . htmlentities($contents1) . '</script>';

	for($i=0; $i < count($body); $i++ ){
		$html .= replace_link($PATH,$body[$i]);
	}

	foreach ($scripts as $key => $value) {
		$html .= replace_link($PATH,$scripts[$key]);
	}

	$html .= '</body>';
	$html .= '</html>';

	echo $html;
}


`;


	return $str;
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
	normalMainJSFile: normalMainJSFile,
	createMainJSFile: createMainJSFile,
	buildMainJSFile: buildMainJSFile,
	index_html_file: index_html_file,
	createIndexFile: createIndexFile,
	createIndexPHPFile: createIndexPHPFile,
	constructThemeDirectory: constructThemeDirectory,
	changeTheme: changeTheme,
	createTemplatePluginConfig: createTemplatePluginConfig,
	constructTypeThemeDirectory: constructTypeThemeDirectory,
	buildInitFile: buildInitFile
};


};




