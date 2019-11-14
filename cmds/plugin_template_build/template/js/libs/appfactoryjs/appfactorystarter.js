var AppFactoryStart = (function(){

function a(configFile){
	return new Promise((resolve,reject) => {
		try{
			var rawFile = new XMLHttpRequest();
	    	rawFile.open("GET", configFile, false);
	    	rawFile.send(null); 
	    	resolve(rawFile.responseText);
		}catch(e){
			if(reject!=undefined) reject(e);
		}

	});
} 

function mergeToFrom(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}

var _AppFactoryStart = {

	Capture: 'Capture',
	NoCapture: 'NoCapture',
	cb: null,
	config: null,
	main: async function(isAdmin,configFile,extra,callback,type){

		if(type==this.Capture){
			this.cb = callback;
			var configuration = setup(configFileString);
			if(isAdmin) configuration.config.paths = reformPath(configuration.config.paths);
			//this.config = config;
			this.config = configuration;
		}else if(type==this.NoCapture){
			//var configFileString = await a(configFile).then().catch(function(e){console.log(e);});
			
			a(configFile).then(function(configFileString){
				addPluginsSupported(function(plugins){
					run(configFileString,plugins);
				});
			}).catch(function(e){console.log(e);});


		}

		function run(configFileString,plugins){
			var configuration = setup(configFileString,plugins);
			if(isAdmin) configuration.config.paths = reformPath(configuration.config.paths);
			requirejs.config(configuration.config);
			requirejs(configuration.require.require, function(a){
				callback(plugins);
			});

		}

		function setup(configJSON,plugins){
			var config;

			if(typeof configJSON === 'string'){
				config = JSON.parse(configJSON);
				config = config['requirejs-config'];
			}else{
				config = configJSON;
			}
			if(extra==null || extra==undefined){
				extra = {};
				extra.paths = {};
				extra.require = ['appfactory'];
			}else{
				if(extra.require==null || extra.require==undefined){
					extra.require = ['appfactory'];
				}else{
					if(Array.isArray(extra.require)){
						extra.require.push('appfactory');
					}else{
						console.error("require object needs to be an Array");
					}
				}
				if(extra.paths==null || extra.paths==undefined){
					extra.paths = {};
				}
			}
			config.paths = mergeToFrom(extra.paths, config.paths);
			if(plugins!=undefined){
				for(var i=0; i<plugins.length; i++){
					var f = "plugins/"+plugins[i].location+"/"+plugins[i].start;
					//console.log(f);
					extra.require.push(f);
				}
			}
			var nonOverrides = ['paths','require'];
			for(var obj in extra){
				var isNot = false;
				for(var i=0; i<nonOverrides.length; i++){
					if(obj!=nonOverrides[i]){
						isNot = true;
						break;
					}
				}
				if(isNot==false){
					config[obj] = extra[obj];
				}
			}

			return {
				config: config,
				require: extra
			};
		}
		function reformPath(path){
			var newPath = {};
			for(var i in path){
				newPath[i] = "../../js/"+path[i];
			}
			return newPath;
		}



	    function addPluginsSupported(cb1){
			var rawFile = new XMLHttpRequest();
			rawFile.open("GET", "../../control_panel/admin/plugins/plugin.config.json", false);
			rawFile.onreadystatechange = function (){
			   if(rawFile.readyState === 4) {
				  if(rawFile.status === 200 || rawFile.status == 0){
					 var allText = rawFile.responseText;

					 var main_file = JSON.parse(allText);
					 var dirs = main_file.directories;
					 var some = [];
					 for(var i=0; i<dirs.length; i++){
					 	setupAdminGet(some,"../../control_panel/admin/plugins/"+dirs[i]+"/plugin.config.json");
					 }

					 cb1(some);
				  }
			   }
		    }
		    rawFile.send(null);  
	    }

	    function setupAdminGet(some,fileLoc){
			var rawFile = new XMLHttpRequest();
			rawFile.open("GET", fileLoc, false);
			rawFile.onreadystatechange = function (){
			   if(rawFile.readyState === 4) {
				  if(rawFile.status === 200 || rawFile.status == 0){
					 var allText = rawFile.responseText;
					 some.push(JSON.parse(allText));
				  }
			   }
		    }
		    rawFile.send(null);  
	    }



	}
};


	return _AppFactoryStart;



})();
