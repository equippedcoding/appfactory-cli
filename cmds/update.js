const fs = require('fs-extra');
const ora = require('ora');
const ghdownload = require('github-download');
const exec = require('exec');
const request = require('superagent');
const ncp = require('ncp').ncp;
const admZip = require('adm-zip');

 
module.exports = async (args) => {


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
        fs.removeSync(dirName);
        spinner.stop();
	      
	  });


	 



}// end



