

module.exports = (args) => {


var options = {
	requestConfig: function(appfacConfig,callback){
		_requestConfig(appfacConfig,callback);
	},
	writeIndexFile: function(indexConfig){
		handleHTMLFile(indexConfig);
	},
	writeToConfigFile: function(config){

	}
};
function _requestConfig(appfacConfig,callback){
	fs.readFile(appfacConfig, 'utf8', function(err, configFile) {
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

		callback();

		// handleHTMLFile(config['index-config']);

	});
}






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






















};