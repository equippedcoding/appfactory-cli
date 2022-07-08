import { createRequire } from 'module';
const require = createRequire(import.meta.url);


const { version } = require('../package.json');
import { readFile } from './support/general_support.js';
const fs = require('fs');

export function Run(args) {

	var mainConfigFile = process.cwd()+"/main.config.json";
	if(fs.existsSync(mainConfigFile)){
		readFile(mainConfigFile,function(contents){
			var config = JSON.parse(contents);
			if(config['version']!=undefined){
				console.log(`CLI client   v${version}`);
				console.log(`AppfactoryJS v${config.version}`);		
			}else{
				console.log(`CLI client v${version}`);	
			}
		});	

	}else{
		console.log(`CLI client v${version}`);	
	}

	
};