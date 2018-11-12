const ora = require('ora');
const ghdownload = require('github-download'); 
const exec = require('exec');
const request = require('superagent');
const fs = require('fs');
const ncp = require('ncp').ncp;
const fs2 = require('fs-extra');
const admZip = require('adm-zip');
const appUtils = require('../utils/app.js');

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

var appTitle = "";
if(args.title!=undefined){
  appTitle = args.title;
}else if(args.d!=undefined){
  appTitle = args.t;
}else{
  appTitle = "";
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

        var appfacConfig = process.cwd()+"/"+newDir+"/config.appfac.js";
        //appUtils.requestConfig(appfacConfig,function(){});
        fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
          console.log(err);
          console.log(configFile);
          var config = JSON.parse(configFile);
          config['requirejs-config'];
          config['index-config'].title = appTitle;

          var x = {
            "index-config": config['index-config'],
            "requirejs-config": config['requirejs-config']
          }

          var x2 = JSON.stringify(x, null, 4);
          var writeStream = fs.createWriteStream(appfacConfig);
          writeStream.write(x2);
          writeStream.end();

          handleHTMLFile(config['index-config']);

        });

        spinner.stop();
      },3000);

    },1000);
      
  });

function handleHTMLFile(indexConfig){
    var appfactorystart = "js/config/libs/appfactorystarter.js",
      main = "js/main.js",
      outputBuild = "js/build.min.js",
      appfacConfig = "config.appfac.js",
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




