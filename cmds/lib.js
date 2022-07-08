const fs2 = require('fs-extra');
const exec = require('exec');
const fs = fs2;
const _eval = require('eval');
const strip = require('strip-comments');
const pathModule = require('path');
var generalSupport = require('./support/general_support')();
var request = require('request');



module.exports = (args) => {

var mainConfigFile = generalSupport.mainConfigFile;


function isExecutedFromRoot(){
	var isRoot = true;
	var currentDir = process.cwd()+"/.it";
	return fs.pathExistsSync(currentDir);	
}
if(!isExecutedFromRoot()){
	Console.log("Please run command from application root directory");
	return false;
}

// appfactory lib --add path --name name
// appfactory lib -a mypath -n myname



if(args.a!=undefined || args.add!=undefined){
	runAdd();
}

if(args.r!=undefined || args.remove!=undefined){
	runRemove();
}




function runAdd(){
	var path = "";
	if(args.a!=undefined){
		path = args.a;
	}else if(args.add!=undefined){
		path = args.add;
	}

	var name = "";
	if(args.n!=undefined){
		name = args.n;
	}else if(args.name!=undefined){
		name = args.name;
	}

	if(path=="" || name==""){
		console.log("-a and -n are requred");
		return;
	}

	generalSupport.readFile(process.cwd()+"/"+mainConfigFile, function(appfacConfig){
		appfacConfig = JSON.parse(appfacConfig);

		var head = null;
		if(args.h!=undefined)
			head = args.h;
		else if(args.head!undefined)
			head = args.head;


		if(head!=null){

			// "<script src=\"https://js.stripe.com/v3/\"></script>"
			// "<link rel=\"stylesheet\" type=\"text/css\" href=\"{static/bootstrap/bootstrap.css}\">"

			var length = appfacConfig['indexes']['all']['head'].length;
			appfacConfig['indexes']['all']['head'][length] = head;
		}else{
			if(path.includes(".js"))
				path = filename.split('.').slice(0, -1).join('.');

			var other = appfacConfig["requirejs-config"]["paths"];
			appfacConfig["requirejs-config"]["paths"] = {};
			appfacConfig['requirejs-config']['libs'][name] = path;

			for(prop in appfacConfig["requirejs-config"]["libs"]){
				appfacConfig["requirejs-config"]["paths"][prop] = appfacConfig["requirejs-config"]["libs"][prop];
			}
			for(prop in other){
				appfacConfig["requirejs-config"]["paths"][prop] = other[prop];
			}
		}

		var n1 = JSON.stringify(appfacConfig, null, 4);
		generalSupport.writeToFile(process.cwd()+"/"+mainConfigFile, n1);	

	});
}

function runRemove(){
	var path = "";
	if(args.r!=undefined){
		path = args.r;
	}else if(args.add!=undefined){
		path = args.remove;
	}

	if(path==""){
		console.log("No library found: " + path);
		return;
	}

	generalSupport.readFile(process.cwd()+"/"+mainConfigFile, function(appfacConfig){
		appfacConfig = JSON.parse(appfacConfig);

		var libsProperty = null;
		for(prop in appfacConfig["requirejs-config"]["libs"]){
			if(path==prop || path==appfacConfig["requirejs-config"]["libs"][prop]){
				libsProperty = prop;
				break;
			}
		}

		var wasRemoved = false;
		var path1 = "";
		var path2 = "";
		if(libsProperty!=null){
			wasRemoved = true;
			path1 = libsProperty;
			path2 = appfacConfig["requirejs-config"]["libs"][libsProperty];
			delete appfacConfig["requirejs-config"]["libs"][libsProperty];
		}

		var pathsProperty = null;
		for(prop in appfacConfig["requirejs-config"]["paths"]){
			if(path==prop || path==appfacConfig["requirejs-config"]["paths"][prop]){
				pathsProperty = prop;
				break;
			}
		}
		if(pathsProperty!=null){
			wasRemoved = true;
			path1 = libsProperty;
			path2 = appfacConfig["requirejs-config"]["paths"][pathsProperty];
			delete appfacConfig["requirejs-config"]["paths"][pathsProperty];
		}

		var n1 = JSON.stringify(appfacConfig, null, 4);
		generalSupport.writeToFile(process.cwd()+"/"+mainConfigFile, n1);	

		if(wasRemoved){
			console.log("Removed: " + path1+" - "+path2);
		}else{
			console.log("No library found: " + path);
		}		

	});
}

























};// Module End






















