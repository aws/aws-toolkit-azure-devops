// parse command line options
var minimist = require('minimist');
var mopts = {
    string: [
        'runner',
        'server',
        'suite',
        'task',
        'publisher',
        'configuration',
        'versionfield',
        'publishtoken',
        'overlayfolder'
    ],
    boolean: [
        'release',
        'dryrun'
    ]
};
var options = minimist(process.argv, mopts);

// otherwise each arg will be interpreted as a make target
process.argv = options._;

// modules
var make = require('shelljs/make');
var fs = require('fs');
var path = require('path');
var semver = require('semver');
var util = require('./make-util');

// util functions
var cd = util.cd;
var cp = util.cp;
var mkdir = util.mkdir;
var rm = util.rm;
var test = util.test;
var run = util.run;
var banner = util.banner;
var fail = util.fail;
var ensureExists = util.ensureExists;
var pathExists = util.pathExists;
var buildNodeTask = util.buildNodeTask;
var addPath = util.addPath;
var copyTaskResources = util.copyTaskResources;
var matchFind = util.matchFind;
var matchCopy = util.matchCopy;
var ensureTool = util.ensureTool;
var getExternals = util.getExternals;
var createResjson = util.createResjson;
var createTaskLocJson = util.createTaskLocJson;
var validateTask = util.validateTask;
var serializeToFile = util.serializeToFile;
var versionstampExtension = util.versionstampExtension;
var versionstampTask = util.versionstampTask;
var updateTaskRegionPickerOptions = util.updateTaskRegionPickerOptions;
var copyOverlayContent = util.copyOverlayContent;
var fetchLatestRegions = util.fetchLatestRegions;

// global path roots
var sourceRoot = __dirname;
var sourceTasksRoot = path.join(sourceRoot, 'Tasks');
var buildRoot = path.join(sourceRoot, '_build');
var buildTasksRoot = path.join(buildRoot, 'Tasks');
var commonBuildTasksRoot = path.join(buildTasksRoot, 'Common');
var buildTestsRoot = path.join(buildRoot, 'Tests');
var packageRoot = path.join(sourceRoot, '_package');
var packageTasksRoot = path.join(packageRoot, 'Tasks');

// global file names
var masterVersionFile = '_versioninfo.json';
var manifestFile = 'vss-extension.json';

// build stage names for content overlays
var prebuild = 'prebuild';
var postbuild = 'postbuild';

// validate arguments
if (options.overlayfolder && !pathExists(options.overlayfolder)) {
    fail(`Specified --overlayfolder not found: ${options.overlayfolder}`);
}

// node min version
var minNodeVer = '4.0.0';
if (semver.lt(process.versions.node, minNodeVer)) {
    fail('requires node >= ' + minNodeVer + '.  installed: ' + process.versions.node);
}

// add node modules .bin to the path so we can dictate version of tsc etc...
var binPath = path.join(sourceRoot, 'node_modules', '.bin');
if (!test('-d', binPath)) {
    fail('node modules bin not found.  ensure npm install has been run.');
}
addPath(binPath);

// resolve list of tasks
var taskList;
if (options.task) {
    // find using --task parameter
    taskList = matchFind(options.task, path.join(sourceRoot, 'Tasks'), { noRecurse: true, matchBase: true })
        .map(function (item) {
            return path.basename(item);
        });
    if (!taskList.length) {
        fail('Unable to find any tasks matching pattern ' + options.task);
    }
}
else {
    // load the default list
    taskList = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'make-options.json'))).tasks;
}

target.clean = function () {
    if (pathExists(buildRoot)) {
       rm('-Rf', buildRoot);
    }
    if (pathExists(packageRoot)) {
        rm('-Rf', packageRoot);
    }
};

// Updates the root _versionInfo.json file, incrementing specific version components
// for the extension, and then stamps the new version through the source tree into
// the task manifests and respective package.json files
// Options to specify the version field to update:
//     --versionfield major - increments the major version, sets minor and patch to 0
//     --versionfield minor - increments the minor version, sets patch to 0
//     --versionfield patch - increments the patch version only (this is the default
//                            behavior if --versionfield is not specified)
//
target.updateversioninfo = function() {

    var updateMajor = false;
    var updateMinor = false;
    if (options.versionfield) {
        switch (options.versionfield) {
            case 'patch': {
                banner('> Updating patch version only');
            }
            break;

            case 'minor': {
                banner('> Updating minor version data, patch level reset to 0');
                updateMinor = true;
            }
            break;

            case 'major': {
                banner('> Updating major version data, minor and patch levels forced to 0');
                updateMajor = true;
            }
            break;

            default:
                throw new Error('Unknown version update option - ' + options.versionfield + ', expected "major", "minor" or "patch"');
        }
    }

    var versionInfoFile = path.join(sourceRoot, masterVersionFile);
    var versionInfo = JSON.parse(fs.readFileSync(versionInfoFile));
    banner(`> ${masterVersionFile} previous version: ${versionInfo.Major}.${versionInfo.Minor}.${versionInfo.Patch}`)
    if (updateMajor) {
        versionInfo.Major = (parseInt(versionInfo.Major) + 1).toString();
        versionInfo.Minor = '0';
        versionInfo.Patch = '0';
    } else if (updateMinor) {
        versionInfo.Minor = (parseInt(versionInfo.Minor) + 1).toString();
        versionInfo.Patch = '0';
    } else {
        versionInfo.Patch = (parseInt(versionInfo.Patch) + 1).toString();
    }
    banner(`> ${masterVersionFile} new version: ${versionInfo.Major}.${versionInfo.Minor}.${versionInfo.Patch}`)
    serializeToFile(versionInfo, versionInfoFile);

    // flow the version change through the source tree; this ensures new version
    // data is picked up when new task.loc.json files are created and avoids the
    // issue described in https://github.com/aws/aws-vsts-tools/issues/117.
    banner('> Updating source tree with new version data');

    versionstampExtension(path.join(sourceRoot, manifestFile), versionInfo);

    taskList.forEach(function(taskName) {
        var taskPath = path.join(sourceTasksRoot, taskName);
        ensureExists(taskPath);

        versionstampTask(taskPath, versionInfo);
    });
}

