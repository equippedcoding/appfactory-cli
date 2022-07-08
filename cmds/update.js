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

 
var mainConfigFile = generalSupport.mainConfigFile;

module.exports = async (args) => {


//const spinner = ora().start();
//
//

var currentDir = process.cwd()+"/.it";
var isInRootDir = fs.pathExistsSync(currentDir);
if(!isInRootDir){
    console.log("Please run command from application root directory");
    return false;
}

var outputDir = __dirname+"/tmp/appfactory_tmp";

const filterFunc = (src, dest) => {
    // console.log(src);
    // console.log(dest);
    return true;
}


// var tempProjectFileLoc = __dirname+"/tmp/appfactory_tmp/setup_files/project_files";
// fs.copy(process.cwd(), rootTmp, { filter: filterFunc }, err1 => {
//     if (err1) return console.error(err1);
// }); 


const repoName = 'node-zip-download-sample';
const href = `https://nodeload.github.com/equippedcoding/appfactoryjs/zip/master`;
const zipFile = __dirname+'/master.zip';
const source = `${href}`;

request
    .get(source)
    .on('error', function(error) {
        console.log(error);
    })
    .pipe(fs.createWriteStream(zipFile))
    .on('finish', function() {

        var zip = new admZip(zipFile);
        var zipEntries = zip.getEntries(); 
        var dirName = zipEntries[0].entryName;
        var tempDir = outputDir+"/"+dirName;
        var thisDir = process.cwd();

        zip.extractAllTo(outputDir, outputDir, true);
        mergeConfigFiles(tempDir+"/"+mainConfigFile, thisDir+"/"+mainConfigFile);


        fs.move(tempDir+"control_panel", thisDir+"/control_panel", { overwrite: true }, err1 => {
            fs.move(tempDir+"static", thisDir+"/static", { overwrite: true }, err2 => {
                fs.move(tempDir+"index.php", thisDir+"/index.php", { overwrite: true }, err3 => {
                    fs.removeSync(zipFile);
                });
            });
        });

        function mergeConfigFiles(tempConfigfile,thisConfigfile){
            generalSupport.readFile(tempConfigfile, function(newContents){
                generalSupport.readFile(process.cwd()+"/"+mainConfigFile,function(oldContents){
                    var newConfig = JSON.parse(newContents);
                    var oldConfig = JSON.parse(oldContents);

                    // update the configuration version in the config file but dont over write the config file
                    if(newConfig.version==undefined){
                        newConfig.version = "0.0.0";
                    }

                    oldConfig['version'] = newConfig['version'];

                    generalSupport.writeToFile(thisConfigfile, JSON.stringify(oldConfig, null, 4));
                });
            });
        }






















        function replacedir(){
            fs.readdir(dirName, function(err, files) {
                if (err)  return;
                if(!files.length) {
                    var rootTmp = __dirname+"/tmp/appfactory_tmp/setup_files/project_files";
                    fs.copy(rootTmp, process.cwd(), { filter: filterFunc }, err1 => {
                        if (err1) return console.error(err1);
                    });   
                    console.log("An error occured, project could not be updated");
                }
            });
        }
        function runit(oldConfig){
            fs.emptyDir(process.cwd(), function(err1){
                fs.copy(placeDir+"/"+dirName, process.cwd(), { filter: filterFunc }, err2 => {
                    if (err2) return console.error(err2);

                    // copy control_panel/admin/inlcudes

                    try {
                        if(fs.existsSync(tmp_phpIncludesDir)) {
                            fs.copy(tmp_phpIncludesDir, phpIncludesDir, { filter: filterFunc }, err5 => {
                                if (err5) return console.error(err5);
                            });
                        }
                    }catch(e) {
                        console.log(e);
                    }

                    // copy plugins directory
                    fs.copy(tmp_pluginsDirectory, staticDirectory, { filter: filterFunc }, err4 => {
                        if (err4) return console.error(err4);

                        fs.copy(placeDir+"appfactoryjs-master/static/main.js", staticDirectory+"/main.js", { filter: filterFunc }, err7 => { 
                            if(err7) console.error(err7);
                            // copy appfact.config.
                            //fs.copy(rootTmp+"/config.appfac.js", process.cwd()+"/config.appfac.js", { filter: filterFunc }, err3 => {
                            //  if (err3) return console.error(err3);

                            // fs.remove(placeDir);
                            // fs.remove(rootTmp);

                            generalSupport.writeToFile(process.cwd()+"/"+mainConfigFile,JSON.stringify(oldConfig, null, 4)); 
                            console.log("Project updated successfully");

                        });


                        //});
                    });
                });
            });
        }
    });









                    // // merge new config file with the old config file
                    // var tmpObj = {};
                    // tmpObj['version'] = newConfig.version;
                    // for(prop in oldConfig){
                    //     if(prop != "version"){
                    //         tmpObj[prop] = oldConfig[prop];
                    //     }
                    // }

                    // //oldConfig['version'] = newConfig['version'];

                    // oldConfig = tmpObj;


                    // try {
                    //     if(fs.existsSync(tmp_phpIncludesDir)){
                    //         // copy control_panel/admin/inlcudes
                    //         fs.copy(phpIncludesDir, tmp_phpIncludesDir, { filter: filterFunc }, err1 => {
                    //             if (err1) return console.error(err1);
                    //         });                        
                    //     }
                    // }catch(e){
                    //     //console.log("includes does not exist");
                    // }

                    // fs.copy(pluginsDirectory, tmp_pluginsDirectory, { filter: filterFunc }, err2 => {
                    //     if (err2) return console.error(err2);
                    //     // copy appfact.config.
                    //     //fs.copy(process.cwd()+"/config.appfac.js", rootTmp+"/config.appfac.js", { filter: filterFunc }, err3 => {
                    //     //  if (err3) return console.error(err3);

                    //     //runit(oldConfig);
                    //     //});
                    // });











































































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



