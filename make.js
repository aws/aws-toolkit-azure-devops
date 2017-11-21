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
        'stamptasks',
        'dryrun'
    ]
};
var options = minimist(process.argv, mopts);

// remove well-known parameters from argv before loading make,
// otherwise each arg will be interpreted as a make target
process.argv = options._;

// modules
var make = require('shelljs/make');
var fs = require('fs');
var os = require('os');
var path = require('path');
var semver = require('semver');
var util = require('./make-util');
var filenormalize = require('file-normalize');

// util functions
var cd = util.cd;
var cp = util.cp;
var mkdir = util.mkdir;
var rm = util.rm;
var test = util.test;
var run = util.run;
var banner = util.banner;
var rp = util.rp;
var fail = util.fail;
var ensureExists = util.ensureExists;
var pathExists = util.pathExists;
var buildNodeTask = util.buildNodeTask;
var addPath = util.addPath;
var copyTaskResources = util.copyTaskResources;
var matchFind = util.matchFind;
var matchCopy = util.matchCopy;
var ensureTool = util.ensureTool;
var assert = util.assert;
var getExternals = util.getExternals;
var createResjson = util.createResjson;
var createTaskLocJson = util.createTaskLocJson;
var validateTask = util.validateTask;

// global path roots
var sourceTasksRoot = path.join(__dirname, 'Tasks');
var buildRoot = path.join(__dirname, '_build');
var buildTasksRoot = path.join(buildRoot, 'Tasks');
var commonBuildTasksRoot = path.join(buildTasksRoot, 'Common');
var buildTestsRoot = path.join(buildRoot, 'Tests');
var packageRoot = path.join(__dirname, '_package');
var packageTasksRoot = path.join(packageRoot, 'Tasks');
var internalContentRoot = '../aws-vsts-tools-internal';

// global file names
var masterVersionFile = '_versioninfo.json';
var manifestFile = 'vss-extension.json';

// node min version
var minNodeVer = '4.0.0';
if (semver.lt(process.versions.node, minNodeVer)) {
    fail('requires node >= ' + minNodeVer + '.  installed: ' + process.versions.node);
}

// add node modules .bin to the path so we can dictate version of tsc etc...
var binPath = path.join(__dirname, 'node_modules', '.bin');
if (!test('-d', binPath)) {
    fail('node modules bin not found.  ensure npm install has been run.');
}
addPath(binPath);

// resolve list of tasks
var taskList;
if (options.task) {
    // find using --task parameter
    taskList = matchFind(options.task, path.join(__dirname, 'Tasks'), { noRecurse: true, matchBase: true })
        .map(function (item) {
            return path.basename(item);
        });
    if (!taskList.length) {
        fail('Unable to find any tasks matching pattern ' + options.task);
    }
}
else {
    // load the default list
    taskList = JSON.parse(fs.readFileSync(path.join(__dirname, 'make-options.json'))).tasks;
}

// set the runner options. should either be empty or a comma delimited list of test runners.
// for example: ts OR ts,ps
//
// note, currently the ts runner igores this setting and will always run.
process.env['TASK_TEST_RUNNER'] = options.runner || '';

target.clean = function () {
    if (pathExists(buildRoot)) {
       rm('-Rf', buildRoot);
    }
    if (pathExists(packageRoot)) {
        rm('-Rf', packageRoot);
    }
};

// Updates the root _versionInfo.json file, incrementing specific version components
// for the extension. As the extension and tasks build, the data contained in this
// master version file are stamped into the various manifests.
// Options to specify the version field to update:
//     --versionfield major - increments the major version, sets minor and patch to 0
//     --versionfield minor - increments the minor version, sets patch to 0
//     --versionfield patch - increments the patch version only (this is the default
//                            behavior if --versionfield is not specified)
//
target.updateversion = function() {

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

    var versionInfoFile = path.join(__dirname, masterVersionFile);
    var versionInfo = JSON.parse(fs.readFileSync(versionInfoFile));
    console.log(`> ${masterVersionFile} previous version: ${versionInfo.Major}.${versionInfo.Minor}.${versionInfo.Patch}`)
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
    console.log(`> ${masterVersionFile} new version: ${versionInfo.Major}.${versionInfo.Minor}.${versionInfo.Patch}`)
    serializeToFile(versionInfo, versionInfoFile);

    // if option set, stamps the version into the extension and task
    // manifests (this saves having to do a build to update versions
    // in the source repo)
    if (options.stamptasks) {
        versionstampExtension(manifestFile, versionInfo);
        taskList.forEach(function(taskName) {
            versionstampTask(taskName, versionInfo);
        });
    }
}

