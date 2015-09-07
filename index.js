#!/usr/bin/env node

var fs = require("fs");
var colors = require('colors');
var request = require('request');
var prompt = require('prompt');
var program = require('commander');

prompt.start();

var HOME_DIR;
var BASH_CONFIG_PATH;
var ZSH_CONFIG_PATH;
var AXI_BASE_FILE;
var AXI_BASE_PATH;
var AXI_CONFIG_FILE;
var AXI_CONFIG_PATH;
var AXI_SHELL_CONFIG_FILE;
var AXI_SHELL_CONFIG;

var DIRECTORY_SEP = process.platform == "win32" ? "\\" : "/";

var PACKAGE_CONFIG = require('./package.json');

var serverConfig = "";
var currentConfig = {};

var ServerGenInstance;
var UtilsInstance;
var CliInstance;

/**
 * Main Project Generator for Generating All Types of Projects in AxiCLI
 */

var appendMissingConfigs = function (filePath, configCli) {
	UtilsInstance.log("Reading file ... " + filePath);
	var fileData = fs.readFileSync(filePath, "UTF-8");
	for (var i = configCli.length - 1; i >= 0; i--) {
		if (fileData.indexOf(configCli[i]) == -1) {
			fs.appendFileSync(filePath, configCli[i] + "\n");
		}
	};
};

var initVariables = function (homeDir) {
	HOME_DIR = homeDir + DIRECTORY_SEP;

	BASH_CONFIG_PATH = HOME_DIR + ".bashrc";
	ZSH_CONFIG_PATH = HOME_DIR + ".zshrc";

	AXI_BASE_FILE = ".axibase";
	AXI_BASE_PATH = HOME_DIR + AXI_BASE_FILE;

	AXI_CONFIG_FILE = ".axirc";
	AXI_CONFIG_PATH = HOME_DIR + AXI_CONFIG_FILE;

	AXI_SHELL_CONFIG_FILE = ".axishrc";
	AXI_SHELL_CONFIG = HOME_DIR + AXI_SHELL_CONFIG_FILE;
};

var getUserHome = function () {
	return process.env['HOME'];
}

/**
 * Server Gen
 *
 * @class
 */
var ServerGen = function () {
	var _installServer = function (serverObject) {
		var easySsh = function (serverObject) {
			serverConfig += "alias ssh-" + serverObject.name + "='ssh " + currentConfig.user + "@" + serverObject.ip + "'\n";
			serverConfig += "alias ssh-root-" + serverObject.name + "='ssh root@" + serverObject.ip + "'\n";
		};

		easySsh(serverObject);
	};

	return {
		installServer: _installServer
	};
};



ServerGenInstance = ServerGen();

