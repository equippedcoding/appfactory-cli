import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import ora from 'ora';
import child_process from 'child_process';
//import { setTimeout } from 'timers/promises';
const fs = require('fs');
const https = require('https');
const prompt = require('prompts');
const extract = require('extract-zip');

/*
// https://stackoverflow.com/questions/45395369/how-to-get-console-log-line-numbers-shown-in-nodejs
var log = console.log;
console.log = function() {
    log.apply(console, arguments);
    // Print the stack trace
    console.trace();
};
*/

export function Creator(args){ init(args); };

function init(args){
	var newDir = getDirctoryName(args);
	fs.access(newDir, function(error) {
		if (error) {
			creatApp(args);
		} else {
			directoryExist(newDir,args);
		}
	})
}
function creatApp(args){
	const spinner = ora().start();
	const foldername = getDirctoryName(args);
	download3(foldername,args);
	configureConfigFile(foldername, (args.title == undefined ? "My App" : args.title));
	console.log("done");
	spinner.stop();
}
function download3(foldername,args){
	const token = args.token;
	const username = "equippedcoding";
	const repo = "github.com/equippedcoding/appfactoryjs.git";
	child_process.execSync(`cd ${process.cwd()}; git clone https://${username}:${token}@${repo} ${foldername}`);
}
function directoryExist(newDir,args){
	let interval;
	(async function(){
		var dir_id = "";
		const questions = [
			{
				type: 'select',
				name: 'overwrite',
				message: 'Directory: '+newDir+' already exists. Do you want to overwrite? (Can NOT be undone): ',
				choices: [
					{ title: 'No', value: false },
					{ title: 'Yes', value: true }
				]
			}     
		];

		const answers = await prompt(questions, {onCancel:cleanup, onSubmit:cleanup});

		if(answers.overwrite){
			console.log("overwritting...");
			deleteFolderRecursive(process.cwd() + "/" + newDir);
			creatApp(args);
		}else{
			console.log("Ok");
		}
	})();
	function cleanup() { clearInterval(interval); }

}
function deleteFolderRecursive(path) {
	if( fs.existsSync(path) ) {
		fs.readdirSync(path).forEach(function(file) {
		  	var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}
function getDirctoryName(args){
	var newDir = "";
	if(args.dir!=undefined){
	  newDir = args.dir;
	}else if(args.d!=undefined){
	  newDir = args.d;
	}else{
	  newDir = "appfactory-app";
	}
	return newDir;
}
function configureConfigFile(foldername,appTitle){
	var pathname = process.cwd() + "/" + foldername + "/main.config.json";
	fs.readFile(pathname, 'utf8', function(err, configFile) {
		if(err) console.log(err);
		var config = JSON.parse(configFile);
		config['requirejs-config'];
		config['indexes']['index'].title = appTitle;
		var configString = JSON.stringify(config, null, 4);
		var writeStream = fs.createWriteStream(pathname);
		writeStream.write(configString);
		writeStream.end();
		process.chdir(process.cwd()+"/"+foldername);
		//pluginManager( {r:true}, function(appfacConfig){}, newDir);
		////handleHTMLFile(config['index-config']);
	});
}



/*
function getRepoUrl(){
    var owner = "equippedcoding";
    var repo = "appfactoryjs";
    var branch = "master"
    var accessToken = "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";

    var options = {
        method: "GET",
        url: `https://api.github.com/repos/${owner.toLowerCase()}/${repo.toLowerCase()}/tarball/${branch}?access_token=${accessToken}`,
        headers: {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'mbejda.com'
        }
    };

    return options.url;
}
function download(url, dest, cb) {
	const file = fs.createWriteStream(dest);
	https.headers
	const request = https.get(url, function (response) {
		response.pipe(file);
		file.on('finish', function () {
			file.close(cb);  // close() is async, call cb after close completes.
		});
	}).on('error', function (err) { // Handle errors
		fs.unlink(dest); // Delete the file async. (But we don't check the result)
		if (cb) cb(err.message);
	});
};
function downloadRepo(url, dest, source, target, spinner){
	(async function main () {
		try {
			spinner.stop();
			console.log('Done');
			await extract(source, { dir: target });
			deleteFile(source);
		} catch (err) {
			// handle any errors
			spinner.stop();
			console.log(err);
		}
	})();
}
function deleteFile(source){
	setTimeout(() => {
		fs.unlink(source, (err) => {
			if (err) {
			  console.error(err)
			  return
			}
		  
			//file removed
			console.log('Extraction complete')
		});
	},1000);
}
*/
































function createNewAppfactoryJSApp(){



var newDir = "";
if(args.dir!=undefined){
  newDir = args.dir;
}else if(args.d!=undefined){
  newDir = args.d;
}else{
  newDir = "appfactory-app";
}


fs.access(newDir, function(error) {
  if (error) {
    createProject();
  } else {
    directoryExist();
  }
})


function ___directoryExist(){
	let interval;
	(async function(){
  
		var dir_id = "";
		const questions = [
		  {
			type: 'select',
			name: 'overwrite',
			message: 'Directory: '+newDir+' already exists. Do you want to overwrite? (Can NOT be undone): ',
			choices: [
			  { title: 'Yes', value: true },
			  { title: 'No', value: false }
			]
		  }     
		];
  
		const answers = await prompt(questions, {onCancel:cleanup, onSubmit:cleanup});
  
		if(answers.overwrite){
		  console.log("overwritting...");
		  createProject();
		}else{
		  console.log("Ok");
		}
  
		//console.log(answers);
  
	})();
  
	function cleanup() {
		clearInterval(interval);
	}
  }



function createProject(){


function getRepoUrl(){
    var owner = "equippedcoding";
    var repo = "appfactoryjs";
    var branch = "master"
    var accessToken = "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";

    var options = {
        method: "GET",
        url: `https://api.github.com/repos/${owner.toLowerCase()}/${repo.toLowerCase()}/tarball/${branch}?access_token=${accessToken}`,
        headers: {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'mbejda.com'
        }
    };

    return options.url;

}



const spinner = ora().start();

// TODO: change to where your zip file is located
const repoName = 'node-zip-download-sample';
//const href = `https://nodeload.github.com/equippedcoding/appfactoryjs/zip/master`;
const zipFile = 'master.zip';

const source = `${getRepoUrl()}`;

console.log(source);

// TODO: change to the directory instead of the zip that you want to extract
const extractEntryTo = `${repoName}-master/`;

// TODO: change to the directory where you want to extract to
const outputDir = "./"+process.cwd();//"./me1";//`./${repoName}-master/`;



var appTitle = "";
if(args.title!=undefined){
  appTitle = args.title;
}else if(args.d!=undefined){
  appTitle = args.t;
}else{
  appTitle = "";
}





const request = require('superagent');

request
  .get(source)
  .set('Accept', 'application/vnd.github.v3.raw')
  .on('error', function(error) {
    console.log(error);
  })
  .pipe(fs.createWriteStream(zipFile))
  .on('finish', function() {

    setTimeout(function(){

		// 7777

      var zip = new admZip(zipFile);
      var zipEntries = zip.getEntries(); // an array of ZipEntry records

      var dirName = zipEntries[0].entryName;
      zip.extractAllTo(dirName, outputDir, true);
      setTimeout(function(){
        fs2.moveSync(dirName+"/"+dirName, process.cwd()+"/"+newDir, { overwrite: true });
        fs2.removeSync(dirName);
        fs2.removeSync(zipFile);

        var appfacConfig = process.cwd()+"/"+newDir+"/"+mainConfigFile;
        //appUtils.requestConfig(appfacConfig,function(){});
        fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
          if(err) console.log(err);

          //console.log(configFile);

          var config = JSON.parse(configFile);
          config['requirejs-config'];
          //config['index-config'].title = appTitle;
          config['indexes']['index'].title = appTitle;

          /*
          var x = {
            "index-config": config['index-config'],
            "requirejs-config": config['requirejs-config']
          }
          */

          //var x2 = JSON.stringify(x, null, 4);
          var x2 = JSON.stringify(config, null, 4);
          var writeStream = fs.createWriteStream(appfacConfig);
          writeStream.write(x2);
          writeStream.end();

          // var newpath1 = process.cwd()+"/"+newDir;
          // var child_process = require('child_process');
          // child_process.exec(`cd ${newpath1} && appfactory plugin -r`, function(err, stdout, stderr){ 
          //     console.log(err);
          // });
          // 
          process.chdir(process.cwd()+"/"+newDir);

          pluginManager( {r:true}, function(appfacConfig){}, newDir);



          //handleHTMLFile(config['index-config']);

        });

        spinner.stop();
      },3000);

    },1000);
      
  });

function handleHTMLFile(indexConfig){
    var appfactorystart = "js/config/libs/appfactorystarter.js",
      main = "js/main.js",
      outputBuild = "js/build.min.js",
      appfacConfig = mainConfigFile,//"config.appfac.js",
      index_meta = "",
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
    for(var i in scriptsConf){
      if(index_scripts=="")
        index_scripts = "\t"+scriptsConf[i];
      else
        index_scripts = index_scripts+"\n\t"+scriptsConf[i];
    }

    var indeHTML = applyHTML(
           index_doctype
          ,index_meta
          ,index_head
          ,index_title
          ,index_body
          ,index_scripts
        );

    var writeStream = fs.createWriteStream(process.cwd()+"/"+newDir+"/index.html");
    writeStream.write(indeHTML);
    writeStream.end();

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




}

}//END





















