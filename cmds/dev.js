


const fs = require('fs-extra');
var fileCreator = require('./support/file_creator')();
var generalSupport = require('./support/general_support')();


var mainConfigFile = generalSupport.mainConfigFile;

module.exports = (args) => {

	if(args.m!=undefined){

		saysomething();
	}



function saysomething(){

const glob = require("glob");

var fragmentDir = process.cwd() + "/plugins/app/fragments/";

var getDirectories = function (src, callback) {
  glob(src + '/**/*', callback);
};
getDirectories(fragmentDir, function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    var res2 = [];
    for(var i=0; i < res.length; i++){
    	res2.push(res[]);
    }
    console.log(res2);
  }
});

	// fs.readdir(,function(err, filenames){
	// 	console.log(filenames);
	// });


}




  return;

  console.log('change is working');

  var indexes = {
      "all": {
          "doctype": "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">",
          "meta": [
              "<meta charset=\"UTF-8\">",
              "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">",
              "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">"
          ],
          "head": [
              "<link rel=\"stylesheet\" type=\"text/css\" href=\"{libs/styles/bootstrap4/bootstrap.css}\">",
              "<link rel=\"stylesheet\" type=\"text/css\" href=\"{libs/scripts/appfactoryjs/appfactory.css}\">",
              "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=Shrikhand&display=swap\">"
          ],
          "body": []
      },
      "index": {
          "settings": {
          	"path": "",
          	"init": true
          },
          "title": "",
          "meta": [],
          "head": [],
          "body": [
              "<script data-main=\"plugins/main.js\" src=\"{libs/scripts/requirejs/require.js}\"></script>"
          ]
      },
      "admin": {
          "settings": {
          	"path": "../../",
          	"init": false
          },
          "title": "Administration Page",
          "meta": [],
          "head": [],
          "body": [
              "<script data-main=\"js/main.js\" src=\"../../libs/scripts/requirejs/require.js\"></script>"
          ]
      }
  }


	function _getIndex(indexes){
		var index = null;
		var index;
		for(prop in indexes){
			index = indexes[prop];
			if(indexes[prop]['settings']!=undefined && indexes[prop]['settings']['init']!=undefined){
				if(indexes[prop]['settings']['init']==true){
					index = indexes[prop];
					break;
				}
			}
		}
		return index;
	}

	//_getIndex(indexes)
	console.log(_getIndex(indexes));

//generalSupport.mergeIndexes(indexes);



return ;

var kill = require('kill-port');
var ON_DEATH = require('death');
var http = require('http').Server();
var io = require('socket.io')(http);

var h = 0;
io.on('connection', function(socket){
  console.log('a user connected');

  var x = setTimeout(function(){
  	h++;
  	io.emit('reload-page','hell-world');
  	io.close();
  	io.emit('disconnect','hell-world');
  	throw "";
  },4000);


});


if(h>1){
	clearTimeout(x);
}

  process.on("SIGINT", function(){
  	console.log("Kill Process 2");
  });

http.listen(9005, function(){
  console.log('listening on *:9005');
});





	return;
	console.log(fileCreator)


	/*
	if(config[path]==undefined){
		config[path] = [];
	}
	config[path].push({"directory":dir,"start":startScriptWithoutEndFileType});
	*/

	var path = "client";
	var pluginClientConfig = process.cwd()+"/plugins/"+"zibra5"+"/plugin.config.json";
	var pluginDirectoryName = "zibra5";
	var themeDirectoryName = "PlayaTheme03";
	var startScript = "init.js";
	var pluginConfig = JSON.parse(fs.readFileSync(pluginClientConfig));


	fileCreator.constructThemeDirectory(
		pluginClientConfig,
		pluginDirectoryName,
		themeDirectoryName,
		startScript,
		pluginConfig
	);

	console.log("dev testing working");



};




