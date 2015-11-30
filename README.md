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

#### Quickly Copy Files from Servers
```sh
copy-from-<server_name>:<absoluted_or_relative_path> <destination_path>
copy-from-root-<server_name>:<absoluted_or_relative_path> <destination_path>
```
Both commands copy. One makes the user as root.

#### Quickly Copy Files to Servers
```sh
copy-to-<server_name> <absoluted_or_relative_path> <destination_path_on_server>
copy-to-root-<server_name> <absoluted_or_relative_path> <destination_path_on_server>

# For Example:
copy-from-prod /usr/share/nginx/www/html/test.txt /p/
# This will look into /usr/share/nginx/www/html/test.txt

copy-from-prod test.txt /p/
# This will look into /home/<your username>/test.txt
```

#### Extra Configs
if `prod` is your server's name:
```sh
ssh-prod --user=customUser
# ssh-prod --user=vasumahesh
# ssh vasumahesh@<ip>

ssh-prod --ip=customIp
# ssh-prod --ip=10.0.0.1
# ssh <your username>@10.0.0.1

ssh-prod --options="<quoted options like ND Tunnel Port>"
# ssh-prod --options="-ND 8157"
# ssh <your username>@<ip> -ND 8157
```
Same are also valid for ssh-root-prod

#### Update Shell
```sh
axicli update shell
```
This will redownload the config and remake your shell.

#### Register Your Keys in Server
Auto Register your SSH Keys to the Server:
Note: This uses `/home/<your username>/.ssh` as path
```sh
axicli register <server_name>
```
This will put your ssh keys located at `.ssh/id_rsa.pub` into the Server's Authorized Keys (if there is no ssh folder in the server it will be created along with the file)
