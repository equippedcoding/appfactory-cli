const minimist = require('minimist');
const error = require('./utils/error');

module.exports = () => {

	const args = minimist(process.argv.slice(2));
	//console.log(args);
	//console.log('Welcome to the outside');


	var cmd = args._[0] || 'help';

	if(args.version || args.v){
		cmd = 'version';
	}

	if(args.help || args.h){
		cmd = "help";
	}


	switch(cmd){

		case 'create':
			require('./cmds/create')(args);
			break;
		case 'help':
			require('./cmds/help')(args);
			break;
		case 'version':
			require('./cmds/version')(args);
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
		default:
			error(`"${cmd}" is not a valid command!`, true);
			break;
	}






}