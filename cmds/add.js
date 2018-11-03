require('../utils/polyfills');
const fs = require('fs-extra');
module.exports = (args) => {

	var currentDir = process.cwd()+"/.it";
	var isInRootDir = fs.pathExistsSync(currentDir);
	if(!isInRootDir){
		console.log("Please run command in the root of your project!");
		return;
	}

	var special_chars = [
	 // lowercase
	 "a","b","c","d","e","f","g","h","i","j","k","l"
	,"m","n","o","p","q","r","s","t","u","v","w","x","y","z"
	
	// uppercase
	,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"
	,"R","S","T","U","V","W","X","Y","Z"

	// numbers
	,"1","2","3","4","5","6","7","8","9","0",

	// special characters
	"_",".","-"
	];

	var name = "";
	if(args.name!=undefined){
		name = args.name;
	}else if(args.d!=undefined){
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


	var jsComponent = 
`define([],function(){


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

	var pathExist = process.cwd()+"/js/includes/components/"+type;
	var doesExist = fs.pathExistsSync(pathExist);
	if(!doesExist){
		fs.ensureDirSync(pathExist);
	}

	var location = process.cwd()+"/js/includes/components/"+type+"/"+name;

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



