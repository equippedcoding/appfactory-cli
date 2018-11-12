module.exports = (args) => {
	const fs2 = require('fs-extra');
	const exec = require('exec');
	const fs = require('fs');
	const _eval = require('eval');
	const strip = require('strip-comments');

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
	
	var appfactorystart = "js/config/libs/appfactorystarter.js",
	    main = "js/main.js",
	    outputBuild = "js/build.min.js",
	    appfacConfig = "config.appfac.js",
	    index_meta = "",
	    index_head = "",
		index_title = "",
		index_body = "";
		index_scripts = "",
		index_doctype = "";
	fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
		//const str = strip(configFile);
		//console.log(str);

		var config = JSON.parse(configFile);
		var requirejsConfig = config['requirejs-config'];
		var indexConfig = config['index-config'];

		handleHTMLFile(indexConfig);
		


	});

	function handleHTMLFile(indexConfig){
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

		// build-output-script
		if(reverse==false){
			if(index_scripts==""){
				index_scripts = '\t<script src="'+outputBuild+'"></script>';
			}else{
				index_scripts = index_scripts+'\n\t<script src="'+outputBuild+'"></script>';
			}
		}else{
			// requirejs-script
			if(index_scripts==""){
				index_scripts = '\t'+scriptsConf['requirejs-script'];
			}else{
				index_scripts = index_scripts+'\n\t'+scriptsConf['requirejs-script'];;
			}
		}
		// appfactorystarter-script
		if(index_scripts==""){
			index_scripts = '\t'+scriptsConf['appfactorystarter-script'];
		}else{
			index_scripts = index_scripts+'\n\t'+scriptsConf['appfactorystarter-script'];;
		}


		var indeHTML = applyHTML(
					 index_doctype
					,index_meta
					,index_head
					,index_title
					,index_body
					,index_scripts
				);

		var writeStream = fs.createWriteStream('index.html');
		writeStream.write(indeHTML);
		writeStream.end();
		setTimeout(function(){
			setup(configFile,appfactorystarterFile,mainFile);
		},1500);

	}

	function applyHTML(doctypeConf,metaConf,headConf,titleConf,bodyConf,scriptsConf){
var indexHTML = 
`
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

function setup(configFile,appfactorystarterFile,mainFile){

	var a = `
var configFileString22 = ${configFile};
			`;

	var all = a+"\n\n\n"+appfactorystarterFile+"\n\n\n"+mainFile;
	all = all.replace(/AppFactoryStart.NoCapture/g,"AppFactoryStart.Capture");

	//var res = _eval(all2 /*, filename, scope, includeGlobals */)
	var res = _eval( 'module.exports = function () { '+all+' \nreturn AppFactoryStart; }' );

	var writeStream = fs.createWriteStream(buildRunMin);
	writeStream.write(
`
requirejs(${JSON.stringify(res().config.require.require)}, ${res().cb})
	`);
	writeStream.end();

	

	var writeStream = fs.createWriteStream(buildRunConfig);
	writeStream.write(JSON.stringify(res().config.config));
	writeStream.end();


	// node r.js -o js/build-run-config.js

	setTimeout(function(){

	var dir = exec(`node r.js -o ${buildRunConfig}`, function(err, stdout, stderr) {
	  //if (err) {
	  	console.log("==================================================");
	  	console.log(err);
	  	console.log("--------------------------------------------------");
	  	console.log(stdout);
	  	console.log("--------------------------------------------------");
	  	console.log(stderr);
	  	console.log("==================================================");
	  //}
	});

	dir.on('exit', function (code) {
	  // exit code is code
	  console.log(code);
	});



	},3000);

}// end




	return;

	var config = "js/config/config.json";
	var buildRunConfig = "build-run-config2.js";
	var buildRunMin = "js/build.min.js";

	fs.readFile(config, 'utf8', function(err, configFile) {
		fs.readFile(appfct, 'utf8', function(err, appfactorystarterFile) {
			fs.readFile(main, 'utf8', function(err, mainFile) {


				//setup(configFile,appfactorystarterFile,mainFile);

				// name: '/Users/jamesmitchell/Desktop/appfactoryjs/me1/newapp/js/main.js',
			});
		});
	});

	

	









	// var requirejs = require('requirejs');

	// var config = {
	//     baseUrl: '../appDir/scripts',
	//     name: 'main',
	//     out: '../build/main-built.js'
	// };

	// requirejs.optimize(config, function (buildResponse) {
	//     //buildResponse is just a text output of the modules
	//     //included. Load the built file for the contents.
	//     //Use config.out to get the optimized file contents.
	//     var contents = fs.readFileSync(config.out, 'utf8');
	// }, function(err) {
	//     //optimization err callback
	// });

	// node r.js -o \
	// baseUrl=. \
	// name=main \
	// out=main-built.js

};








