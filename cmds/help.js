const menus = {
	main: `
appfactory [command] <options>

create ......... Creates a new Appfactory app
	--dir, -d ......... Name of the app directory
	--title, -t ......... Title of app
	----------------------------------------------
	--plugin ......... Initializes a form to creates a plugin
version ......... Show package version
help ......... Show help menu for a command
update ......... Update appfactoryJS
add ......... Add new component default is a js component
	--name, -n ......... Name of the component
	--type, -t ......... Either JS component or HTML component
	--path, -p ......... Path for the component to go (ex: path/to/component ) Do Not end with /
composer ......... A wrapper for the php composer program.
	--dir, -d ......... Name of directory, if this option is not provided then a random name is given so you might want to specify this param
	--command, -c ......... !Requred - The php composer command
build ......... Build script files
	--reverse, -r ......... Reverse the build
register ......... Register user account for AppfactoryJS
login .........If no params are given then will be prompt for credientials.
--username, -u ......... Username
--password, -p ......... Password

plugin ......... Manage plugin functionality
	--add "plugin_directory" -sa --name "name_of_component" 
		-s --- add a class component
		-e --- add a standered component
		--name --- name of component
		--type -t --- for standered component js|html
	--changeTheme "plugin_name|theme_name"
	--themeHead --- (plugin_name|theme_name) add param to the head of html files
		--type --- options - style = adds a style sheet and creates
					creates the styles sheet if does not exist 
	`,


	create: `
appfactory create <options>

--dir, -d ......... Name of the app directory
--title, -t ......... Title of app
------------------------------------------------
--plugin ......... Initializes a form to creates a plugin
	`,

	update: `Update AppfactoryJS app`,

	composer: `
--dir, -d ......... Name of directory
--command, -c ......... !Requred - The php composer command
	`,

	add: `
--name, -n ......... Adds new component (requred)
--type, -t ......... options js|html (default is js)
--path, -p ......... Path for the component to go (ex: path/to/component ) Do Not end with /

	`,
	build: `
--reverse, -r ......... Reverse the build
--for, -f ......... Options {"admin","client","both"}
`,
	register: `
Register user account with AppfactoryJS
	`,
	login: `
	If no params are given then will be prompt for credientials.
--username, -u ......... Username
--password, -p ......... Password

	`,

	plugin: `
plugin ......... Manage plugin functionality
	--add "plugin_directory" -sa --name "name_of_component" 
		-s --- add a class component
		-e --- add a standered component
		--name --- name of component
		--type -t --- for standered component js|html
	--changeTheme "plugin_name|theme_name"
	--themeHead --- (plugin_name|theme_name) add param to the head of html files
		--type --- options - style = adds a style sheet and creates
					creates the styles sheet if does not exist 
	`

};


module.exports = (args) => {

	const subCmd = args._[0] === 'help'
		? args._[1]
		: args._[0];

	console.log(menus[subCmd] || menus.main);
		
};


