// parse command line options
var minimist = require('minimist');
var mopts = {
    string: [
        'runner',
        'server',
        'suite',
        'task',
        'version',
        'publisher',
        'configuration'
    ],
    boolean: [
        'release'
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

//
// ex: node make.js build
// ex: node make.js build --task ShellScript
//
target.build = function() {
    banner('Building extension for ' + (options.release ? 'release' : 'development'));

    target.clean();

    ensureTool('npm', '--version', function (output) {
        if (semver.lt(output, '3.0.0')) {
            fail('expected 3.0.0 or higher');
        }
    });

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
        }

        // copy default resources and any additional resources defined in the task's make.json
        console.log();
        console.log('> copying task resources');
        copyTaskResources(taskMake, taskPath, outDir);

    });

    banner('Build successful', true);
}

//
// Runs tests for the scope of tasks being built
// if a root-level Tests folder exists.
// npm test
// node make.js test
// node make.js test --task ShellScript --suite L0
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
    var manifestFile = 'vss-extension.json';
    var packageRootFiles =  [ manifestFile, 'LICENSE', 'README.md' ];
    packageRootFiles.forEach(function(item) {
        cp(path.join(__dirname, item), packageRoot);
    });

    var tasksPackageFolder = path.join(packageRoot, 'Tasks');
    var imagesPackageFolder = path.join(packageRoot, 'images');

    // stage manifest images
    cp('-R', path.join(__dirname, 'images'), packageRoot);

    mkdir(packageTasksRoot);

    // clean, dedupe and pack each task
    taskList.forEach(function(taskName) {
        console.log('> processing task ' + taskName);

        var taskBuildFolder = path.join(buildTasksRoot, taskName);
        var taskPackageFolder = path.join(packageTasksRoot, taskName);

        mkdir(taskPackageFolder);

        cp(path.join(taskBuildFolder, '*.json'), taskPackageFolder);
        cp(path.join(taskBuildFolder, '*.png'), taskPackageFolder);
        cp('-R', path.join(taskBuildFolder, 'Strings'), taskPackageFolder);

        cd(taskBuildFolder);

        console.log('> packing task');
        var webpackConfig = path.join(__dirname, 'webpack.config.js');
        var webpackCmd = 'webpack --config ' + webpackConfig + ' ' + taskName + '.js ' + path.join(taskPackageFolder, taskName + '.js');
        run(webpackCmd);

        // safely re-populate the unpacked vsts-task-lib
        cd(taskPackageFolder);
        var cmd = 'npm install vsts-task-lib' + (options.release ? ' --only=production' : '');
        run(cmd);

        cd(__dirname);
    });

    // build the vsix package from the staged materials
    console.log('> creating deployment vsix');
    var tfxcmd = 'tfx extension create --root ' + packageRoot + ' --output-path ' + packageRoot + ' --manifests ' + path.join(packageRoot, manifestFile);
    if (options.publisher)
        tfxcmd += ' --publisher ' + options.publisher;

    run(tfxcmd);

    banner('Packaging successful', true);
}

// used to bump the patch version in task.json files
target.bump = function() {
    taskList.forEach(function (taskName) {
        var taskJsonPath = path.join(__dirname, 'Tasks', taskName, 'task.json');
        var taskJson = JSON.parse(fs.readFileSync(taskJsonPath));
        if (typeof taskJson.version.Patch != 'number') {
            fail(`Error processing '${taskName}'. version.Patch should be a number.`);
        }

        taskJson.version.Patch = taskJson.version.Patch + 1;
        fs.writeFileSync(taskJsonPath, JSON.stringify(taskJson, null, 4));
    });
}