target.updateregioninfo = function() {
    banner('Updating options for task region pickers from latest endpoint data');

    // if an error occurs retrieving the data we leave the current task options
    // unchanged
    try {
        var awsRegions = fetchLatestRegions();
        taskList.forEach(function(taskName) {
            var taskPath = path.join(sourceTasksRoot, taskName);
            ensureExists(taskPath);

            updateTaskRegionPickerOptions(path.join(taskPath, 'task.json'), awsRegions);
        });
    } catch (err) {
        throw new Error(`Error downloading endpoints, update skipped: ${err}`);
    }
}

// Builds the extension into a _build folder. If the --release switch is specified
// the build is generated for production release (no map files, npm modules set to
// production only)
target.build = function() {
    banner('Building extension for ' + (options.release ? 'release' : 'development'));

    target.clean();

    ensureTool('npm', '--version', function (output) {
        if (semver.lt(output, '3.0.0')) {
            fail('expected 3.0.0 or higher');
        }
    });

    copyOverlayContent(options.overlayfolder, prebuild, buildRoot);

    taskList.forEach(function(taskName) {
        banner('> Building: ' + taskName);
        var taskPath = path.join(sourceTasksRoot, taskName);
        ensureExists(taskPath);

        // load the task.json
        var outDir;
        var shouldBuildNode = test('-f', path.join(taskPath, 'tsconfig.json'));
        var taskJsonPath = path.join(taskPath, 'task.json');
        if (test('-f', taskJsonPath)) {
            var taskDef = require(taskJsonPath);
            validateTask(taskDef);

            // fixup the outDir
            outDir = path.join(buildTasksRoot, taskDef.name);

            // create loc files
            createTaskLocJson(taskPath);
            createResjson(taskDef, taskPath);

            // determine the type of task
            shouldBuildNode = shouldBuildNode || taskDef.execution.hasOwnProperty('Node');
        }
        else {
            outDir = path.join(buildTasksRoot, path.basename(taskPath));
        }

        mkdir('-p', outDir);

        // get externals
        var taskMakePath = path.join(taskPath, 'make.json');
        var taskMake = test('-f', taskMakePath) ? require(taskMakePath) : {};
        if (taskMake.hasOwnProperty('externals')) {
            console.log('Getting task externals');
            getExternals(taskMake.externals, outDir);
        }

        //--------------------------------
        // Common: build, copy, install
        //--------------------------------
        if (taskMake.hasOwnProperty('common')) {
            var common = taskMake['common'];

            common.forEach(function(mod) {
                var modPath = path.join(taskPath, mod['module']);
                var modName = path.basename(modPath);
                var modOutDir = path.join(commonBuildTasksRoot, modName);

                if (!test('-d', modOutDir)) {
                    banner('Building module ' + modPath, true);

                    mkdir('-p', modOutDir);

                    // create loc files
                    var modJsonPath = path.join(modPath, 'module.json');
                    if (test('-f', modJsonPath)) {
                        createResjson(require(modJsonPath), modPath);
                    }

                    // npm install and compile
                    if ((mod.type === 'node' && mod.compile == true) || test('-f', path.join(modPath, 'tsconfig.json'))) {
                        buildNodeTask(modPath, modOutDir);
                    }

                    // copy default resources and any additional resources defined in the module's make.json
                    console.log();
                    console.log('> copying module resources');
                    var modMakePath = path.join(modPath, 'make.json');
                    var modMake = test('-f', modMakePath) ? require(modMakePath) : {};
                    copyTaskResources(modMake, modPath, modOutDir);

                    // get externals
                    if (modMake.hasOwnProperty('externals')) {
                        console.log('Getting module externals');
                        getExternals(modMake.externals, modOutDir);
                    }
                }

                // npm install the common module to the task dir
                if (mod.type === 'node' && mod.compile == true) {
                    mkdir('-p', path.join(taskPath, 'node_modules'));
                    rm('-Rf', path.join(taskPath, 'node_modules', modName));
                    var originalDir = pwd();
                    cd(taskPath);
                    run('npm install ' + modOutDir);
                    cd(originalDir);
                }
                // copy module resources to the task output dir
                else if (mod.type === 'ps') {
                    console.log();
                    console.log('> copying module resources to task');
                    var dest;
                    if (mod.hasOwnProperty('dest')) {
                        dest = path.join(outDir, mod.dest, modName);
                    }
                    else {
                        dest = path.join(outDir, 'ps_modules', modName);
                    }

                    matchCopy('!Tests', modOutDir, dest, { noRecurse: true, matchBase: true });
                }
            });
        }

        // build Node task
        if (shouldBuildNode) {
            buildNodeTask(taskPath, outDir, options.release);
        } else {
            matchCopy('**', taskPath, outDir);
        }

        // copy default resources and any additional resources defined in the task's make.json
        console.log();
        console.log('> copying task resources');
        copyTaskResources(taskMake, taskPath, outDir);
    });

    copyOverlayContent(options.overlayfolder, postbuild, buildRoot);

    banner('Build successful', true);
}

