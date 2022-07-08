# AppfactoryJS CLI

Command line tool to manage [AppfactoryJS framework](https://github.com/equippedcoding/appfactoryjs)


### Installing

To install run 

```
npm install "@equippedcoding/appfactory-cli"
```


## Getting Started

Create a new appfactoryJS project

```
appfactory create --dir "directory_name" --title "App Title"
```

To update appfactory files - probably want to save files in case of issues on update 

```
 appfactory update
```


Create a plugin

```
 appfactory create --plugin (starts prompt)
```

Remove and restore a plugin

```
appfactory plugin --remove pluginName
appfactory plugin --restore pluginName
```

Create a prototype class

```
appfactory add --class "pluginId className" 
```

Add new component

```
appfactory add --component "pluginId themeName componentName" 
```



Create a CSS file

```
appfactory plugin --css "pluginId themeName cssFileName" 
```

Create a new theme

```
appfactory plugin --theme "pluginId themeName"
```


Change plugin theme

```
appfactory plugin --changeTheme "pluginId themeName"
```






## Authors

* **Joseph Mitchell** 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

