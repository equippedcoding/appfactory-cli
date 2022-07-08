# AppfactoryJS Framework

Javascript framework to build apps quick using components

## Getting Started

Use the command line tool [appfactoryjs-command-line-tool](https://github.com/equippedcoding/appfactory-cli) to download the framework.
The framework is plugin based, so all work is done with in a plugin. Within the default plugin...

build a view
```
var view = new app.View({ 
	// the view will be added automatically when this
	// element is appended to the dom
	parent: "#selector",

	// if this view is removed from the dom and added
	// back then the last view-child that was displayed
	// will be the view shown if set to true, otherwise
	// the init view will be shown.
	// to call the init view or last view just call
	// view.render() with no params
	remember: true
});

var comp1 = app.Factory.container({body:'<h2>hello</h2>'})
var comp2 = app.Factory.container({body:'<h2>world</h2>'})

view.newSubView({

	// the id of the view this is required
	id: "view1",

	// The initial view to show on load
	init: true,

	// The component element, can be 
	// component
	// - An appfactory object
	// @component 
	// - A component registered through Manager.register(id,param). 
	// - This will call that method with any given params 
	// element
	// - html object or html string
	body: comp1
});
view.newSubView({
	id: "view2",
	init: false,
	body: comp2
});
```


## Authors

* **Joseph Mitchell** 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



