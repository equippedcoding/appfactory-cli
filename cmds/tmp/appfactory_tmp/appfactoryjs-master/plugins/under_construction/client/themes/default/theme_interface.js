define(function(require, exports, module){
	


	function init(app){


	    app.Manager.register('main:section',function(obj){

			var header = app.Factory.container({
				style: "margin-top:5%;",
				body: Brick.stack().div(
					"<h5>Under Construction</h5>")
					.build()
			});


			var layout = app.Layout.newLayout()
				.row()
				.col({md:12},[body])
				.build();

			var container = app.Factory.container({
				classes: "container",
				body: layout
			});

	      	return layout;
	    });

	    app.Manager.register('homeLayout' ,function(routes){
			var container = app.Factory.container({
				classes: "container",
				body: "@main:section"
			});
	      return container;
	    });


	    // The man init function that starts this theme
	    // application, initializes routes and starts the
	    // so called application life cycle. 
	    app.Manager.init(true,function(){
	      app.Pages.newPageView({
	        baseRoute: 'home',
	        init: true,
	        routes: {
	          '':'homeLayout component main:section'
	        }
	      });
	    });

		// start the application life cycle without routing
		// must return an appfactory object 
		//app.Manager.init();

		// an element is only being returned because this
		// sample application handled the container and 
		// displays it, but since this is the starting
		// point of the app the container element should 
		// either be appended to the dom are using the init()
		// method. 
		//return container;


	}



	return init;

});



