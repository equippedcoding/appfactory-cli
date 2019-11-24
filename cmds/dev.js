


const fs = require('fs-extra');
var fileCreator = require('./support/file_creator')();



module.exports = (args) => {




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




