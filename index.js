#!/usr/bin/env node

var fs = require("fs");
var colors = require('colors');

var BASH_CONFIG_PATH = "/home/vasu/.bashrc";
var ZSH_CONFIG_PATH = "/home/vasu/.zshrc";

var AXI_CONFIG_FILE = ".axirc";
var AXI_CONFIG_PATH = "/home/vasu/" + AXI_CONFIG_FILE;

var AXI_SHELL_CONFIG_FILE = ".axishrc";
var AXI_SHELL_CONFIG = "/home/vasu/" + AXI_SHELL_CONFIG_FILE;

var PACKAGE_CONFIG = require('./package.json');

var serverConfig = "";


var currentConfig = JSON.parse(fs.readFileSync(AXI_CONFIG_PATH));
currentConfig.user = "root";
/**
 * Main Project Generator for Generating All Types of Projects in AxiCLI
 */

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

Utils.prototype.installConfig = function (configType, callback) {
	if (configType == "server" && serverConfig && serverConfig != "") {
		fs.exists(AXI_SHELL_CONFIG, function (exists) {
			if (exists) {
				fs.unlinkSync(AXI_SHELL_CONFIG);
			}

			fs.writeFileSync(AXI_SHELL_CONFIG, serverConfig);
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

var appendMissingConfigs = function (filePath) {
	Utils.log("Reading file ... " + filePath);
	var fileData = fs.readFileSync(filePath, "UTF-8");
	for (var i = configCli.length - 1; i >= 0; i--) {
		if (fileData.indexOf(configCli[i]) == -1) {
			fs.appendFileSync(filePath, configCli[i] + "\n");
		}
	};
};

Utils.prototype.updateShellConfig = function (configTypes, callback) {
	var configCli = [];

	for (var i = configTypes.length - 1; i >= 0; i--) {
		if (configTypes[i] == "server" && serverConfig && serverConfig != "") {
			configCli.push(". ~/" + AXI_SHELL_CONFIG_FILE);
		}
	}

	fs.exists(ZSH_CONFIG_PATH, function (exists) {
		if (exists) {
			appendMissingConfigs(ZSH_CONFIG_PATH);
			callback(false, {
				message: "Updated ZSH Config"
			});
		} else {
			fs.exists(BASH_CONFIG_PATH, function (exists) {
				if (exists) {
					appendMissingConfigs(BASH_CONFIG_PATH);
					callback(false, {
						message: "Updated Bash Config"
					});
				} else {
					callback(true, {
						message: "Can't Find Bash or ZSH Config File in ~ (home) directory"
					});
				}
			});
		}
	});
};


var Utils = new Utils();

var program = require('commander');

program
	.version(PACKAGE_CONFIG.version)
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

if (program.install) {
	if (program.install === "shell") {
		serverConfig = "";
		// Configure the Shell
		for (var i = currentConfig.servers.length - 1; i >= 0; i--) {
			ServerGen.InstallServer(currentConfig.servers[i]);
		}

		Utils.installConfig("server", function (err, result) {
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