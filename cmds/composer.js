const exec = require('exec');
const fse = require('fs-extra');
const randomstring = require("randomstring");

module.exports = (args) => {

	var currentDir = process.cwd()+"/.it";
	var isInRootDir = fs.pathExistsSync(currentDir);
	if(!isInRootDir){
		console.log("Please run command in the root of your project!");
		return;
	}

	var file = `${process.cwd()}/.it`;
	var exists = fse.pathExistsSync(file);

	// appfactory composer --dir media --command "require php-ffmpeg/php-ffmpeg"
	var composer = `php ${process.cwd()}/php/bin/composer.phar`;
	// if(exists){
	// 	var libsDir = `${process.cwd()}/php/libs`;
	// 	var doesLibsExist = fse.pathExistsSync(libsDir);
	// 	if(doesLibsExist){
	// 		make();
	// 	}else{
	// 		fs.ensureDirSync(libsDir);
	// 		make();
	// 	}
	// 	function make(){}
	// }else{
	// }

	var command;
	if(args.command!=undefined){
		command = args.command;
	}else if(args.c!=undefined){
		command = args.c;
	}else{
		console.log("Please provide a valid php-composer command!");
		return;
	}


	// var copyto = process.cwd()+"/php/libs/media/";
	// fse.ensureDirSync(copyto);
	// fse.copyFileSync(process.cwd()+"/php/bin/composer.phar",
	// 				 copyto+"composer.phar");

	// require php-ffmpeg/php-ffmpeg

	if(command.includes('require')){
		addNewPackageCommand();
	}else{
		anyCommand();
	}

	function anyCommand(){
		var dir = exec(`${composer} ${command}`, function(err, stdout, stderr) {
		  if (err) { 
		  	console.log(err); 
		  }else{
		  	console.log(stdout);
		  }
		});

		dir.on('exit', function (code) {
		  // exit code is code
		  console.log(code);
		});
	}
	function addNewPackageCommand(){
		var newDir = createDirname();
		console.log(newDir);
		fse.ensureDirSync(`${process.cwd()}/php/libs/${newDir}`);
		var dir = exec(`cd ${process.cwd()}/php/libs/${newDir}; ${composer} ${command}`, function(err, stdout, stderr) {
		  if (err) {
		    // should have err.code here?  
		  }

		  //fse.removeSync(copyto+"composer.phar");

		  fse.appendFile(`${process.cwd()}/php/includes.php`, `\ninclude_once '${newDir}/vendor/autoload.php';`, (err) => {  
		  	if (err) throw err;
			    //console.log('The lyrics were updated!');
		  });
		  console.log(stdout);
		});

		dir.on('exit', function (code) {
		  // exit code is code
		  console.log(code);
		});
	}


	function createDirname(){
		var newDir = "";
		if(args.dir!=undefined){
			newDir = args.dir;
		}else if(args.d!=undefined){
			newDir = args.d;
		}else{
			var ran = randomstring.generate({
			  length: 12,
			  capitalization: 'lowercase',
			  charset: 'alphabetic'
			});
			newDir = "package_"+ran;
		}
		return newDir;
	}

};// end



