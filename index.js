#!/usr/bin/env node

var fs = require("fs");
var colors = require('colors');
var request = require('request');
var prompt = require('prompt');
var program = require('commander');
var exec = require('child_process').exec;

prompt.start();

var AXI_CLI_FOLDER = ".axicli/";
var HOME_DIR;
var BASH_CONFIG_PATH;
var ZSH_CONFIG_PATH;
var AXI_BASE_FILE;
var AXI_BASE_PATH;
var AXI_CONFIG_FILE;
var AXI_CONFIG_PATH;
var AXI_SHELL_CONFIG_FILE;
var AXI_SHELL_CONFIG;

var AXI_SHELL_TEMPLATE = __dirname + "/src/.axibase-template";

var CDN_CONFIG_FILE = "config.json";


var DIRECTORY_SEP = process.platform == "win32" ? "\\" : "/";

var PACKAGE_CONFIG = require('./package.json');

var serverConfig = "";
var currentConfig = false;
var baseConfig = false;

var serverGenInstance;
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
	AXI_BASE_PATH = HOME_DIR + AXI_CLI_FOLDER + AXI_BASE_FILE;

	AXI_CONFIG_FILE = ".axirc";
	AXI_CONFIG_PATH = HOME_DIR + AXI_CLI_FOLDER + AXI_CONFIG_FILE;

	AXI_SHELL_CONFIG_FILE = ".axishrc";
	AXI_SHELL_CONFIG = HOME_DIR + AXI_CLI_FOLDER + AXI_SHELL_CONFIG_FILE;
};

var getUserHome = function () {
	return process.env['HOME'];
}

var getCurrentShell = function () {
	return process.env.SHELL;
}

var isShellBash = function () {
	if (getCurrentShell().indexOf("bash") !== -1) {
		return true;
	}
	return false;
}

var isShellZsh = function () {
	if (getCurrentShell().indexOf("zsh") !== -1) {
		return true;
	}
	return false;
}

/**
 * Server Gen
 * 
 *
 * alias copy-server='copy_from_server root 128.128.128.128 /home/root/ $@'
 *
 * @class
 */
var ServerGen = function () {
	var _installServer = function (serverObject) {
		var easySsh = function (serverObject) {
			serverConfig += "alias ssh-" + serverObject.name + "='ssh " + currentConfig.user + "@" + serverObject.ip + "'\n";
			serverConfig += "alias ssh-root-" + serverObject.name + "='ssh root@" + serverObject.ip + "'\n";
		};

		var easyCopyFrom = function (serverObject) {
			serverConfig += "alias copy-from-" + serverObject.name + "='copy_from_server " + currentConfig.user + " " + serverObject.ip + " " + "/home/" + currentConfig.user + "/" + " $@" + "'\n";
			serverConfig += "alias copy-from-root-" + serverObject.name + "='copy_from_server root " + serverObject.ip + " /root/ $@'\n";
		};

		var easyCopyTo = function (serverObject) {
			serverConfig += "alias copy-to-" + serverObject.name + "='copy_to_server " + currentConfig.user + " " + serverObject.ip + " " + "/home/" + currentConfig.user + "/" + " $@" + "'\n";
			serverConfig += "alias copy-to-root-" + serverObject.name + "='copy_to_server root " + serverObject.ip + " /root/ $@'\n";
		};

		easySsh(serverObject);
		easyCopyFrom(serverObject);
		easyCopyTo(serverObject);
	};

	// cat ~/.ssh/id_rsa.pub | ssh user@hostname 'cat >> ~/.ssh/authorized_keys'
	var _registerServer = function (serverObject, callback) {
		exec("cat ~/.ssh/id_rsa.pub | ssh " + currentConfig.user + "@" + serverObject.ip + " 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'",
			function (error, stdout, stderr) {
				if (error !== null) {
					UtilsInstance.nl();
					UtilsInstance.logError("Manually Execute This: cat ~/.ssh/id_rsa.pub | ssh " + currentConfig.user + "@" + serverObject.ip + " 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'");
					UtilsInstance.nl();
					callback(true, {
						message: "Failed to register your keys to the Server " + error
					});
				} else {
					callback(false, {
						message: "Installed SSH Keys to - " + serverObject.name
					});
				}
			});
	};

	return {
		installServer: _installServer,
		registerServer: _registerServer
	};
};



