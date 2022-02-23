# SamplePlugin
This is an example for how a basic ModLoader64 plugin might look. The code can be found at [src/pluginsample/main.ts](src/pluginsample/main.ts).

## Creating a plugin
While this is an already-created plugin, you might want to make your own plugin from scratch. This is a short guide for how to generate and setup plugin.

### Generating the plugin
After you have ensured that ModLoader64 is installed correctly, to create a plugin, you can create a directory which has the name of the plugin, then run the following command
```sh
modloader64 -n
```

After this, there should be a folder named `src` and in that folder, another with the name of your plugin. Create a file in that directory with any name of your choice, and modify the `package.json` file in that directory to have the correct file name under the `main` field. Note that the file extension should be `.js` here.

In this example, the main file is called [main](src/pluginsample/main.ts), and you can see that the [package.json](src/pluginsample/package.json) is modified accordingly.

### Make sure to implement IPlugin
Your main file should by default export a class which implenets IPlugin. Below is an example:

```ts
export default class PluginName implements IPlugin {
    ModLoader = {} as IModLoaderAPI

    constructor() {}

    preinit() {}
    init() {}
    postinit() {}
    onTick(frame: number) {}
}
```

## Useful SDK commands
When developing a ModLoader64 plugin, there are various commands that you will want to use. Below are the most important commands:

|Command|Summary|
|:--|:--|
|modloader64 -c|clean the build|
|modloader64 -b|build the plugin|
|modloader64 -d|distribute a pak of the plugin|
|modloader64 -r|run the plugin|
|modloader64 -2|run a second instance of the plugin which is connected to the first|
|modloader64 -u|update modloader64|
|modloader64 -h|list every command with a summary|

Note that commands do not have to be separated. For example, if I run `modloader64 -cbr2`, this will clean the build, then build the plugin, and run two clients, with a server started on the first.

Also note that the first time you run modloader on a plugin, it crashed. We don't know why.

## What this repository and guide does not cover
- This does not cover most of our API
- This does not cover cores and libraries
