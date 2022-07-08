{
    "version":"0.1.4",
    "application": {
        "use-static": false,
        "prod": false,
        "production_url": "",
        "development_url": "",
        "client-active-theme": "app|default",
        "admin-active-theme": "app|default",
        "plugins": {
            "app": {
                "name": "App",
                "directory": "app",
                "start": "init",
                "admin-active": true,
                "client-active": true
            },
            "under_construction": {
                "name": "Under Construction",
                "directory": "under_construction",
                "start": "init",
                "admin-active": true,
                "client-active": true
            }
        }
    },
    "indexes": {
        "all": {
            "doctype": "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">",
            "meta": [
                "<meta charset=\"UTF-8\">",
                "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">",
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">"
            ],
            "head": [
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"{static/bootstrap/bootstrap.css}\">",
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"{static/appfactoryjs/appfactory.css}\">"
            ],
            "body": []
        },
        "index": {
            "settings": {
                "path": "",
                "init": true
            },
            "title": "",
            "meta": [],
            "head": [],
            "body": [
                "<script data-main=\"static/main.js\" src=\"static/requirejs/require.js\"></script>"
            ]
        },
        "admin": {
            "settings": {
                "path": "../../",
                "init": false
            },
            "title": "Administration Page",
            "meta": [],
            "head": [],
            "body": [
                "<script data-main=\"js/main.js\" src=\"../../static/requirejs/require.js\"></script>"
            ]
        }
    }, 
    "includes":{},
    "requirejs-config": {
        "waitSeconds": 35,
        "shim": {},
        "name": "plugins/main",
        "baseUrl": "./",
        "out": "build/bundle.js",
        "optimize": "none",
        "paths": {
            "appfactory": "static/appfactoryjs/appfactory",
            "underscore": "static/underscore/underscore",
            "backbone": "static/backbone/backbone",
            "popper": "static/bootstrap/popper", 
            "bootstrap": "static/bootstrap/bootstrap",
            "jquery": "static/jquery/jquery"
        }
    }
}