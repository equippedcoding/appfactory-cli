const ora = require('ora');
const ghdownload = require('github-download'); 
const exec = require('exec');
const fs = require('fs');
const ncp = require('ncp').ncp;
const fs2 = require('fs-extra');
const admZip = require('adm-zip');
const appUtils = require('../utils/app.js');
const prompt = require('prompts');
const generalSupport = require('./support/general_support')();
var pluginInit = require('./support/file_creator')();

module.exports = async (args) => {



// Create plugin
if(args.plugin!=undefined){
  createNewPluginTemplate();
}else{
  createNewAppfactoryJSApp();
}





function createNewPluginTemplate(){

  var currentDir = process.cwd()+"/.it";
  var isInRootDir = fs2.pathExistsSync(currentDir);
  if(!isInRootDir){
    Console.log("Please run command from application root directory");
    return false;
  }


  if(typeof args.plugin === "string"){

    var answers = {
      name: args.plugin,
      directory: args.plugin
    };
    createNewPluginTemplate11(answers);
  }else if(typeof args.plugin === "boolean"){
    let interval;
    (async function(){

        var dir_id = "";
        const questions = [

            {
                type: 'text',
                name: 'name',
                message: `Enter Plugin Name (required)`,
                validate: function(value){
                  if(value==""){
                    return "Plugin name is required";
                  }else
                  if(generalSupport.checkIfValid(value,["_",".","-"," "])==false){
                    return "Plugin name is not valid";
                  }else{
                    return true;
                  }
                }
                
            },
            {
                type: 'text',
                name: 'directory',
                message: function(prev, values){
                  return `Enter Plugin Directory Name: (required)`;
                },
                validate: function(value){
                  if(value==""){
                    return "Directory is required";
                  }else
                  if(generalSupport.checkIfValid(value,["_",".","-"])==false){
                    return "Directory is not valid";
                  }else{
                    return true;
                  }
                }
                
            }
            /*
            ,{
                type: 'text',
                name: 'id',
                message: function(prev, values){
                  return `Enter Plugin ID: (${prev})`;
                }
            },
            {
                type: 'text',
                name: 'init',
                message: `Enter Plugin start file: (optional)`,
                
            },
            {
                type: 'text',
                name: 'url',
                message: `Enter Plugin URL: (optional)`,
                
            }
            */      
        ];

        const answers = await prompt(questions, {onCancel:cleanup, onSubmit:cleanup});

        console.log(answers);

        createNewPluginTemplate11(answers);

    })();

    function cleanup() {
        clearInterval(interval);
    }
  }



}


function createNewAppfactoryJSApp(){





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


const request = require('superagent');

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
          if(err) console.log(err);
          var config = JSON.parse(configFile);
          config['requirejs-config'];
          config['index-config'].title = appTitle;

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

}//END


function createNewPluginTemplate11(answers){

  // appfactory add -admin -plugin "" -name "componentName" -type "js"

  var createNewPlugin = answers.name;
  var createNewPluginDir = answers.directory;
  /*
  var createNewPluginWithId = answers.id;
  var createNewPluginWithURL = answers.url;
  var createNewPluginInit = answers.init;
  */

  var appfacConfig = fs2.readFileSync(process.cwd()+"/config.appfac.js");
  appfacConfig = JSON.parse(appfacConfig);


  var mainJsonConfigFile = process.cwd()+"/js/plugins/plugin.config.json";
  var does_main_config_exist = fs2.pathExistsSync(mainJsonConfigFile);
  var main_config;
  if(does_main_config_exist){
    generalSupport.readFile(mainJsonConfigFile,function(content){

      if(typeof content == "boolean"){
        content = {
          "directories":[],
          "plugins":[] 
        };
      }

      var main_config = JSON.parse(content);
      setcontent(main_config,appfacConfig);

    });
  }else{

    var main_config = {
      "directories":[],
      "plugins":[] 
    };

    setcontent(main_config,appfacConfig);

  }

  function setcontent(mainJSONConfig,appfacConfig){


  if(mainJSONConfig.directories){
    var does_match = false;
    for(var i=0; i<mainJSONConfig.directories.length; i++){
      var m = mainJSONConfig.directories[i].toLowerCase();
      var n = createNewPlugin.trim().toLowerCase();

      try{

        var file = process.cwd()+"/js/plugins/"+mainJSONConfig.directories[i]+"/plugin.config.json";

        const obj = fs2.readJsonSync(file, { throws: false });

        if(obj==undefined || obj==null) continue;
        var isMatched = false;
        if(obj.name!=null || obj.name!=undefined){
          if(obj.name.trim().toLowerCase() == n){
            isMatched = true;
          }
        }

        if(isMatched){
          console.log("Plugin name already exist: "+createNewPlugin+" - Plugin was Not Created");
          does_match = true;
          break;
        }

      }catch(e){
        console.log(e);
      }
    }

    if(does_match){
      return;
    }
  }else{
    mainJSONConfig.directories = [];
  }


  var pluginExist = fs2.pathExistsSync(process.cwd()+"/js/plugins/"+createNewPluginDir);
  if(pluginExist){
    console.log("Plugin directory already exist: "+createNewPluginDir)
    return;
  }

  // plugin directory
  var plugin_admin = process.cwd()+"/js/plugins/"+createNewPluginDir+"/admin";
  fs2.ensureDirSync(plugin_admin);

  var plugin_admin_classes = process.cwd()+"/js/plugins/"+createNewPluginDir+"/admin/classes";
  fs2.ensureDirSync(plugin_admin_classes);

  var plugin_admin_theme = process.cwd()+"/js/plugins/"+createNewPluginDir+"/admin/themes";
  fs2.ensureDirSync(plugin_admin_theme);

  //var a1 = plugin_admin+"/theme_interface.js";

  var plugin_client = process.cwd()+"/js/plugins/"+createNewPluginDir+"/client";
  fs2.ensureDirSync(plugin_client);

  var plugin_client_classes = process.cwd()+"/js/plugins/"+createNewPluginDir+"/client/classes";
  fs2.ensureDirSync(plugin_client_classes);

  var plugin_client_theme = process.cwd()+"/js/plugins/"+createNewPluginDir+"/client/themes";
  fs2.ensureDirSync(plugin_client_theme);



  // plugin components directory
  //var plugin_admin1 = process.cwd()+"/js/plugins/"+createNewPluginDir+"/admin/components";
  //var plugin_client1 = process.cwd()+"/js/plugins/"+createNewPluginDir+"/client/components";
  //fs2.ensureDirSync(plugin_admin1);
  //fs2.ensureDirSync(plugin_client1);

  // plugin classes directory
  


  // plugin services directory
  var servicePluginDir = process.cwd()+"/services/plugins/"+createNewPluginDir;
  fs2.ensureDirSync(servicePluginDir);

  var jsonPluginConfig = {
    "name": createNewPlugin,
    "id": createNewPluginDir,
    "url": "-",
    "start":"init",
    "active": true,
    "directory": createNewPluginDir,
    "services":{
      "dir": "-"
    },
    "admin": [
        {
            "directory": "default",
            "start": "theme_interface"
        }
    ],
    "client": [
        {
            "directory": "default",
            "start": "theme_interface"
        }
    ]


  };


/*
"client-active-theme": "zibra5|PlayaTheme03",
"admin-active-themes": [{"zibra5":"default"}]
*/

  var jsonPluginConfigString = JSON.stringify(jsonPluginConfig, null, 4);
  var filename = process.cwd()+"/js/plugins/"+createNewPluginDir+"/plugin.config.json";
  generalSupport.writeToFile(filename, jsonPluginConfigString);

  
  var pluginThemeFile = process.cwd()+"/js/plugins/"+createNewPluginDir+"/plugin.config.json";
  pluginInit.constructThemeDirectory(pluginThemeFile,createNewPluginDir,"default","theme_interface.js",jsonPluginConfig,"admin");
  pluginInit.constructThemeDirectory(pluginThemeFile,createNewPluginDir,"default","theme_interface.js",jsonPluginConfig,"client");
    


  var topLevelConfigFile = process.cwd()+"/config.appfac.js";
  var topLevelConfigFileContents = fs.readFileSync( topLevelConfigFile );
  var topLevelConfig = JSON.parse(topLevelConfigFileContents);

  if(topLevelConfig["application"]["admin-active-themes"]==undefined){
    topLevelConfig["application"]["admin-active-themes"] = {};
    topLevelConfig["application"]["admin-active-themes"][createNewPluginDir] = "default";
  }else{
    topLevelConfig["application"]["admin-active-themes"][createNewPluginDir] = "default";
  }
  generalSupport.writeToFile( topLevelConfigFile, JSON.stringify(topLevelConfig, null, 4) );

  
  
  mainJSONConfig["directories"].push(createNewPluginDir);
  generalSupport.writeToFile( mainJsonConfigFile, JSON.stringify(mainJSONConfig, null, 4) );

  }// end of function





  

  

  return true;

}













}// END




