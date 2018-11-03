const menus = {
	main: `
appfactory [command] <options>

create ......... Creates a new Appfactory app
	--dir, -d ......... Name of the app directory
version ......... Show package version
help ......... Show help menu for a command
update ......... Update appfactoryJS
add ......... Add new component default is a js component
	--type, -t ......... Either JS component or HTML component
composer ......... A wrapper for the php composer program.
	--dir, -d ......... Name of directory, if this option is not provided then a random name is given so you might want to specify this param
	--command, -c ......... !Requred - The php composer command
	`,

	create: `
appfactory create <options>

--dir, -d ......... Name of the app directory
	`,

	update: `Update AppfactoryJS app`,

	composer: `
--dir, -d ......... Name of directory
--command, -c ......... !Requred - The php composer command
	`,

	add: `
--name, -n ......... Adds new component (requred)
--type, -t ......... options js|html (default is js)

	`,

};


module.exports = (args) => {

	const subCmd = args._[0] === 'help'
		? args._[1]
		: args._[0];

	console.log(menus[subCmd] || menus.main);
		
};


