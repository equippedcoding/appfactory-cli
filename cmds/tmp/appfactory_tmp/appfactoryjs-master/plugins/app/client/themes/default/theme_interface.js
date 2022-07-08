define(function(require, exports, module){
	
function init(app){

	app.Manager.register('home:init',function(obj){
		var header = Brick.stack().h2({
			style: "margin-top:5%;",
			innerHTML: "Welcome, AppfactoryJS"
		}).build();

		var layout = app.Layout.newLayout()
			.row()
			.col({md:12},[header])
			.build();

		var container = app.factory.container({
			className: "container",
			body: layout
		});

		// always return element from register function
		return container;
	});

	var pages = app.Pages.newPageView({
		init: true,
		routes: {
			'':'home:init'
		}
	});


	// start application life cycle with routing 
	app.Manager.init(pages);


}

return init;

});





