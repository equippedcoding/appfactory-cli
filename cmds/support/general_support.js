const ora = require('ora');
const ghdownload = require('github-download'); 
const exec = require('exec');
// const request = require('superagent');
const fs = require('fs');
const ncp = require('ncp').ncp;
const fs2 = require('fs-extra');
const AdmZip = require('adm-zip');
var formidable = require('formidable');
const prompt = require('prompts');
var request = require('request');
var path = require('path');


module.exports = (args) => {  



function writeToFile(file,content){
	var writeStream = fs.createWriteStream(file);
	writeStream.write(content);
	writeStream.end();
}
function readFile(file,callback){
	fs.readFile(file, 'utf8', function(err, content) {
		if(err){
			console.log(err);
			callback(false);
			return;
		}
		callback(content);
	});
}
function getDateTime() {

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

}

function Utils_randomGenerator(len,specialChars,letterOnly){
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



function checkIfValid(_chars,exceptions,letterOnly){

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
}


return {
	checkIfValid: checkIfValid,
	writeToFile: writeToFile,
	readFile: readFile,
	getDateTime: getDateTime,
	random: Utils_randomGenerator
}




};


