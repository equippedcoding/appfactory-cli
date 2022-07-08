
const sass = require('sass');
const watch = require('node-watch');
const fs = require('fs-extra');
var generalSupport = require('./support/general_support')();

module.exports = (args) => {


var currentDir = process.cwd()+"/.it";
var isInRootDir = fs.pathExistsSync(currentDir);

var mainConfigFile = generalSupport.mainConfigFile;

if(!isInRootDir){
Console.log("Please run command from application root directory");
	return false;
}


var kill = require('kill-port');
var ON_DEATH = require('death');
var http = require('http').Server();
var io = require('socket.io')(http);

//appfactory css --plugin "standered|default" --file "styles" | --dir "" -a
 
//sass.render({file: scss_filename}, function(err, result) { /* ... */ });
 
// OR


// extensions

// appfactory css -m
if(args.m!=undefined){
	convertSassToCss();
}

// appfactory css -w
if(args.w!=undefined){
	kill(9005)
      .then(function(){
		io.on('connection', function(socket){

			watchSassFiles();

		});

		http.listen(9005, function(){
		  console.log('listening on *:9005');
		});

      })
      .catch(console.log())


}

function watchSassFiles(){



	var globalPluginsConfigFile = process.cwd()+"/js/plugins/plugin.config.json";
	generalSupport.readFile(globalPluginsConfigFile,function(globalContent){
		var globalPluginConfig = JSON.parse(globalContent);

		var sassArray = globalPluginConfig.sass;

		for (var i = 0; i < sassArray.length; i++) {

        // {
        //     "file": "styles.scss",
        //     "plugin": "standered",
        //     "theme": "default"
        // }

			var file = sassArray[i].file;
			var plugin = sassArray[i].plugin;
			var theme = sassArray[i].theme;
			var client = sassArray[i].client;
			_watch_sass_file(plugin,theme,client,file);


		}

		function _watch_sass_file(plugin,theme,client,filename){
			var path = "";
			if(client==undefined || client==true){
				path = "client";
			}else{
				path = "admin";
			}//                             js/plugins/standered/admin/themes/default/styles/sass/styles.scss
            //              process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/sass/"+filename+".scss";
			var watchFile = process.cwd()+"/js/plugins/"+plugin+"/"+path+"/themes/"+theme+"/styles/sass/"+filename;
			//console.log(watchFile);
			var doesExist = fs.pathExistsSync(watchFile);
			if(doesExist){
				var watcher = watch(watchFile, { 
						recursive: true, 
						delay: 5000 
					}, function(evt, name) {
						if(filename.includes(".scss")){
							filename = filename.split(".scss")[0];
						}
						//var css_filename = process.cwd()+"/js/plugins/"+plugin+"/"+path+"/themes/"+theme+"/styles/css/"+filename+".css";
						var css_filename = process.cwd()+"/js/plugins/"+plugin+"/"+path+"/themes/"+theme+"/styles/css/sass_styles.css";


						var doesExist2 = fs.pathExistsSync(css_filename);
						if(doesExist2){
							//console.log("watching: "+watchFile);
							processFiles(plugin,theme,watchFile,css_filename);
							change();
						}
					});

				// setTimeout(function(){
				// 	watcher.close();
				// },5000);
				

			}else{
			//	console.log("Does not exist");
			}

		}

	});




}

function change(){


	//var h = 0;
	//io.on('connection', function(socket){
	  //console.log('a user connected');

	  //var x = setTimeout(function(){
	  //	h++;
	  	io.emit('reload-page','hell-world');
	  	//io.close();
	  	//io.emit('disconnect','hell-world');
	  	//throw "";
	  //},4000);


	//});


	// if(h>1){
	// 	clearTimeout(x);
	// }






}


function convertSassToCss(){

	// appfactory css -m

	var configFile = process.cwd()+"/"+mainConfigFile;
	generalSupport.readFile(configFile,function(content){
		var config = JSON.parse(content);

		var activePlugin = config['application']['client-active-theme'].split("|")[0];
		var activeTheme = config['application']['client-active-theme'].split("|")[1];

		var pluginConfigFile = process.cwd()+"/plugins/"+activePlugin+"/plugin.config.json";
		generalSupport.readFile(pluginConfigFile,function(content2){
			var pluginConfig = JSON.parse(content2);

			var pluginTheme = null;
			var pluginThemes = pluginConfig['client-themes'];

			for(var i=0; i < pluginThemes.length; i++){
				if(pluginThemes[i].directory==activeTheme){
					pluginTheme = pluginThemes[i];
					break;
				}
			}

			if(pluginTheme!=null){
				var path = pluginTheme['sass']['base'];
				if(path){
					var sassFile = path;
					var cssFile = pluginTheme['sass']['compiled'];
					processFiles(activePlugin,activeTheme,sassFile,cssFile);
					var id = "appfactory-sass-compiled-css-stylesheet";
					var link = "<link id=\""+id+"\" rel=\"stylesheet\" type=\"text/css\" href=\" "+cssFile+" \">";
					pluginTheme['sass']['link'] = link;
					generalSupport.writeToFile(pluginConfigFile,JSON.stringify(pluginConfig,null,4));
				}else{
					console.log("No base sass file has been created. Please create base file by running command: appfactory plugin --sass \"plugin theme +baseFile\" ");
				}

			}else{
				console.log("No active theme not found");
			}
		});
	});
}






function convertSassToCss0123456789(){

	var globalPluginsConfigFile = process.cwd()+"/js/plugins/plugin.config.json";
	generalSupport.readFile(globalPluginsConfigFile,function(globalContent){
		var globalPluginConfig = JSON.parse(globalContent);


		console.log(typeof args.m);

		var themeSpecific = "";
		if(typeof args.m === "boolean"){
			_processsasfile(false);			
		}else{
			var a = args.m;
			_processsasfile(false,a);
		}

		function _processsasfile(processAll,_plugin){
			var sassArray = globalPluginConfig.sass;
			for (var i = 0; i < sassArray.length; i++) {
				var client = sassArray[i].client;
				var theme = sassArray[i].theme;
				var plugin = sassArray[i].plugin;
				var filename = sassArray[i].file;

				if(processAll){
					processSASSFiles(client,theme,plugin,filename);
				}else{
					if(_plugin==plugin){
						processSASSFiles(client,theme,plugin,filename);
					}
				}
			}
		}
		


		
		/*
		for (var i = 0; i < sassArray.length; i++) {
			var client = sassArray[i].client;
			var theme = sassArray[i].theme;
			var plugin = sassArray[i].plugin;
			var filename = sassArray[i].file;


			if(filename.includes(".scss")){
				filename = filename.split(".scss")[0];
			}

			var scss_filename;
			var css_filename;
			if(client==undefined || client==true){
				scss_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/sass/"+filename+".scss";
				css_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/css/sass_styles.css";
			}else{
				scss_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/sass/"+filename+".scss";
				css_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/css/sass_styles.css";
			}

			if(fs.pathExistsSync(scss_filename)){
				processFiles(plugin,theme,scss_filename,css_filename);
			}

		}// end of loop
		*/

		console.log("Done");

	});

	function processSASSFiles(client,theme,plugin,filename){

		if(filename.includes(".scss")){
			filename = filename.split(".scss")[0];
		}

		var scss_filename;
		var css_filename;
		if(client==undefined || client==true){
			scss_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/sass/"+filename+".scss";
			css_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/css/sass_styles.css";
		}else{
			scss_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/sass/"+filename+".scss";
			css_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/css/sass_styles.css";
		}

		if(fs.pathExistsSync(scss_filename)){
			processFiles(plugin,theme,scss_filename,css_filename);
		}

	}


}


function processFiles(plugin,theme,sassFile,cssFile){

	// if(filename.includes(".scss")){
	// 	filename = filename.split(".scss")[0];
	// }

	var scss_filename = sassFile;
	// if(client==undefined){
	// 	scss_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/sass/"+filename+".scss";
	// }else{
	// 	scss_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/sass/"+filename+".scss";
	// }

	var result = sass.renderSync({file: scss_filename});

	var css_filename = cssFile;
	// if(args.a==undefined){
	// 	css_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/css/"+filename+".css";
	// }else{
	// 	css_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/css/"+filename+".css";
	// }

	fs.writeFile(css_filename, result.css, function(err){
		if(!err){
		  //file written on disk
		}
	});



}



/*
var options = args.plugin;
var scss_filename = args.file;

if(options==undefined){
	console.log("Please provide plugin with theme");
	return;
}
if(scss_filename==undefined){
	console.log("Please provide sass file name");
	return;
}

var plugin = options.split("|")[0];
var theme = options.split("|")[1];

var pluginThemeFile = process.cwd()+"/js/plugins/"+plugin+"/plugin.config.json";
generalSupport.readFile(pluginThemeFile,function(content){

var config = JSON.parse(content);

console.log(config);

if(scss_filename.includes(".scss")){
	filename = scss_filename.split(".scss")[0];
}

if(args.a==undefined){
	scss_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/sass/"+filename+".scss";
}else{
	scss_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/sass/"+filename+".scss";
}





console.log("++++++++++++++++++++++++++++++++++++++++++++++");
console.log("++++++++++++++++++++++++++++++++++++++++++++++");
console.log("++++++++++++++++++++++++++++++++++++++++++++++");

console.log(scss_filename);

console.log("");
var result = sass.renderSync({file: scss_filename});

console.log(result);


var css_filename;
if(args.a==undefined){
	css_filename = process.cwd()+"/js/plugins/"+plugin+"/client/themes/"+theme+"/styles/css/"+filename+".css";
}else{
	css_filename = process.cwd()+"/js/plugins/"+plugin+"/admin/themes/"+theme+"/styles/css/"+filename+".css";
}


fs.writeFile(css_filename, result.css, function(err){
	if(!err){
	  //file written on disk
	}
});





});




// watch('file_or_dir', { recursive: true }, function(evt, name) {

//   console.log('%s changed.', name);



// });
*/




};