

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
var archiver = require('archiver');
var ip = require('ip');

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

var loginCredsFile = __dirname+"/cred.txt";

function loginConsole(loginUsername,loginEmail){
	var cred = "";
	var isEmail = "false";
	if(loginUsername!=""){
		cred = loginUsername;
	}else if(loginEmail!=""){
		cred = loginEmail;
		isEmail = "true";
	}

	var formData = {
		plugin_login: "true",
		is_email: isEmail,
		username: cred,
		password: loginPassword
	};
	sendLogin(formData);
}
function loginPrompt(callback,isAdmin){

	let interval;

	var password = "";
	var passwordAttempts = 0;
	var passwordsAreWrong = false;
	(async function(){
	    const questions = [

	        {
	            type: 'text',
	            name: 'username',
	            message: `Enter Username or Email`,
	            
	        },
	        {
	            type: 'password',
	            name: 'password',
	            message: 'Enter Password'
	        }
	    ];

	    const answers = await prompt(questions, {onCancel:cleanup, onSubmit:cleanup});

	    var isEmail = (answers.username.includes('@')) ? "true" : "false";
	    var cred = answers.username;
	    var loginPassword = answers.password;

		var formData = {
			plugin_login: "true",
			is_email: isEmail,
			username: cred,
			password: loginPassword
		};

		if(isAdmin!=undefined && isAdmin==true){
			formData['admin_login'] = "true";
			delete formData['plugin_login'];
		}

		sendLogin(formData,callback);

	})();

	function cleanup() {
	    clearInterval(interval);
	}

}

function logout(callback){
	var fileContent = "";
	writeToFile(loginCredsFile,fileContent);
}
function getLoginCred(callback){
	readFile(loginCredsFile,function(contents){

		if(typeof contents === "boolean" && contents==false || contents==""){
			//loginCallback();
			callback(false);
			return;
		}
		
		var isEmail;
		var cred;
		var expire_date;
		var r = false;
		try{
			isEmail = contents.split("\n")[0];
			cred = contents.split("\n")[1];
			expire_date = contents.split("\n")[2];
		}catch(e){

		}

		callback(isEmail,cred);

	});
}
function checkLoginStatus(callback){

	readFile(loginCredsFile,function(contents){

		if(typeof contents === "boolean" && contents==false || contents==""){
			//loginCallback();
			callback(false);
			return;
		}
		
		var isEmail;
		var cred;
		var expire_date;
		var r = false;
		try{
			isEmail = contents.split("\n")[0];
			cred = contents.split("\n")[1];
			expire_date = contents.split("\n")[2];
		}catch(e){
			logout();
			r = true;
			callback(false);
		}
		if(r==true) return;

		var expireDate = new Date(expire_date);
		var currentDate = new Date();
		if(expireDate < currentDate){
			//loginCallback();
			callback(false);
			return;
		}

		var formData = {
			check_login: "true",
			is_email: isEmail,
			username: cred
		};

		//var formData = { ip_addr:"true" };

		request.post({
			url:'http://plugins.appfactoryjs.com/includes/request.php', 
			formData: formData
			//,headers: {'Content-Type':'multipart/form-data'}
		}, function optionalCallback(err, httpResponse, resp) {
		  if (err) {
		    return console.error(err);
		  }

		  resp = resp.trim();

		  if(resp=="true"){
			var d = new Date();
			var cur = new Date();
			var expire_date = cur.setDate(cur.getDate() + 3);

			var fileContent = isEmail+"\n"+cred+"\n"+expire_date.toString();
			writeToFile(loginCredsFile,fileContent);
			callback(true);
		  }else{
		  	callback(false);
		  }

		});

	});

}

function sendLogin(formData,callback){

	//console.log(formData);
	request.post({
		url:'http://plugins.appfactoryjs.com/includes/request.php', 
		formData: formData
		//,headers: {'Content-Type':'multipart/form-data'}
	}, function optionalCallback(err, httpResponse, resp) {
	  if (err) {
	    return console.error(err);
	  }

	  resp = resp.trim();

	  if(resp=="true"){
	  	if(formData['admin_login']==undefined){
			var d = new Date();
			var cur = new Date();
			var expire_date = cur.setDate(cur.getDate() + 3);

			var isEmail = formData.is_email;
			var cred = formData.username;

			var fileContent = isEmail+"\n"+cred+"\n"+expire_date.toString();
			writeToFile(loginCredsFile,fileContent);
	  	}
		if(callback!=undefined) callback(true);
	  }else{
	  	console.log("Error in logging in");
	  	if(callback!=undefined) callback(false);
	  }

	});
}

async function checkUsername(username,callback){


	// console.log(process.cwd() + "/" + name);


	//this gives the directory path to this cli 
	//__dirname
	//vs process.cwd() which gives the directory the command is running in

	var formData = {
	   check: "jdub99"
	};
	request.post({
		url:'http://plugins.appfactoryjs.com/includes/request.php', 
		formData: formData
		//,headers: {'Content-Type':'multipart/form-data'}
	}, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }

	  callback(JSON.parse(body.trim()));

	  //console.log(body);
	  console.log('Upload successful!  Server responded with:', body);
	});


}





return {
	loginPrompt: loginPrompt,
	loginConsole: loginConsole,
	logout: logout,
	checkLoginStatus: checkLoginStatus,
	getLoginCred: getLoginCred
}



};









