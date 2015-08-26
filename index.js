#!/usr/bin/env node

var fs = require("fs");
var colors = require('colors');

var BashConfigPath = "/home/vasu/.bashrc";
var ZshConfigPath = "/home/vasu/.zshrc";

var AxiConfigPath = "/home/vasu/.axirc";
var ServerConfigPath = "/home/vasu/.axiserver";
var CommandConfig = require('./package.json');

var serverConfig = "";


var currentConfig = JSON.parse(fs.readFileSync(AxiConfigPath));
currentConfig.user = currentConfig.user || "root";
/**
 * Main Project Generator for Generating All Types of Projects in AxiCLI
 */
// function ProjectGen() {
// 	this.projectConfig = null;
// 	fs.writeFileSync(AxiConfig, "");
// };

// ProjectGen.prototype.GenerateBaseConfig = function (projectType) {

// 	var _generateIonicProject = function (isActonateSpecs) {
// 		if (isActonateSpecs) {

// 		}
// 	};

// 	var _generateActonateProject = function (existingConfig) {

// 		existingConfig.fileSpecs = {};

// 		existingConfig.fileSpecs.js = {};

// 		existingConfig.fileSpecs.js.fileOrder = [];
// 		existingConfig.fileSpecs.js.fileOrder.push("/**/*.config.js");
// 		existingConfig.fileSpecs.js.fileOrder.push("/**/*.directive.js");
// 		existingConfig.fileSpecs.js.fileOrder.push("/**/*.service.js");
// 		existingConfig.fileSpecs.js.fileOrder.push("/**/*.ctrl.js");
// 		existingConfig.fileSpecs.js.fileOrder.push("main.js");
// 		existingConfig.fileSpecs.js.fileOrder.push("filters.js");
// 		existingConfig.fileSpecs.js.fileOrder.push("services.js");
// 		existingConfig.fileSpecs.js.fileOrder.push("directives.js");

// 		return existingConfig;
// 	};

// 	var _generateDefaultProject = function () {
// 		var baseConfig = {};

// 		baseConfig.dependencies = {};
// 		baseConfig.dependencies.js = [];
// 		baseConfig.dependencies.css = [];

// 		baseConfig.directories = {};
// 		baseConfig.directories.developmentFolder = "dev";
// 		baseConfig.directories.applicationFolder = "www/app";
// 		baseConfig.directories.lessFolder = "dev/less";
// 		baseConfig.directories.libFolder = "dev/lib";

// 		return baseConfig;
// 	};

// 	switch (projectType) {
// 	case "actonate":
// 		this.projectConfig = _generateActonateProject(_generateDefaultProject());
// 		break;

// 	default:
// 		Utils.logInfo("Custom Project - Building Config ...");
// 		this.projectConfig = _generateDefaultProject();
// 		break;
// 	}
// };

// ProjectGen.prototype.InstallGruntTemplate = function () {
// 	var _gruntData = fs.readFileSync(GruntTemplatePath);
// 	fs.writeFileSync(GruntConfig, _gruntData);
// };

// ProjectGen.prototype.WriteAxiConfig = function () {
// 	fs.writeFileSync(AxiConfig, JSON.stringify(this.projectConfig, null, '\t'));
// };

// ProjectGen.prototype.BuildConfig = function (projectType) {
// 	this.GenerateBaseConfig(projectType);
// 	this.InstallGruntTemplate();
// 	this.WriteAxiConfig();
// 	if (projectType == "custom") {
// 		Utils.log("Please update .axirc file for custom directory structure for your project.");
// 	}
// };

/**
 * Server Gen
 *
 * @class
 */

var ServerGen = function () {};

ServerGen.InstallServer = function (serverObject) {
	var easySsh = function (serverObject) {
		serverConfig += "alias ssh-" + serverObject.name + "='ssh " + currentConfig.user + "@" + serverObject.ip + "'\n";
	};



	easySsh(serverObject);
};

var Utils = function () {

};

Utils.prototype.logError = function (message) {
	console.log("[AxiCLI] ".red + message.red);
};

Utils.prototype.log = function (message) {
	console.log("[AxiCLI] " + message);
};

Utils.prototype.logInfo = function (message) {
	console.log("[AxiCLI] ".blue + message.blue);
};

Utils.prototype.updateConfig = function (configType, callback) {
	if (configType == "server" && serverConfig && serverConfig != "") {
		fs.exists(ServerConfigPath, function (exists) {
			if (exists) {
				fs.unlinkSync(ServerConfigPath);
			}

			fs.writeFileSync(ServerConfigPath, serverConfig);
			callback(false, {
				message: "Updated AxiServer Config"
			});
		});
	} else {
		callback(true, {
			message: "Invalid Update Key"
		});
	}
};

Utils.prototype.updateShellConfig = function (configTypes, callback) {
	var configCli = [];

	var appendMissingConfigs = function (filePath) {
		Utils.log("Reading file ... " + filePath);
		var fileData = fs.readFileSync(filePath);
		for (var i = configCli.length - 1; i >= 0; i--) {
			if (fileData.indexOf(configCli[i]) == -1) {
				fs.appendFileSync(filePath, configCli[i] + "\n");
			}
		};
	};

	for (var i = configTypes.length - 1; i >= 0; i--) {
		if (configTypes[i] == "server" && serverConfig && serverConfig != "") {
			configCli.push(". ~/.axiserver");
		}
	}

	fs.exists(ZshConfigPath, function (exists) {
		if (exists) {
			appendMissingConfigs(ZshConfigPath);
			callback(false, {
				message: "Updated ZSH Config"
			});
		} else {
			fs.exists(BashConfigPath, function (exists) {
				if (exists) {
					appendMissingConfigs(BashConfigPath);
					callback(false, {
						message: "Updated Bash Config"
					});
				} else {
					callback(true, {
						message: "Can't Find Bash or ZSH Config File in ~"
					});
				}
			});
		}
	});
};


var Utils = new Utils();

var program = require('commander');

program
	.version(CommandConfig.version)
	.alias('axi')
	.option('install <installType>', 'Install AxiCLI Components', /^(shell)$/i)
	.option('update <updateType>', 'Update AxiCLI Components', /^(shell)$/i)
	.parse(process.argv);


// .option('init <projectType>', 'Build a Specific', /^(custom|ionic|angular|actonate-ionic|actonate-angular|actonate)$/i)
// .option('build', 'Build Your Project')
// .option('build-dep', 'Build Project Dependencies')
// .option('build-all', 'Build Everything')
// .option('dist', 'Get Your Project Ready for Deployment')
// .option('dist-dep', 'Get Project Dependencies Optimized')
// .option('dist-all', 'Optimize Everything')
// .option('dev', 'Development Watcher')
// .option('prod', 'Production Watcher')

// if (program.init) {
// 	Utils.logInfo("Starting New Project ...");
// 	var ProjectGen = new ProjectGen();
// 	ProjectGen.BuildConfig(program.init);
// }

if (program.install) {
	if (program.install === "shell") {
		serverConfig = "";
		// Configure the Shell
		for (var i = currentConfig.servers.length - 1; i >= 0; i--) {
			ServerGen.InstallServer(currentConfig.servers[i]);
		}

		Utils.updateConfig("server", function (err, result) {
			if (err) {
				Utils.logError(result.message);
			} else {
				Utils.logInfo(result.message);

				Utils.updateShellConfig(["server"], function (err, result) {
					if (err) {
						Utils.logError(result.message);
					} else {
						Utils.logInfo(result.message);
					}
				});
			}
		});
	}
}