serverGenInstance = ServerGen();

var Utils = function () {

	var _logError = function (message) {
		console.log("[AxiCLI] ".red + message.red);
	};

	var _log = function (message) {
		console.log("[AxiCLI] " + message);
	};

	var _nl = function () {
		console.log("");
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

				var baseTemplate = fs.readFileSync(AXI_SHELL_TEMPLATE, "UTF-8");

				var mainTemplate = baseTemplate + "\n" + serverConfig;

				fs.writeFileSync(AXI_SHELL_CONFIG, mainTemplate);
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
				configCli.push(". ~/" + AXI_CLI_FOLDER + AXI_SHELL_CONFIG_FILE);
			}
		}

		if (isShellZsh()) {
			fs.exists(ZSH_CONFIG_PATH, function (exists) {
				if (exists) {
					appendMissingConfigs(ZSH_CONFIG_PATH, configCli);
					callback(false, {
						message: "Updated ZSH Config"
					});
				} else {
					callback(true, {
						message: "Can't Find ZSH Config File in ~ (home) directory"
					});
				}
			});

		} else if (isShellBash()) {
			fs.exists(BASH_CONFIG_PATH, function (exists) {
				if (exists) {
					appendMissingConfigs(BASH_CONFIG_PATH, configCli);
					callback(false, {
						message: "Updated Bash Config"
					});
				} else {
					callback(true, {
						message: "Can't Find Bash Config File in ~ (home) directory"
					});
				}
			});
		} else {
			callback(true, {
				message: "Can't Find Bash or Zsh Config File in ~ (home) directory"
			});
		}
	};

	var _downloadConfig = function (newConfigData, callback) {
		var configCli = [];
		if (newConfigData.cdn[newConfigData.cdn.length - 1] !== "/") {
			newConfigData.cdn += "/";
		}

		request.get({
			url: newConfigData.cdn + CDN_CONFIG_FILE,
			json: true
		}, function (err, httpResponse, body) {
			if (err || httpResponse.statusCode !== 200) {
				callback(true, {
					message: "Unable to get DB Name from Server : " + newConfigData.cdn + " Please check your CDN",
					error: err
				});

				return;
			}

			fs.writeFileSync(AXI_CONFIG_PATH, JSON.stringify(body.axirc, null, 2));
			callback(false, {
				message: "Updated Base Config"
			});
		});
	};

	return {
		logError: _logError,
		log: _log,
		logInfo: _logInfo,
		nl: _nl,
		installConfig: _installConfig,
		updateShellConfig: _updateShellConfig,
		downloadConfig: _downloadConfig
	};

};

UtilsInstance = Utils();

