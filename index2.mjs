import { createRequire } from 'module';
const require = createRequire(import.meta.url);


const minimist = require('minimist');
const error = require('./utils/error');


// /usr/local/lib/node_modules/@equippedcoding/
// 
// ln -s /Users/jamesmitchell/Desktop/Projects/appfactoryjs_project/appfactory-cli /usr/local/lib/node_modules/@equippedcoding
module.exports = () => {

	const args = minimist(process.argv.slice(2));
	//console.log(args);
	//console.log('Welcome to the outside');


	var cmd = args._[0] || 'help';

	if(args.version){
		cmd = 'version';
	}

	if(args.help){
		cmd = "help";
	}

	switch(cmd){
		case 'dev':
			require('./cmds/dev')(args);
			break;

		case 'create':
			require('./cmds/create')(args);
			break;
		case 'help':
			require('./cmds/help')(args);
			break;
		case 'version':
			require('./cmds/version')(args);
			break;
		case 'login':
			require('./cmds/login')(args);
			break;
		case 'register':
			require('./cmds/register')(args);
			break;
		case 'composer':
			require('./cmds/composer')(args);
			break;
		case 'update':
			require('./cmds/update')(args);
			break;
		case 'add':
			require('./cmds/add')(args);
			break;
		case 'build':
			require('./cmds/build')(args);
			break;
		case 'plugin':
			require('./cmds/plugin')(args);
			break;
		case 'css':
			require('./cmds/css')(args);
			break;
		case 'utils':
			require('./cmds/utils')(args);
			break;
		case 'lib':
			require('./cmds/lib')(args);
			break;
		default:
			error(`"${cmd}" is not a valid command!`, true);
			break;
	}






}