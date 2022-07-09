import { createRequire } from 'module';
const require = createRequire(import.meta.url);


const fs = require('fs-extra');

/*
const ora = require('ora');
//const ghdownload = require('github-download'); 
const exec = require('exec');
// const request = require('superagent');
const fs2 = require('fs');
const ncp = require('ncp').ncp;
const AdmZip = require('adm-zip');
var formidable = require('formidable');
const prompt = require('prompts');
var request = require('request');
var path = require('path'); 
*/


function GeneralSupport(){

}

GeneralSupport.prototype = {

	readFile: function(file,callback){
		try{
		  fs.readFile(file, 'utf8', function(err, content) {
		  if(err){
			  console.log(err);
			  callback(false);
			  return;
		  }
			  callback(content);
		  });
		}catch(e){
			  console.log(e);
			  console.log(false);
		}
	},
	checkIfValid: function(_chars,exceptions,letterOnly){

		var special_chars = [
		 // lowercase
		 "a","b","c","d","e","f","g","h","i","j","k","l"
		,"m","n","o","p","q","r","s","t","u","v","w","x","y","z"
		// uppercase
		,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"
		,"R","S","T","U","V","W","X","Y","Z"
		// special characters
		//,"_",".","-"
		];
		
		var special_num = ["1","2","3","4","5","6","7","8","9","0"];
		  /*
			if(spacesAllowed==null || spacesAllowed==undefined){
			  spacesAllowed = false;
			}
			if(_chars==""){
			  return false; 
			}
			if(!spacesAllowed){
			  if(_chars.includes(" ")){
			   return false;
			  }
			}else{
			  special_chars.push(" ");
			}
			*/
		
		if(_chars==""){
			return false;
		}
	
		if(letterOnly==null || letterOnly==undefined || letterOnly==false){
			special_chars = special_chars.concat(special_num);
		}
	
		if(exceptions!=null && exceptions!=undefined && Array.isArray(exceptions)){
			special_chars = special_chars.concat(exceptions);
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
	},
	
	trace: function(s) {
		// https://gist.github.com/mikesmullin/008721d4753d3e0d9a95cda617874736
		const orig = Error.prepareStackTrace;
		Error.prepareStackTrace = (_, stack) => stack;
		const err = new Error();
		Error.captureStackTrace(err, global);
		const callee = err.stack[1];
		Error.prepareStackTrace = orig;
	  
		var callerFile = path.relative(process.cwd(), callee.getFileName());
		var callerLine = callee.getLineNumber();
	  
		var _paths = callerFile.split("/");
		callerFile = _paths[_paths.length-1];
	  
	  
	  
		  //process.stdout.write(`${path.relative(process.cwd(), Error.prototype.stack[0].getFileName())}:${callee.getLineNumber()}: ${s}\n`);
	  
		  process.stdout.write(`${callerFile}-${callerLine}: ${s} \n\r`);
	},

	writeToFile: function(file,content){
		var writeStream = fs.createWriteStream(file);
		writeStream.write(content);
		writeStream.end();
	},

	GetExecutionDirectory: function(){
		return process.cwd();//(ProcessDirectory==undefined) ? process.cwd() : process.cwd()+"/"+ProcessDirectory;;
	},

	replace_link: function(path,str){
		var extractedString = str.match('\{(.*?)\}');
		if(extractedString!=null && extractedString!=undefined && extractedString.length>0){
		  var replacementString = path+extractedString[1];
		  return str.replace(/\{.*?\}/, replacementString);
		}else{
		  return str;
		}
	},
	getDateTime: function() {

		var date = new Date();
	
		var hour = date.getHours();
		hour = (hour < 10 ? "0" : "") + hour;
	
		var min  = date.getMinutes();
		min = (min < 10 ? "0" : "") + min;
	
		var sec  = date.getSeconds();
		sec = (sec < 10 ? "0" : "") + sec;
	
		var year = date.getFullYear();
	
		var month = date.getMonth() + 1;
		month = (month < 10 ? "0" : "") + month;
	
		var day  = date.getDate();
		day = (day < 10 ? "0" : "") + day;
	
		return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
	
	},

	random: function(len,specialChars,letterOnly){ 
		return this.randomGenerator(len,specialChars,letterOnly); 
	},

	randomGenerator: function(len,specialChars,letterOnly){
		var text = "";
		var possible = null;
	
		if(letterOnly==undefined || letterOnly==null){
			if(letterOnly){
				text = y();
			}else{
				text = x();
			}
		}else{
			text = x();
		}
	
		function x(){
			var text1 = "";
			if(specialChars==null || specialChars== undefined || specialChars==false)
				possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			else
				possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=+!#*^_";
	
			if(len==null || len==undefined) len = 5;
	
			for( var i=0; i < len; i++ )
			   text1 += possible.charAt(Math.floor(Math.random() * possible.length));
			return text1;
		}
		function y(){
			var text1 = "";
			if(specialChars==null || specialChars== undefined || specialChars==false)
				possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
			else
				possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0=+!#*^_";
	
			if(len==null || len==undefined) len = 5;
	
			for( var i=0; i < len; i++ )
			   text1 += possible.charAt(Math.floor(Math.random() * possible.length));
			return text1;
		}
	
	
		return text;
	}



};


export { GeneralSupport };


/*
var ProcessDirectory = undefined;
function mergeIndexes(indexes){

  var allIndex = {};
  var allIndexes = {};
  if(indexes['all']){
    allIndex = indexes['all'];
  }
  for(prop in indexes){
    if(prop!='all'){
      allIndexes[prop] = indexes[prop];
    }
  }

  for(prop2 in allIndexes){
    for(prop1 in allIndex){
      if(allIndexes[prop2][prop1]==undefined && !Array.isArray(allIndex[prop1])){
        allIndexes[prop2][prop1] = allIndex[prop1];
      }else if(Array.isArray(allIndex[prop1])){
        if(allIndexes[prop2][prop1]==undefined){
          allIndexes[prop2][prop1] = []
        }
        var path = "";
        for (var i = 0; i < allIndex[prop1].length; i++) {
          if(allIndexes[prop2]['settings']!=undefined && allIndexes[prop2]['settings']['path']!=undefined){
            path = allIndexes[prop2]['settings']['path'];
          }
          allIndexes[prop2][prop1].push(replace_link(path,allIndex[prop1][i]));
        }
      }
    }
  }

  allIndexes['all'] = allIndex;

  //writeToFile(__dirname+"/helpme.js",JSON.stringify(allIndexes,null,4));

  return allIndexes;
}
// https://stackoverflow.com/questions/41462606/get-all-files-recursively-in-directories-nodejs
function runAddComponent(){
    var path = "client";
    if(args.a!=undefined){ path = "admin"; }

    var pluginConfigFile = process.cwd()+"/plugins/"+pluginName+"/plugin.config.json";

    getAppfacConfigFile(componentParams,function(pluginDir,themeName,compName,appfacConfig){
        // plugins/app/client/themes/default/components/js/
        // plugins/includes/


    });
}
function getAppfacConfigFile(param,callback){
    var _config_file = process.cwd()+"/config.appfac.js";
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
      if(p.length==2){
        appfacActivePlugin = p[0];
        appfacActiveTheme = p[1];
      }

      // #appfactory add --component "themeName|componentName" --type html|js -a
      // #appfactory add --component "themeName componentName" --type html|js -a
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
        console.log("Please provide all params \"plugin_name theme_name component_name\"");
        return;
      }

      var pluginDir = opts[0];
      var theme = opts[1];
      var css_file = opts[2];
      callback(pluginDir,theme,css_file,appfacConfig);
    });
  }

*/






