## AxiCLI - Simple Command Line Snippets

Installation
--------------------------------

#### Client Side
You can install it via NPM:
```sh
npm install -g axicli

axicli setup
> cdn: http://myserver.com/directories/mycustomcli/
> ssh_username: test_user
```

#### Server Side
Store this config in your cdn folder.
```json
{
	"axirc": {
		"servers": [{
			"name": "test",
			"ip": "custom ip/domain"
		}, {
			"name": "prod",
			"ip": "custom ip/domain"
		}, {
			"name": "dev",
			"ip": "custom ip/domain"
		}]
	}
}
```

Features
--------------------------------

#### Quick SSH
```sh
ssh-<server_name>
ssh-root-<server_name>
```
Both commands perform a SSH to the specified Server.


#### Update Shell
```sh
axicli update shell
```
This will redownload the config and remake your shell.

