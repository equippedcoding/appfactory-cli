
const ora = require('ora');
const ghdownload = require('github-download'); 
const exec = require('exec');
// const request = require('superagent');
const fs = require('fs');
const ncp = require('ncp').ncp;
const fs2 = require('fs-extra');
const AdmZip = require('adm-zip');
const appUtils = require('../utils/app.js');

var formidable = require('formidable');

const prompt = require('prompts');

var request = require('request');
var path = require('path');
var archiver = require('archiver');
var ip = require('ip');

var loginSupport = require('./support/login_support')();

module.exports = async (args) => {



// login
var loginUsername = "";
if(args.username!=undefined){
	loginUsername = args.username;
}else if(args.u!=undefined){
	loginUsername = args.u;
}

var loginPassword = "";
if(args.password!=undefined){
	loginPassword = args.password;
}else if(args.p!=undefined){
	loginPassword = args.p;
}

var loginEmail = "";
if(args.email!=undefined){
	loginEmail = args.email;
}else if(args.e!=undefined){
	loginEmail = args.e;
}


var loginCredsFile = __dirname+"/cred.txt";

if(loginEmail=="" && loginUsername==""){
	loginSupport.loginPrompt();
}else{
	loginSupport.loginConsole(loginUsername,loginEmail);
}




};