// Re-packages the build into a _package folder, then runs the tfx
// CLI to create the deployment vsix file. The tasks are passed through
// webpack to shrink and simplify the distribution.
target.package = function() {
    banner('Packaging extension');

    mkdir('-p', packageRoot);

    // stage license, readme and the extension manifest file
    var packageRootFiles =  [ manifestFile, 'LICENSE', 'README.md' ];
    packageRootFiles.forEach(function(item) {
        cp(path.join(sourceRoot, item), packageRoot);
    });

    // stage manifest images
    cp('-R', path.join(sourceRoot, 'images'), packageRoot);

    mkdir('-p', packageTasksRoot);

    copyOverlayContent(options.overlayfolder, prebuild, buildRoot);

    // clean, dedupe and pack each task as needed
    taskList.forEach(function(taskName) {
        console.log('> processing task ' + taskName);

        var taskBuildFolder = path.join(buildTasksRoot, taskName);
        var taskPackageFolder = path.join(packageTasksRoot, taskName);
        mkdir('-p', taskPackageFolder);

        var taskDef = require(path.join(taskBuildFolder, 'task.json'));
        if (taskDef.execution.hasOwnProperty('Node')) {
            cd(taskBuildFolder);

            cp(path.join(taskBuildFolder, '*.json'), taskPackageFolder);
            cp(path.join(taskBuildFolder, '*.png'), taskPackageFolder);
            cp('-R', path.join(taskBuildFolder, 'Strings'), taskPackageFolder);

            console.log('> packing node-based task');
            var webpackConfig = path.join(sourceRoot, 'webpack.config.js');
            var webpackCmd = 'webpack --config '
                                + webpackConfig
                                + ' '
                                + taskName + '.js '
                                + path.join(taskPackageFolder, taskName + '.js');
            run(webpackCmd);

            // safely re-populate the unpacked vsts-task-lib
            cd(taskPackageFolder);
            var cmd = 'npm install vsts-task-lib' + (options.release ? ' --only=production' : '');
            run(cmd);

            cd(sourceRoot); // go back to consistent start location
        } else {
            console.log('> copying non-node task');

            matchCopy('**', taskBuildFolder, taskPackageFolder);
        }
    });

    copyOverlayContent(options.overlayfolder, postbuild, packageRoot);

    console.log('> creating deployment vsix');
    var tfxcmd = 'tfx extension create --root ' + packageRoot + ' --output-path ' + packageRoot + ' --manifests ' + path.join(packageRoot, manifestFile);
    if (options.publisher)
        tfxcmd += ' --publisher ' + options.publisher;

    run(tfxcmd);

    banner('Packaging successful', true);
}

// used by CI that does official publish
target.publish = function() {
    banner('Publishing extension');

    if (!options.publishtoken) {
        fail('Missing --publishtoken switch');
    }

    if (!options.publisher) {
        fail('Missing --publisher, needed to select vsix to upload');
    }

    var vsixNamePattern = options.publisher + '.aws-vsts-tools-*.vsix';
    var packages = matchFind(vsixNamePattern, packageRoot, { noRecurse: true, matchBase: true });
    if (packages.length === 0){
        fail(`Failed to find a vsix to publish using name pattern ${vsixNamePattern}`);
    } else if (packages.length > 1) {
        fail(`Found ${packages.length} vsix files in ${packageRoot} folder, only expected one!`);
    }

    var vsixPackage = packages[0];
    var tfxcmd = 'tfx extension publish --vsix ' + vsixPackage + ' --token ' + options.publishtoken;
    console.log(`> Publishing: ${tfxcmd}`);

    if (options.dryrun) {
        console.log('> !! --dryrun option specified, the command was not run and package not published');
    } else {
        console.log('> !! executing command to publish to the marketplace')
        run(tfxcmd);
    }

    banner('Publish target completed', true);
}