// Updates the vss-extension manifest version based on data contained in the root
// _versioninfo.json control file.
function versionstampExtension(extensionManifest, versionInfo) {
    console.log(`> Updating version data for extension from master version file ${masterVersionFile}`);

    var extensionManifestPath = path.join(__dirname, extensionManifest);
    var oldContent = fs.readFileSync(extensionManifestPath);
    var extensionJson = JSON.parse(oldContent);
    extensionJson.version = versionInfo.Major + '.' + versionInfo.Minor + '.' + versionInfo.Patch;
    console.log(`> ...extension manifest updated to version ${extensionJson.version}`);
    serializeToFile(extensionJson, extensionManifestPath);

    var packageJsonPath = path.join(__dirname, 'package.json');
    updatePackageJsonVersion(packageJsonPath, versionInfo);
}

// Updates the task manifest and related package.json file based on data contained
// in the root _versioninfo.json control file.
function versionstampTask(taskName, versionInfo) {
    console.log(`> Updating version data for task ${taskName} from master version file ${masterVersionFile}`)

    var taskManifestPath = path.join(__dirname, 'Tasks', taskName, 'task.json');
    var oldContent = fs.readFileSync(taskManifestPath);
    var taskManifest = JSON.parse(oldContent);
    taskManifest.version.Major = versionInfo.Major;
    taskManifest.version.Minor = versionInfo.Minor;
    taskManifest.version.Patch = versionInfo.Patch;
    console.log(`> ...stamped version ${taskManifest.version.Major}.${taskManifest.version.Minor}.${taskManifest.version.Patch} into task manifest`);
    serializeToFile(taskManifest, taskManifestPath);

    var packageJsonPath = path.join(__dirname, 'Tasks', taskName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        updatePackageJsonVersion(packageJsonPath, versionInfo);
    }
}

// Update version info in the specified package.json file
function updatePackageJsonVersion(packageJsonPath, versionInfo) {
    var oldContent = fs.readFileSync(packageJsonPath);
    var packageJson = JSON.parse(oldContent);
    packageJson.version = versionInfo.Major + '.' + versionInfo.Minor + '.' + versionInfo.Patch;
    console.log(`> ...stamped version ${packageJson.version} into package.json`);
    serializeToFile(packageJson, packageJsonPath);
}

