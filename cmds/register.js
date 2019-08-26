
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



// register appfactoryjs plugin account
var register = "";
if(args.register!=undefined){
	register = args.register;
}else if(args.r!=undefined){
	register = args.r;
}


function registerUserAccount(){


let interval;

var password = "";
var passwordAttempts = 0;
var passwordsAreWrong = false;
(async function(){
    const questions = [
        // {
        //     type: 'text',
        //     name: 'twitter',
        //     message: `What's your twitter handle?`,
        //     initial: `terkelg`,
        //     format: v => `@${v}`
        // },

        {
            type: 'text',
            name: 'username',
            message: `Please enter a username (Cannot contain special characters except _)`,
            validate: function(value){
            	if(checkIfValid(value)==false){
            		return "Username cannot contain spaces, special characters except "
            			  +"an underscore _ and must be greater than 3 character but "
            			  +"less than 36 characters and cannot start with a number. "
            			  +"All uppercase letters will be converted to lowercase";
            	}else{
            		return true;
            	}
            }
        },
        // {
        //     type: 'number',
        //     name: 'age',
        //     message: 'How old are you?',
        //     validate: function(value){
        //     	console.log(value);
        //     	if(value==5){
        //     		return true
        //     	}else{
        //     		return false
        //     	}
        //     }


        //     //value => value < 18 ? `Sorry, you have to be 18` : true
        // },
        {
            type: 'password',
            name: 'password',
            message: 'Enter a password',
            validate: function(value){
            	if(value.includes(" ")){
            		return "Password cannot contain spaces.";
            	}else if(value.length<5){
            		return "Password must be greater than 5 characters";
            	}else{
            		password = value;
            		return true
            	}
            }
        },
        {
            type: 'password',
            name: 'confirm_password',
            message: 'Please confirm password',
            validate: function(value){
            	if(value!=password){
            		passwordAttempts++;
            		if(passwordAttempts>3){
            			passwordsAreWrong = true;
            			return true;
            		}
            		return "Passwords do not match.";
            	}else{
            		return true;
            	}
            }
        },

        {
            type: function(){
            	if(passwordsAreWrong){
            		return null;
            	}else{
            		return "text";
            	}
            },
            name: 'email',
            message: 'Please enter your email address' 
        },
        // {
        //     type: 'confirm',
        //     name: 'confirmed',
        //     message: 'Can you confirm?' 
        // },
        // {
        //     type: prev => prev && 'toggle',
        //     name: 'confirmtoggle',
        //     message: 'Can you confirm again?',
        //     active: 'yes',
        //     inactive: 'no'
        // },
        // {
        //     type: 'list',
        //     name: 'keywords',
        //     message: 'Enter keywords' 
        // },
        // {
        //     type: 'select',
        //     name: 'color',
        //     message: 'Pick a color',
        //     choices: [
        //       { title: 'Red', value: '#ff0000' }, 
        //       { title: 'Green', value: '#00ff00' },
        //       { title: 'Yellow', value: '#ffff00', disabled: true },
        //       { title: 'Blue', value: '#0000ff' }
        //     ]
        // },
        // {
        //     type: 'multiselect',
        //     name: 'multicolor',
        //     message: 'Pick colors',
        //     choices: [
        //         { title: 'Red', value: '#ff0000' },
        //         { title: 'Green', value: '#00ff00', disabled: true },
        //         { title: 'Yellow', value: '#ffff00' },
        //         { title: 'Blue', value: '#0000ff' }
        //     ]
        // },
        // {
        //     type: 'autocomplete',
        //     name: 'actor',
        //     message: 'Pick your favorite actor',
        //     initial: 1,
        //     choices: [
        //         { title: 'Cage' },
        //         { title: 'Clooney', value: 'silver-fox' },
        //         { title: 'Gyllenhaal' },
        //         { title: 'Gibson' },
        //         { title: 'Grant' },
        //     ]
        // },
        // {
        //     type: 'number',
        //     name: 'prompt',
        //     message: 'This will be overridden',
        //     onRender(color) {
        //         this.no = (this.no || 1);
        //         this.msg = `Enter a number (e.g. ${color.cyan(this.no)})`;
        //         if (!interval) interval = setInterval(() => {
        //             this.no += 1;
        //             this.render();
        //         }, 1000);
        //     }
        // }
    ];

    const answers = await prompt(questions, {onCancel:cleanup, onSubmit:cleanup});
    checkAnswers(answers);
    //console.log(answers);
})();

function cleanup() {
    clearInterval(interval);
}



function checkAnswers(answers){

	answers['username'] = answers['username'].toLowerCase();

	var showAnswers = {};
	for(var p in answers){
		if(p!='confirm_password'){
			showAnswers[p] = answers[p];
		}
	}
	console.log(showAnswers);

	var notFinished = false;

	if(answers['username']==undefined){
		notFinished = true;
	}
	if(answers['password']==undefined){
		notFinished = true;
	}
	if(answers['confirm_password']==undefined){
		notFinished = true;
	}
	if(answers['email']==undefined){
		notFinished = true;
	}

	if(notFinished==true){
		return;
	}

	var formData = {
		check: "true", 
		username: answers.username,
		email: answers.email,
		password: answers.password
	};

	request.post({
		url:'http://plugins.appfactoryjs.com/includes/request.php', 
		formData: formData
		//,headers: {'Content-Type':'multipart/form-data'}
	}, function optionalCallback(err, httpResponse, resp) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }

	  //console.log(resp.trim());

	  resp = JSON.parse(resp.trim());

	  // {
	  // 	email_valid: true,
	  // 	username_valid: true,
	  // 	email: email,
	  // 	username: username
	  // }

	  //console.log(resp);


	  if(resp.username_valid==true && resp.email_valid==true){
	  	console.log("Thank you, Please confirm your email address "+resp.email)
	  }else{
	  	if(resp.username_valid==false){
	  		console.log('The username '+resp.username+' is taken. Submission was unsuccess!\n');
	  	}
	  	if(resp.email_valid==false){
	  		console.log('The email '+resp.email+' is already in use, if you\'ve forgotton your password please run the command [appfactory plugin --restore "your.email@address"] in the terminal and a password reset link will be emailed to you. Submission was unsuccess!\n');
	  	}
	  }
	  

	  //console.log(body);
	  //console.log('Upload successful!  Server responded with:', body);
	});
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
	"_"//,".","-"
	];

	var numbers = ["1","2","3","4","5","6","7","8","9","0"];
	function checkIfValid(_chars,minLength,maxLength){
		if(minLength!=undefined && _chars<minLength){
			return false;
		}
		if(maxLength!=undefined && _chars>maxLength){
			return false;
		}
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
		for(var i=0; i<numbers.length; i++){
			if(_chars.charAt(1)==numbers[i]){
				isvalid = false;
				break;
			}
		}
		return isvalid;
	}


}









































};