var Utils = function () {

	var _logError = function (message) {
		console.log("[AxiCLI] ".red + message.red);
	};

	var _log = function (message) {
		console.log("[AxiCLI] " + message);
	};

	var _logInfo = function (message) {
		console.log("[AxiCLI] ".blue + message.blue);
	};

	var _installConfig = function (configType, callback) {
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

	var _updateShellConfig = function (configTypes, callback) {
		var configCli = [];

		for (var i = configTypes.length - 1; i >= 0; i--) {
			if (configTypes[i] == "server" && serverConfig && serverConfig != "") {
				configCli.push(". ~/" + AXI_SHELL_CONFIG_FILE);
			}
		}

		fs.exists(ZSH_CONFIG_PATH, function (exists) {
			if (exists) {
				appendMissingConfigs(ZSH_CONFIG_PATH, configCli);
				callback(false, {
					message: "Updated ZSH Config"
				});
			} else {
				fs.exists(BASH_CONFIG_PATH, function (exists) {
					if (exists) {
						appendMissingConfigs(BASH_CONFIG_PATH, configCli);
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

	var _setupCli = function (newConfigData, callback) {
		var configCli = [];
		request.get({
			url: newConfigData.cdn,
			json: true
		}, function (err, httpResponse, body) {
			if (err) {
				callback(true, {
					message: "Unable to get DB Name from Server : " + newConfigData.cdn + " Please check your CDN",
					error: err
				});

				return;

			}

			fs.writeFileSync(AXI_CONFIG_PATH, JSON.stringify(body.axirc));
			callback(false, {
				message: "Updated Base Config"
			});
		});
	};

	return {
		logError: _logError,
		log: _log,
		logInfo: _logInfo,
		installConfig: _installConfig,
		updateShellConfig: _updateShellConfig,
		setupCli: _setupCli
	};

};

UtilsInstance = Utils();

var Cli = function () {

	var _install = function (callback) {
		var baseConfig = JSON.parse(fs.readFileSync(AXI_BASE_PATH, "UTF-8"));
		currentConfig = JSON.parse(fs.readFileSync(AXI_CONFIG_PATH, "UTF-8"));
		currentConfig.user = baseConfig.ssh_username || "root";

		serverConfig = "";
		// Configure the Shell
		for (var i = currentConfig.servers.length - 1; i >= 0; i--) {
			ServerGenInstance.installServer(currentConfig.servers[i]);
		}

		UtilsInstance.installConfig("server", function (err, result) {
			if (err) {
				UtilsInstance.logError(result.message);
				callback(true, {
					message: "Unable to Install CLI"
				});
			} else {
				UtilsInstance.logInfo(result.message);
				UtilsInstance.updateShellConfig(["server"], function (err, result) {
					if (err) {
						UtilsInstance.logError(result.message);
					} else {
						UtilsInstance.logInfo(result.message);
					}

					callback(false, {
						message: "Installed CLI Successfully"
					});
				});
			}
		});
	};

	var _update = function (callback) {
		var self = this;

		var baseConfig = JSON.parse(fs.readFileSync(AXI_BASE_PATH, "UTF-8"));

		setupData.cdn = baseConfig.cdn;
		setupData.ssh_username = baseConfig.ssh_username;

		UtilsInstance.setupCli(setupData, function (err, result) {
			if (err) {
				UtilsInstance.logError(result.message);
				callback(true, {
					message: "Unable to Install CLI"
				});
			} else {
				UtilsInstance.logInfo(result.message);
				_install(callback);
			}
		});
	};

	var _setup = function (callback) {
		var self = this;
		var setupData = {};
		var schema = {
			properties: {
				cdn: {
					pattern: /^[a-zA-Z\s\-]+$/,
					message: 'Name must be only letters, spaces, or dashes',
					required: true
				},
				ssh_username: {
					required: true
				}
			}
		};

		prompt.get(['cdn', 'ssh_username'], function (err, result) {
			setupData.cdn = result.cdn;
			setupData.ssh_username = result.ssh_username;
			
			fs.writeFileSync(AXI_BASE_PATH, JSON.stringify(setupData, null, 2));

			UtilsInstance.setupCli(setupData, function (err, result) {
				if (err) {
					UtilsInstance.logError(result.message);
					callback(true, {
						message: "Unable to Install CLI"
					});
				} else {
					UtilsInstance.logInfo(result.message);
					_install(callback);
				}
			});
		});
	};

	return {
		setup: _setup,
		install: _install
	};
};

CliInstance = Cli();


program
	.version(PACKAGE_CONFIG.version)
	.alias('axi')
	.option('setup', 'Setup AxiCLI')
	.option('install <installType>', 'Install AxiCLI Components', /^(shell)$/i)
	.option('update <updateType>', 'Update AxiCLI Components', /^(shell)$/i)
	.parse(process.argv);

initVariables(getUserHome());
if (program.setup) {
	CliInstance.setup(function (err, result) {
		process.exit(0);
	});
}

if (program.install) {
	if (program.install === "shell") {
		CliInstance.install(function (err, result) {
			process.exit(0);
		});
	}
}

if (program.update) {
	if (program.update === "shell") {
		CliInstance.update(function (err, result) {
			process.exit(0);
		});
	}
}