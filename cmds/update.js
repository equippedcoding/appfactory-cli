const fs = require('fs-extra');
const ora = require('ora');
const ghdownload = require('github-download');
const exec = require('exec');
const request = require('superagent');
const ncp = require('ncp').ncp;
const admZip = require('adm-zip'); 
const prompt = require('prompts');
const generalSupport = require('./support/general_support')();
var pluginInit = require('./support/file_creator')();

 
module.exports = async (args) => {



	createNewAppfactoryJSApp();



	function createNewAppfactoryJSApp(){


//const spinner = ora().start();

// TODO: change to where your zip file is located
const repoName = 'node-zip-download-sample';
const href = `https://nodeload.github.com/equippedcoding/appfactoryjs/zip/master`;
const zipFile = 'master.zip';

const source = `${href}`;

// TODO: change to the directory instead of the zip that you want to extract
const extractEntryTo = `${repoName}-master/`;

// TODO: change to the directory where you want to extract to
//const outputDir = "./"+process.cwd();//"./me1";//`./${repoName}-master/`;
var outputDir = __dirname+"/tmp/appfactory_tmp";

var newDir = "";
if(args.dir!=undefined){
  newDir = args.dir;
}else if(args.d!=undefined){
  newDir = args.d;
}else{
  newDir = "appfactory-app";
}

var appTitle = "";
if(args.title!=undefined){
  appTitle = args.title;
}else if(args.d!=undefined){
  appTitle = args.t;
}else{
  appTitle = "";
}


const request = require('superagent');

// setTimeout(function(){
//   spinner.stop();
// },7000);

request
  .get(source)
  .on('error', function(error) {
    console.log(error);
  })
  .pipe(fs.createWriteStream(zipFile))
  .on('finish', function() {

      var zip = new admZip(zipFile);
      var zipEntries = zip.getEntries(); // an array of ZipEntry records

      var dirName = zipEntries[0].entryName;

      var placeDir = outputDir+"/"+dirName;

      var rootTmp = __dirname+"/tmp/appfactory_tmp/setup_files";

      var phpIncludesDir = process.cwd()+"/control_panel/admin/includes";
      var tmp_phpIncludesDir = rootTmp+"/includes";

      fs.ensureDir(tmp_phpIncludesDir);

      var pluginsDirectory = process.cwd()+"/plugins";
      var tmp_pluginsDirectory = rootTmp+"/plugins";

      fs.ensureDir(tmp_pluginsDirectory);


      const filterFunc = (src, dest) => {
        // console.log(src);
        // console.log(dest);
        return true;
      }

      zip.extractAllTo(placeDir, outputDir, true);

      console.log("Updating...");

      generalSupport.readFile(placeDir+"/"+dirName+"/config.appfac.js",function(newContents){

        generalSupport.readFile(process.cwd()+"/config.appfac.js",function(oldContents){
          var newConfig = JSON.parse(newContents);
          var oldConfig = JSON.parse(oldContents);

          if(newConfig.version==undefined){
            newConfig.version = "5.6.4";
          }

          var tmpObj = {};
          tmpObj['version'] = newConfig.version;
          for(prop in oldConfig){
            if(prop != "version"){
              tmpObj[prop] = oldConfig[prop];
            }
          }

          //oldConfig['version'] = newConfig['version'];

          oldConfig = tmpObj;


          // copy control_panel/admin/inlcudes
          fs.copy(phpIncludesDir, tmp_phpIncludesDir, { filter: filterFunc }, err1 => {
            if (err1) return console.error(err1);
            // copy plugins directory
            fs.copy(pluginsDirectory, tmp_pluginsDirectory, { filter: filterFunc }, err2 => {
              if (err2) return console.error(err2);
              // copy appfact.config.
              //fs.copy(process.cwd()+"/config.appfac.js", rootTmp+"/config.appfac.js", { filter: filterFunc }, err3 => {
              //  if (err3) return console.error(err3);

                runit(oldConfig);
              //});
            });
          });
        });
      });






      function runit(oldConfig){

      fs.emptyDir(process.cwd(), function(err1){
        fs.copy(placeDir+"/"+dirName, process.cwd(), { filter: filterFunc }, err2 => {
          if (err2) return console.error(err2);

          // copy control_panel/admin/inlcudes
          fs.copy(tmp_phpIncludesDir, phpIncludesDir, { filter: filterFunc }, err5 => {
            if (err5) return console.error(err5);
            // copy plugins directory
            fs.copy(tmp_pluginsDirectory, pluginsDirectory, { filter: filterFunc }, err4 => {
              if (err4) return console.error(err4);

              var configString = JSON.stringify(oldConfig, null, 4);
              generalSupport.writeToFile(process.cwd()+"/config.appfac.js",configString);
              
              // copy appfact.config.
              //fs.copy(rootTmp+"/config.appfac.js", process.cwd()+"/config.appfac.js", { filter: filterFunc }, err3 => {
              //  if (err3) return console.error(err3);

                fs.remove(placeDir);
                fs.remove(rootTmp);
              //});
            });
          });
        });
      });



      }







      // fs.remove(placeDir, err => {
      //   if (err) return console.error(err)

      //   console.log('success!')
      // });
      // setTimeout(function(){
      //   fs2.moveSync(dirName+"/"+dirName, process.cwd()+"/"+newDir, { overwrite: true });
      //   fs2.removeSync(dirName);
      //   fs2.removeSync(zipFile);

      //   var appfacConfig = process.cwd()+"/"+newDir+"/config.appfac.js";
      //   //appUtils.requestConfig(appfacConfig,function(){});
      //   fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
      //     if(err) console.log(err);
      //     var config = JSON.parse(configFile);
      //     config['requirejs-config'];
      //     config['index-config'].title = appTitle;


      //     var x2 = JSON.stringify(config, null, 4);
      //     var writeStream = fs.createWriteStream(appfacConfig);
      //     writeStream.write(x2);
      //     writeStream.end();

      //   });

      //   spinner.stop();
      // },3000);

      
  });



}//END



















































































	function oldUpdate(){
	

		var currentDir = process.cwd()+"/.it";
		var isInRootDir = fs.pathExistsSync(currentDir);
		if(!isInRootDir){
			console.log("Please run command in the root of your project!");
			return;
		}


		const source = `https://nodeload.github.com/equippedcoding/appfactoryjs-lib/zip/master`;
		const zipFile = 'master.zip';
		const spinner = ora().start();

		request
		  .get(source)
		  .on('error', function(error) {
		    console.log(error);
		  })
		  .pipe(fs.createWriteStream(zipFile))
		  .on('finish', function() {

		    var zip = new admZip(zipFile);
		    var zipEntries = zip.getEntries(); // an array of ZipEntry records

		    var dirName = zipEntries[0].entryName;
		    // for(var i=0; i<zipEntries.length; i++){
		    // 	var file = zipEntries[i].entryName;
		    // }

		    zip.extractAllTo(dirName, process.cwd(), true);
	        fs.moveSync(dirName+"/"+dirName+"/appfactory.js", process.cwd()+"/js/libs/appfactoryjs/appfactory.js", { overwrite: true });
	        fs.moveSync(dirName+"/"+dirName+"/appfactory.css", process.cwd()+"/js/libs/appfactoryjs/appfactory.css", { overwrite: true });
	        fs.moveSync(dirName+"/"+dirName+"/appfactorystarter.js", process.cwd()+"/js/libs/appfactoryjs/appfactorystarter.js", { overwrite: true });
	        fs.removeSync(dirName);
	        spinner.stop();
		      
		  });
		 
	}


}// end



