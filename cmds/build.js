module.exports = (args) => {

const fs2 = require('fs-extra'); 
const exec = require('exec');
const fs = fs2;
const _eval = require('eval');
const strip = require('strip-comments');
const path = require('path');
var generalSupport = require('./support/general_support')();
var request = require('request');

var child_process = require('child_process');

var UglifyJS = require("uglify-js");

var currentDir = process.cwd()+"/.it";
var isInRootDir = fs2.pathExistsSync(currentDir);

var pluginManager = require('./plugin');
var fileCreator = require('./support/file_creator')();

var mainConfigFile = generalSupport.mainConfigFile;

var newbuildpaths = {};


var mPathToTransformedRequireJSKey = 'require-temp-path-for-building';
var mPathToTransformedRequireJSValue = "build/own/require.js";
var mPathToTransformedMainJSKey = "main-tmp-path";
var mPathToTransformedMainJSValue = "build/own/main.js"; 

var mSkeepBabelTransform = true;
var minify_each = true;

if(!isInRootDir){
	console.log("Please run command in the root of your project!");
	return;
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

const minify = require("babel-preset-minify");
var babel = require("@babel/core");


if(args.u!=undefined){
	unbuild();
}else{
	build();
}


function build(){
	if(fs.existsSync(process.cwd()+"/"+mainConfigFile)==false){
		unbuild(function(config){
			buildapp(config); 
		});
		return;
	}
	generalSupport.readFile(process.cwd()+"/"+mainConfigFile, function(appfacConfig){
		buildapp(appfacConfig);
	});	
}
function buildapp(appfacConfig){
	if(typeof appfacConfig === 'string')
		appfacConfig = JSON.parse(appfacConfig);

	if(fs.existsSync(process.cwd()+"/build/own")==false){
		fs.mkdirSync(process.cwd()+"/build/own");
	}

	pluginManager({r:true},function(appfacConfig){
		configureBuildphaseFile(appfacConfig);
		if(args.m==undefined && args.c==undefined){
			buildphaseOne(appfacConfig);
		}else if(args.m!=undefined && args.c==undefined){
			buildphaseTwo(appfacConfig);
		}else if(args.m==undefined && args.c!=undefined){
			buildphaseThree(appfacConfig);
		}else if(args.m!=undefined && args.c!=undefined){
			buildphaseFour(appfacConfig);
		}
	});
}
function buildphaseOne(config){
	config = configureMainJS(config);
	configureIndexPHP(config);
	moveMainIntoBuild(config);
	moveConfigIntoBuild();
	removeTmpFiles();
}
function buildphaseTwo(config){
	// add require.js and main.js to paths so they can be minified
	config['requirejs-config']['paths'][mPathToTransformedMainJSKey] = "static/main";
	config['requirejs-config']['paths'][mPathToTransformedRequireJSKey] = "static/requirejs/require";
	buildMinify(config, config['requirejs-config']['paths'], function(){
		config = fs.readFileSync(process.cwd()+"/"+mainConfigFile, "utf8");
		config = JSON.parse(config);
		delete config['requirejs-config']['paths'][mPathToTransformedRequireJSKey];
		delete config['requirejs-config']['paths'][mPathToTransformedMainJSKey];
		buildphaseOne(config);
	});
}
function buildphaseThree(config,callback){
	//config['requirejs-config']['paths'][mPathToTransformedMainJSKey] = "static/main";
	
	var main = fileCreator.buildMainJSFile(config);

	setTimeout(function(){ 
		fs.writeFileSync(process.cwd()+"/static/main.js", main);
		buildCombine(config,function(config){
			buildphaseOne(config);
		});
	},1000);
}
function buildphaseFour(config){
	config['requirejs-config']['paths'][mPathToTransformedMainJSKey] = "static/main";
	config['requirejs-config']['paths'][mPathToTransformedRequireJSKey] = "static/requirejs/require";
	buildCombine(config,function(){
		if(callback)
			callback();
	});	
	buildMinify(config, config['requirejs-config']['paths'], function(){
		config = fs.readFileSync(process.cwd()+"/"+mainConfigFile, "utf8");
		config = JSON.parse(config);
		appSpecificBuild(config);
	});	
}
function buildMinify(config,paths,callback){
	runPaths(paths, function(path,source){
		var source1 = fs.readFileSync(source, "utf8");
		var filename = path.substring(path.lastIndexOf('/')+1);
		var buildpath = "build/own/"+filename;
		newbuildpaths[prop] = buildpath;

		// 4444 - during the minify process only the main.js file is effected 
		// in a weired way. it's getting overwritten when calling UglifyJS.minify()
		if(filename == "main"){
			source1 = fileCreator.buildMainJSFile(config);
		}

		var minifiedResult = UglifyJS.minify(source1, { warnings: true });
		if (minifiedResult.error) throw minifiedResult.error;

		console.log("Minifying: "+path+".js");
		fs.writeFileSync( process.cwd()+"/"+buildpath+".js", minifiedResult.code);

	}, function(){
		var filename = process.cwd()+"/"+mainConfigFile;
		var config = fs.readFileSync(filename);
		config = JSON.parse(config);
		config['requirejs-config']['paths'] = newbuildpaths;
		fs.writeFileSync( filename, JSON.stringify(config,null,4) );
		if(callback)
			callback();
	});
}
function buildTransform(paths,callback){
	var options = {
	  "presets": ["@babel/preset-env"]
	};
	runPaths(paths,function(path,source){
		console.log("Executing Transform: "+path+".js");
		source = fs.readFileSync(source, "utf8");
		babel.transform(source, options, function(err, result) {
			if(err){
				console.log(err);
				return;
			}

			generalSupport.writeToFile(buildpath+".js",result.code);
		});
	}, function(){
		if(callback)
			callback();
	});
}
function buildCombine(appfacConfig,callback){
	if(args.outfile!=undefined){
		appfacConfig['requirejs-config']['out'] = "build/" + args.outfile;
	}

	var n2 = JSON.stringify(appfacConfig['requirejs-config'], null, 4);
	generalSupport.writeToFile(process.cwd()+"/build.js", "("+n2+")");

	var rJSFileLoc = __dirname+"/tmp/r.js";
	fs.copyFile(rJSFileLoc, process.cwd()+"/r.js", (err) => {
		if (err) throw err;
		child_process.exec(`node r.js -o build.js`, function(err, stdout, stderr){
		  	if(err){
		  		console.log("==================== err ============================");
		  		console.log(err);
		  	}
		  	if(stdout){
		  		console.log("-------------------- stdout ----------------------------");
		  		console.log(stdout);
		  	} 
		  	if(stderr){
		  		console.log("==================================================");
		  		console.log("-------------------- stderr -----------------------------");
		  		console.log(stderr);
		  	} 
			removeTmpFiles();
		  	callback(appfacConfig);
		});
	});
}
function runPaths(paths,callback,finish){
	let iterations = Object.keys(paths).length;
	for(prop in paths){
		var path = paths[prop];
		var source = process.cwd()+"/"+path+".js";
		if(fs.existsSync(source)==false){
			console.log("Path Doesn't Exist: " + path);
		}else{
			callback(path,source);
		}

		if (!--iterations){
			if(finish)
				finish();
		}
	}
}
function moveMainIntoBuild(config){
	var buildContents = fileCreator.buildMainJSFile(config);

	//var filename = process.cwd()+"/static/main.js";
	setTimeout(function(){
		fs.writeFileSync(process.cwd()+"/static/main.js", buildContents);
	},1500);
	

}
function moveConfigIntoBuild(){
	var mainjsFile = process.cwd()+"/main.config.json";
	fs.rename(mainjsFile, process.cwd()+"/static/buildphase/main.config.json", function(){});	
}
function removeTmpFiles(){
	fs.removeSync(process.cwd()+"/r.js");
	fs.removeSync(process.cwd()+"/build.js");
}

















function unbuild(callback){
	var configTempLoc = process.cwd()+"/static/buildphase/"+mainConfigFile;
	//fs.rename(process.cwd()+"/static/buildphase/main.js", process.cwd()+"/static/main.js", function(){ });
	fs.rename(configTempLoc, process.cwd()+"/"+mainConfigFile, function(){});


	if(fs.existsSync(process.cwd()+"/static/buildphase/index.php")){
		generalSupport.readFile(process.cwd()+"/static/buildphase/index.php", function(data1){
			fs.writeFile(process.cwd()+"/index.php", data1, (err) => {
			  	if (err) throw err;
				buildphaseData.build = 0;
				generalSupport.writeToFile(buildphaseconfigfile, JSON.stringify(buildphaseData, null, 4));
				if(callback!=undefined && typeof callback==='function'){
					setTimeout(function(){
						generalSupport.readFile(process.cwd()+"/"+mainConfigFile, function(appfacConfig){
							var normalMainJSFile = fileCreator.normalMainJSFile(JSON.parse(appfacConfig));
							fs.writeFileSync(process.cwd()+"/static/main.js", normalMainJSFile);
							callback(JSON.parse(appfacConfig));
						});
					},1000);
				}
			});
		});
	}else{
		if(callback==undefined)
			return;
		setTimeout(function(){
			generalSupport.readFile(process.cwd()+"/"+mainConfigFile, function(appfacConfig){
				var normalMainJSFile = fileCreator.normalMainJSFile(JSON.parse(appfacConfig));
				fs.writeFileSync(process.cwd()+"/static/main.js", normalMainJSFile);
				callback(JSON.parse(appfacConfig));
			});
		},1000);
	}	
}

function configureMainJS(config){
	config = configureMainFile(config);
	var configContents = JSON.stringify(config, null, 4);
	fs.writeFileSync(process.cwd()+"/"+mainConfigFile, configContents);
	//generalSupport.writeToFile(process.cwd()+"/"+mainConfigFile, configContents);
	return config;
}
function configureIndexPHP(config){
	var indexContents = fileCreator.index_html_file(config);
	generalSupport.writeToFile(process.cwd()+"/index.php", indexContents);
}
function configureBuildphaseFile(config){
	var buildphaseconfigdir = process.cwd()+"/static/buildphase";
	var buildphaseconfigfile = buildphaseconfigdir+"/buildphase.json";
	var data;
	if(fs.existsSync(buildphaseconfigdir) == false){
		fs.mkdirSync(buildphaseconfigdir);
		data = {};
	}else{
		data = fs.readFileSync(buildphaseconfigfile, "utf8");
		if(data==""){
			data = {};
		}else{
			data = JSON.parse(data);
		}
	} 
	var buildphaseData = data;//JSON.parse(data);
	buildphaseData.build = 1;
	generalSupport.writeToFile(buildphaseconfigfile, JSON.stringify(buildphaseData, null, 4));
}


function runAppfactoryBuildSpecificBuild(appfacConfig){
	var buildphaseconfigfile = process.cwd()+"/static/buildphase/buildphase.json";
	generalSupport.readFile(buildphaseconfigfile, function(data){
		var buildphaseData = JSON.parse(data);
		var configTempLoc = process.cwd()+"/static/buildphase/"+mainConfigFile;

		// if(buildphaseData.build == 0 && args.u!=undefined){
		// 	console.log("build first");
		// 	return;
		// }
		// if(buildphaseData.build == 1 && args.u==undefined){
		// 	return;
		// }

		var configLoc = process.cwd()+"/"+mainConfigFile;

		function buildpahse2(configFile){
			setTimeout(function(){
					//console.log(configFile);
					configFile = JSON.stringify(configureMainFile(configFile), null, 4);

					var indexContents = fileCreator.index_html_file(configFile);
					generalSupport.writeToFile(process.cwd()+"/index.php", indexContents);

					// var mainjsFile = process.cwd()+"/static/main.js";
					// fs.rename(mainjsFile, process.cwd()+"/static/buildphase/main.js", function(){
					// 	var mainjsContents = fileCreator.buildMainJSFile();
					// 	generalSupport.writeToFile(mainjsFile, mainjsContents);
					// });

					fs.rename(configLoc, process.cwd()+"/static/buildphase/"+mainConfigFile, function(){});
					buildphaseData.build = 1;
					generalSupport.writeToFile(buildphaseconfigfile, JSON.stringify(buildphaseData, null, 4));
				

			},2000);

		}

		if(fs.existsSync(process.cwd()+"/static/buildphase/") == false){
			fs.mkdirSync(process.cwd()+"/static/buildphase/");
			generalSupport.writeToFile(buildphaseconfigfile, "{}");
		}

		if(fs.existsSync(configLoc) == false && appfacConfig==undefined){
			fs.rename(configTempLoc, process.cwd()+"/"+mainConfigFile, function(){
				fs.readFile(configLoc, 'utf8', function(err, configFile) {
					if(err) console.log(err);
					buildpahse2(configFile);
				});
			});
		}else{
			buildpahse2(appfacConfig);
		}

	});


}

function configureMainFile(configObj){
	if(typeof configObj === 'string')
		configObj = JSON.parse(configObj);

	var index = -1;
	for(var i=0; i < configObj['indexes']['index']['body'].length; i++){
		if(configObj['indexes']['index']['body'][i].includes('requirejs/require')){
			index = i;
			break;
		}
	}

	// 4444 - create config['indexes']['index']['body'] if not exist
	if(index!=-1){
		var mainfile = "static/main.js";
		var requirefile = "static/requirejs/require.js";

		if(args.m==undefined && args.c==undefined){
			
		}else if(args.m!=undefined && args.c==undefined){
			mainfile = "build/own/main.js";
			requirefile = "build/own/require.js";
		}else if(args.m==undefined && args.c!=undefined){
			mainfile = configObj['requirejs-config']['out'];		
		}else if(args.m!=undefined && args.c!=undefined){
			mainfile = configObj['requirejs-config']['out'];
			requirefile = "build/own/require.js";
		}

		console.log(mainfile);

		var x = "<script data-main=\""+mainfile+"\" src=\""+requirefile+"\"></script>";

		configObj['indexes']['index']['body'][index] = x;
	}

	return configObj;
}



function runThroughBabel(appfacConfig,callback){


	if(fs.existsSync(process.cwd()+"/build/own")==false){
		fs.mkdirSync(process.cwd()+"/build/own");
	}

	appfacConfig['requirejs-config']['paths'][mPathToTransformedMainJSKey] = "static/main";
	appfacConfig['requirejs-config']['paths'][mPathToTransformedRequireJSKey] = "static/requirejs/require";

	let iterations = Object.keys(appfacConfig['requirejs-config']['paths']).length;
	for (prop in appfacConfig['requirejs-config']['paths']) {
		var path = appfacConfig['requirejs-config']['paths'][prop];


		if(args.m==undefined && args.c==undefined){

		}else if(args.m!=undefined && args.c==undefined){

		}else if(args.m==undefined && args.c!=undefined){

		}else if(args.m!=undefined && args.c!=undefined){

		}

		// if (m)inified is set and (c)ombine is NOT set then minify each
		// otherwise if both are set then minify just the build file
		if(args.m!=undefined && args.c==undefined){
			minify_each = true;
		}else{
			minify_each = false;
		}

		transformScriptsToES5(prop,path,false,function(successful_pass){
			if (!--iterations){
				
				if(mSkeepBabelTransform){
				}else{
					appfacConfig['requirejs-config']['paths'] = newbuildpaths;
				}

				//console.log(appfacConfig);
				
				var n1 = JSON.stringify(appfacConfig, null, 4);
				generalSupport.writeToFile(process.cwd()+"/"+mainConfigFile, n1);	

				if(args.outfile!=undefined){
					appfacConfig['requirejs-config']['out'] = "build/" + args.outfile;
				}

				var n2 = JSON.stringify(appfacConfig['requirejs-config'], null, 4);
				generalSupport.writeToFile(process.cwd()+"/build.js", "("+n2+")");

				if(args.c!=undefined){
					var rJSFileLoc = __dirname+"/tmp/r.js";
					// File destination.txt will be created or overwritten by default.
					fs.copyFile(rJSFileLoc, process.cwd()+"/r.js", (err) => {
						if (err) throw err;
						//console.log('source.txt was copied to destination.txt');

						runCombineScriptsIntoBuild(process.cwd()+"/build.js", "minified.js", function(){
							if(args.m!=undefined){
								setTimeout(function(){ 
									var filename = appfacConfig['requirejs-config']['out'];
									const source = fs.readFileSync(filename, "utf8");
									var minifiedResult = UglifyJS.minify(source);
									generalSupport.writeToFile(process.cwd()+"/"+filename, minifiedResult.code);

									_runNextStep(callback);

								},2000);
							}else{
								setTimeout(function(){ 
									_runNextStep(callback);

								},2000);							
							}
						});	



					});
			
				}else{
					callback();
				}
			}
		});

		function _runNextStep(callback){
			fs.removeSync(process.cwd()+"/r.js");
			fs.removeSync(process.cwd()+"/build.js");
			replaceRequireScriptTagInConfigFile(appfacConfig);
			// this does the app specic build
			callback();
		}
	}
}




function replaceRequireScriptTagInConfigFile(appfacConfig){
	var newScriptTag = "<script data-main=\""+appfacConfig['requirejs-config']['out']+"\" src=\"static/requirejs/require.js\"></script>";

	if(appfacConfig['indexes']['index']['body']!=undefined && Array.isArray(appfacConfig['indexes']['index']['body'])){
		var maintag = null;
		for(var i=0; i < appfacConfig['indexes']['index']['body'].length; i++){
			//generalSupport.trace(appfacConfig['indexes']['index']['body'][i]);
			if(appfacConfig['indexes']['index']['body'][i].includes("requirejs/require.js")){
				maintag = appfacConfig['indexes']['index']['body'][i];
				appfacConfig['indexes']['index']['body'][i] = newScriptTag;
				//generalSupport.trace('this way today');
				break;
			}
		}
	}

	for(prop5 in appfacConfig['indexes']){
		if(appfacConfig['indexes'][prop5]['body']!=undefined && Array.isArray(appfacConfig['indexes'][prop5]['body'])){
			var maintag = null;
			for(var i=0; i < appfacConfig['indexes'][prop5]['body'].length; i++){
				//generalSupport.trace(appfacConfig['indexes'][prop5]['body'][i]);
				if(appfacConfig['indexes'][prop5]['body'][i].includes("requirejs/require.js")){
					maintag = appfacConfig['indexes'][prop5]['body'][i];
					appfacConfig['indexes'][prop5]['body'][i] = newScriptTag;
					//generalSupport.trace('this way today');
					break;
				}
			}
		}
	}
	generalSupport.writeToFile(process.cwd()+"/"+mainConfigFile, JSON.stringify(appfacConfig, null, 4));		
}
function transformScriptsToES5(name,path,isLast,lastCall){
	if(mSkeepBabelTransform){
		lastCall(true);
		return;		
	}

	var options = {
	  "presets": ["@babel/preset-env"]
	};
	var f3 = process.cwd()+"/"+path+".js";
	if(fs.existsSync(f3)==false){
		// 0000
		console.log("Path Doesn't Exist: " + path);
		lastCall(false);
		return;
	}

	const source = fs.readFileSync(f3, "utf8");
	var splitpaths = path.split("/");

	var buildpath = "build/own/"+splitpaths[(splitpaths.length-1)];
	newbuildpaths[name] = buildpath;
		
	if(minify_each){
		var minifiedResult = UglifyJS.minify(source);
		console.log("Minifying: "+path+".js");
		generalSupport.writeToFile(buildpath+".js",minifiedResult.code);
		return;
	}
	
	babel.transform(source, options, function(err, result) {
		//result; // => { code, map, ast }
		// console.log(err);
		// console.log(result);

		if(err){
			console.log(err);
			return;
		}


		if(minify_each){
			var minifiedResult = UglifyJS.minify(result.code);
			console.log("Minifying: "+path+".js");
			generalSupport.writeToFile(buildpath+".js",minifiedResult.code);
		}else{
			generalSupport.writeToFile(buildpath+".js",result.code);
		}
		console.log("Executing Transform: "+path+".js");

		// console.log(isLast);
		// if(isLast){
			lastCall(true);
		// }

	});

		
}
function runCombineScriptsIntoBuild(callback){
	var child_process = require('child_process');

	child_process.exec(`node r.js -o build.js`, function(err, stdout, stderr){
		  	if(err){
		  		console.log("==================== err ============================");
		  		console.log(err);
		  	}
		  	if(stdout){
		  		console.log("-------------------- stdout ----------------------------");
		  		console.log(stdout);
		  	} 
		  	if(stderr){
		  		console.log("==================================================");
		  		console.log("-------------------- stderr -----------------------------");
		  		console.log(stderr);
		  	} 

		  	//else{


			  	// ./node_modules/.bin/babel build/bundle2.js --out-file build/bundle3.js
			  	// npx browserify plugins/main.js -t babelify --outfile build/bundle2.js
			  // 	if(args.m!=undefined && args.m==true){
					// var build_path = path.resolve(__dirname, '..') + "/node_modules/.bin/babel";
				 //  	var child_process1 = require('child_process');
				 //  	child_process1.exec(`${build_path} ${process.cwd()}/build/bundle.js --out-file ${process.cwd()}/${outputMinified} --minified`,function(err1, stdout1, stderr1){
				 //  		if(err1) 
				 //  			console.log(err1);
				 //  		else
				 //  			console.log(stdout1);
				 //  		//console.log("==================================================");
				 //  	});
			  // 	}
		  	//} 
		  	
		  	callback();
		  	
		  	setTimeout(function(){
		  		// fs.removeSync(buildRunConfig);
		  		// fs.removeSync(process.cwd()+"/r.js");
		  	},2000);
		  
	});
}


const filterFunc = (src, dest) => {
// console.log(src);
// console.log(dest);
return true;
}

var rJSFileLoc = __dirname+"/tmp/r.js";

var	appfacConfig = mainConfigFile;//"config.appfac.js";



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

	fs.ensureDirSync(process.cwd()+"/build/");
	var buildconfigfile = process.cwd()+"/build-config.js";
	
	//generalSupport.writeToFile(buildconfigfile, JSON.stringify(config['requirejs-config'], null, 4));

	function _getIndex(indexes){
		var index = null;
		var index;
		for(prop in indexes){
			if(prop=='all') continue;
			index = indexes[prop];
			if(indexes[prop]['settings']!=undefined && indexes[prop]['settings']['init']!=undefined){
				if(indexes[prop]['settings']['init']==true){
					index = indexes[prop];
					break;
				}
			}
		}
		return index;
	}


	//var allHTMLObj = indexes['index'];
	var htmlObj;
	var merged = generalSupport.mergeIndexes(config['indexes']);
	htmlObj = _getIndex(merged);

	//generalSupport.writeToFile(__dirname+"/tmp/testing123.js",JSON.stringify(htmlObj,null,4));
	
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
		if(htmlObj['body'][i].includes('requirejs/require.js')==false){
			body += "\n\r"+htmlObj['body'][i];
		}
	}

	var outfile;
	if(args.m!=undefined){
		var filewithoutex = config['requirejs-config']['out'].split('.').slice(0, -1).join('.');
		outfile = filewithoutex+".min.js"
	}else{
		outfile = config['requirejs-config']['out'];
	}

	body += "\n\r <script src=\"libs/scripts/requirejs/require.js\"></script>"
	body += "\n\r <script src=\""+outfile+"\"></script>";

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



	//generalSupport.writeToFile(process.cwd()+"/index.php",htmlstring);



	//runNodeJSCommand(buildconfigfile,outfile);

	
}