var Cli = function () {

	var _loadConfig = function (callback) {
		if (currentConfig && baseConfig) {
			return {
				currentConfig: currentConfig,
				baseConfig: baseConfig
			};
		}

		var baseConfigString = fs.readFileSync(AXI_BASE_PATH, "UTF-8");
		if (!baseConfigString) {
			callback(true, {
				message: "Unable to read config file " + AXI_BASE_PATH
			});
			return;
		}
		baseConfig = JSON.parse(baseConfigString);

		var currentConfigString = fs.readFileSync(AXI_CONFIG_PATH, "UTF-8");
		if (!currentConfigString) {
			callback(true, {
				message: "Unable to read config file " + AXI_CONFIG_PATH
			});
			return;
		}

		currentConfig = JSON.parse(currentConfigString);
		currentConfig.user = baseConfig.ssh_username || "root";

		return {
			currentConfig: currentConfig,
			baseConfig: baseConfig
		};
	};

	var _install = function (callback) {

		var configs = _loadConfig(callback);

		if (!configs) {
			return;
		}

		currentConfig = configs.currentConfig;

		serverConfig = "";
		// Configure the Shell
		for (var i = currentConfig.servers.length - 1; i >= 0; i--) {
			serverGenInstance.installServer(currentConfig.servers[i]);
		}

		UtilsInstance.installConfig("server", function (err, result) {
			if (err) {
				UtilsInstance.logError(result.message);
				callback(true);
			} else {
				UtilsInstance.logInfo(result.message);
				UtilsInstance.updateShellConfig(["server"], function (err, result) {
					if (err) {
						UtilsInstance.logError(result.message);
						callback(true);

					} else {
						UtilsInstance.logInfo(result.message);
						UtilsInstance.logInfo("Restarting Your Shell");
						if (isShellZsh()) {
							exec('source ~/.zshrc',
								function (error, stdout, stderr) {
									if (error !== null) {
										UtilsInstance.nl();
										UtilsInstance.logError("Manually Execute: source ~/.zshrc");
										UtilsInstance.nl();
										UtilsInstance.logError("Failed to restart Zsh Shell, Please Try Manually. " + error);
										callback(true);
									} else {
										callback(false);
									}
								});
						} else if (isShellBash()) {
							exec('source ~/.bashrc',
								function (error, stdout, stderr) {
									if (error !== null) {
										UtilsInstance.logError("Failed to restart Bash Shell");
										callback(true);
									} else {
										callback(false);
									}
								});
						}
					}

				});
			}
		});
	};

	var _update = function (callback) {
		var configs = _loadConfig(callback);

		if (!configs) {
			return;
		}

		baseConfig = configs.baseConfig;

		var setupData = {};

		setupData.cdn = baseConfig.cdn;
		setupData.ssh_username = baseConfig.ssh_username;

		UtilsInstance.downloadConfig(setupData, function (err, result) {
			if (err) {
				UtilsInstance.logError(result.message);
				callback(true);
			} else {
				UtilsInstance.logInfo(result.message);
				_install(callback);
			}
		});
	};

	var _setup = function (callback) {
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

		fs.exists(HOME_DIR + AXI_CLI_FOLDER, function (exists) {
			if (!exists) {
				fs.mkdirSync(HOME_DIR + AXI_CLI_FOLDER);
			}

			prompt.get(['cdn', 'ssh_username'], function (err, result) {
				setupData.cdn = result.cdn;
				setupData.ssh_username = result.ssh_username;

				fs.writeFileSync(AXI_BASE_PATH, JSON.stringify(setupData, null, 2));

				UtilsInstance.downloadConfig(setupData, function (err, result) {
					if (err) {
						UtilsInstance.logError(result.message);
						callback(true);
					} else {
						UtilsInstance.logInfo(result.message);
						_install(callback);
					}
				});
			});
		});
	};

	var _registerServer = function (serverName, callback) {
		if (serverName) {
			var configs = _loadConfig(callback);
			var selectedServer = false;

			if (!configs) {
				return;
			}

			currentConfig = configs.currentConfig;

			for (var i = currentConfig.servers.length - 1; i >= 0; i--) {
				if (currentConfig.servers[i].name === serverName) {
					selectedServer = currentConfig.servers[i];
				}
			}

			if (selectedServer) {
				serverGenInstance.registerServer(selectedServer, function (err, result) {
					if (err) {
						UtilsInstance.logError(result.message);
						callback(true);
					} else {
						UtilsInstance.logInfo(result.message);
						callback(false);
					}
				});
			} else {
				UtilsInstance.logError("Unable to find Server with name - " + serverName);
			}
		}
	};

	return {
		setup: _setup,
		install: _install,
		update: _update,
		registerServer: _registerServer
	};
};

CliInstance = Cli();


program
	.version(PACKAGE_CONFIG.version)
	.alias('axi')
	.option('setup', 'Setup AxiCLI')
	.option('install <installType>', 'Install AxiCLI Components', /^(shell)$/i)
	.option('update <updateType>', 'Update AxiCLI Components', /^(shell)$/i)
	.option('register <serverName>', 'Register your SSH key in the server')
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

if (program.register) {
	CliInstance.registerServer(program.register, function (err) {
		process.exit(0);
	});
}