// Common handler to serialize json manifests to file, ensuring we get normalized
// line terminators and blank line at end of file.
function serializeToFile(jsonObj, filePath) {
    var content = filenormalize.normalizeEOL(JSON.stringify(jsonObj, null, 4) + '\n');
    fs.writeFileSync(filePath, content);
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

    // load the master version info ready for stamping into the extension
    // and task manifests
    var versionInfoFile = path.join(__dirname, '_versioninfo.json');
    var versionInfo = JSON.parse(fs.readFileSync(versionInfoFile));

    // stamp the master version into the extension manifest
    versionstampExtension(manifestFile, versionInfo);

    // build time option to overlay content from sibling repo - for logos etc
    if (options.overlayfolder && pathExists(internalContentRoot)) {
        var overlayRoot = path.join(internalContentRoot, options.overlayfolder);
        console.log(`> Overlaying content from ${overlayRoot}`);
        matchCopy(path.join('**', '*'), overlayRoot, '.', { noRecurse: false,  matchBase: false });
    }

    taskList.forEach(function(taskName) {
        banner('> Building: ' + taskName);
        var taskPath = path.join(sourceTasksRoot, taskName);
        ensureExists(taskPath);

        // stamp the master version into the task manifest and package.json files
        versionstampTask(taskName, versionInfo);

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

    banner('Build successful', true);
}

// NOTE: testing via Mocha or some other suitable framework will be added
// in a future release. This target is retained as reference in preparation
// for that work.
//
// Runs tests for the scope of tasks being built if a root-level Tests folder
// exists.
// npm test
// node make.js test
// node make.js test --task taskName --suite L0
target.test = function() {
    var testsPath = path.join(__dirname, 'Tests');
    if (!pathExists(testsPath))
    {
        console.log('> !! no tests found at project root, skipping "test" target');
        return;
    }

    ensureTool('tsc', '--version', 'Version 2.3.4');
    ensureTool('mocha', '--version', '2.3.3');

    // build the general tests and ps test infra
    rm('-Rf', buildTestsRoot);
    mkdir('-p', path.join(buildTestsRoot));
    cd(testsPath);
    run(`tsc --rootDir ${path.join(__dirname, 'Tests')} --outDir ${buildTestsRoot}`);
    console.log();
    console.log('> copying ps test lib resources');
    mkdir('-p', path.join(buildTestsRoot, 'lib'));
    matchCopy(path.join('**', '@(*.ps1|*.psm1)'), path.join(__dirname, 'Tests', 'lib'), path.join(buildTestsRoot, 'lib'));

    // find the tests
    var suiteType = options.suite || 'L0';
    var taskType = options.task || '*';
    var pattern1 = buildTasksRoot + '/' + taskType + '/Tests/' + suiteType + '.js';
    var pattern2 = buildTasksRoot + '/Common/' + taskType + '/Tests/' + suiteType + '.js';
    var pattern3 = buildTestsRoot + '/' + suiteType + '.js';
    var testsSpec = matchFind(pattern1, buildRoot)
        .concat(matchFind(pattern2, buildRoot))
        .concat(matchFind(pattern3, buildTestsRoot, { noRecurse: true }));
    if (!testsSpec.length && !process.env.TF_BUILD) {
        fail(`Unable to find tests using the following patterns: ${JSON.stringify([pattern1, pattern2, pattern3])}`);
    }

    run('mocha ' + testsSpec.join(' '), /*inheritStreams:*/true);
}

// Re-packages the build into a _package folder, then runs the tfx
// CLI to create the deployment vsix file. The tasks are passed through
// webpack to shrink and simplify the distribution.
target.package = function() {
    banner('Packaging extension');

    mkdir(packageRoot);

    // stage license, readme and the extension manifest file
    var packageRootFiles =  [ manifestFile, 'LICENSE', 'README.md' ];
    packageRootFiles.forEach(function(item) {
        cp(path.join(__dirname, item), packageRoot);
    });

    var tasksPackageFolder = path.join(packageRoot, 'Tasks');
    var imagesPackageFolder = path.join(packageRoot, 'images');

    // stage manifest images
    cp('-R', path.join(__dirname, 'images'), packageRoot);

    mkdir(packageTasksRoot);

    // clean, dedupe and pack each task as needed
    taskList.forEach(function(taskName) {
        console.log('> processing task ' + taskName);

        var taskBuildFolder = path.join(buildTasksRoot, taskName);
        var taskPackageFolder = path.join(packageTasksRoot, taskName);
        mkdir(taskPackageFolder);

        var taskDef = require(path.join(taskBuildFolder, 'task.json'));
        if (taskDef.execution.hasOwnProperty('Node')) {
            cd(taskBuildFolder);

            cp(path.join(taskBuildFolder, '*.json'), taskPackageFolder);
            cp(path.join(taskBuildFolder, '*.png'), taskPackageFolder);
            cp('-R', path.join(taskBuildFolder, 'Strings'), taskPackageFolder);

            console.log('> packing node-based task');
            var webpackConfig = path.join(__dirname, 'webpack.config.js');
            var webpackCmd = 'webpack --config ' + webpackConfig + ' ' + taskName + '.js ' + path.join(taskPackageFolder, taskName + '.js');
            run(webpackCmd);

            // safely re-populate the unpacked vsts-task-lib
            cd(taskPackageFolder);
            var cmd = 'npm install vsts-task-lib' + (options.release ? ' --only=production' : '');
            run(cmd);

            cd(__dirname);
        } else {
            console.log('> copying non-node task');

            matchCopy('**', taskBuildFolder, taskPackageFolder);
        }
    });

    // build the vsix package from the staged materials
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