function runNodeJSCommand(buildRunConfig, outputMinified){

var child_process = require('child_process');

console.log(buildRunConfig);



child_process.exec(`node r.js -o ${buildRunConfig}`, function(err, stdout, stderr){
	  	
	  	if(err){
	  		console.log("==================== err ============================");
	  		console.log(err);
	  	}

	  	else{
		  	if(stdout){
		  		console.log("-------------------- stdout ----------------------------");
		  		console.log(stdout);
		  	} 
		  	
		  	if(stderr){
		  		console.log("==================================================");
		  		console.log("-------------------- stderr -----------------------------");
		  		console.log(stderr);
		  	} 

		  	// ./node_modules/.bin/babel build/bundle2.js --out-file build/bundle3.js
		  	// npx browserify plugins/main.js -t babelify --outfile build/bundle2.js
		  	if(args.m!=undefined && args.m==true){
				var build_path = path.resolve(__dirname, '..') + "/node_modules/.bin/babel";
			  	var child_process1 = require('child_process');
			  	child_process1.exec(`${build_path} ${process.cwd()}/build/bundle.js --out-file ${process.cwd()}/${outputMinified} --minified`,function(err1, stdout1, stderr1){
			  		if(err1) 
			  			console.log(err1);
			  		else
			  			console.log(stdout1);
			  		//console.log("==================================================");
			  	});
		  	}
	  	} 
	  	

	  	
	  	setTimeout(function(){
	  		// fs.removeSync(buildRunConfig);
	  		// fs.removeSync(process.cwd()+"/r.js");
	  	},2000);
	  
});

	return;


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
	  		//fs.removeSync(buildRunConfig)
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
		return fileCreator.createIndexPHPFile();
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

	var indexHTML = fileCreator.createIndexFile(index_doctype,index_meta,index_head,index_title,index_body,index_scripts,isPhp);
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

















}; // end of module






