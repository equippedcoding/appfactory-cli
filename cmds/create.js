const ora = require('ora');
const ghdownload = require('github-download');
const exec = require('exec');
const request = require('superagent');
const fs = require('fs');
const ncp = require('ncp').ncp;
const fs2 = require('fs-extra');
const admZip = require('adm-zip');

module.exports = async (args) => {


const spinner = ora().start();

// TODO: change to where your zip file is located
const repoName = 'node-zip-download-sample';
const href = `https://nodeload.github.com/equippedcoding/appfactoryjs/zip/master`;
const zipFile = 'master.zip';

const source = `${href}`;

// TODO: change to the directory instead of the zip that you want to extract
const extractEntryTo = `${repoName}-master/`;

// TODO: change to the directory where you want to extract to
const outputDir = "./"+process.cwd();//"./me1";//`./${repoName}-master/`;

var newDir = "";

if(args.dir!=undefined){
  newDir = args.dir;
}else if(args.d!=undefined){
  newDir = args.d;
}else{
  newDir = "appfactory-app";
}

request
  .get(source)
  .on('error', function(error) {
    console.log(error);
  })
  .pipe(fs.createWriteStream(zipFile))
  .on('finish', function() {

    setTimeout(function(){

      var zip = new admZip(zipFile);
      var zipEntries = zip.getEntries(); // an array of ZipEntry records

      var dirName = zipEntries[0].entryName;
      zip.extractAllTo(dirName, outputDir, true);
      setTimeout(function(){
        fs2.moveSync(dirName+"/"+dirName, process.cwd()+"/"+newDir, { overwrite: true });
        fs2.removeSync(dirName);
        fs2.removeSync(zipFile);

        spinner.stop();
      },3000);



      // fs.copyFileSync(dirName,"youto");

      //fs.renameSync(dirName,'hello_world');

      //   ncp(dirName, "hello_world", function (err) {
      //  if (err) {
      //    return console.error(err);
      //  }


      //  console.log('done!');
      // });


    },1000);
      
  });


  

  // console.log(process.cwd());

  // ghdownload('https://github.com/equippedcoding/appfactoryjs.git', process.cwd())
  //   .on('dir', function(dir) {
  //     console.error("77777777")
  //     console.log(dir)
  //   })
  //   .on('file', function(file) {
  //     console.error("3333333333")
  //     console.log(file)
  //   })
  //   .on('zip', function(zipUrl) { //only emitted if Github API limit is reached and the zip file is downloaded
  //     console.log(zipUrl)
  //   })
  //   .on('error', function(err) {
  //     console.error("111111111")
  //     console.error(err)
  //   })
  //   .on('end', function() {
  //     exec('tree', function(err, stdout, sderr) {
  //     console.error("2222222222")
  //       console.log(stdout)
  //     console.error("2222222222")
  //       console.log(err)
  //     console.error("2222222222")
  //       console.log(sderr)
  //     })
  //   })

  //console.log(args);
  // const spinner = ora().start();

  // try {
  //   const location = args.location || args.l
  //   const weather = await getWeather(location)

  //   spinner.stop()

  //   console.log(`Current conditions in ${location}:`)
  //   console.log(`\t${weather.condition.temp}° ${weather.condition.text}`)
  // } catch (err) {
  //   spinner.stop()

  //   console.error(err)
  // }


}




