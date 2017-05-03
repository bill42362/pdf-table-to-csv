# pdf-table-to-csv
Read pdf to csv.

### Setup on windows. ###
1. Install nodejs from [node.js](https://nodejs.org/en/download/).
2. Install git with `git-bash` from [git-for-windows](https://git-for-windows.github.io/).
3. Open `git-bash`.
4. Continue to [Install](#Install).

### Setup on *nix like. ###
```sh
$ sudo curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash -
# If use 7.x need modify socketio-sticky-session as issue comment here:
# https://github.com/wzrdtales/socket-io-sticky-session/issues/25#issuecomment-294213294
$ yum -y install git nodejs
# Continue to Install.
```

### Install ###
```bash
$ git clone https://github.com/bill42362/pdf-table-to-csv.git
$ cd pdf-table-to-csv
$ npm install
```

### Usage ###
1. Copy all your pdf into pdf folder.
2. Edit `probes.js` to customize your .csv file.  You can use any editor you like.
3. Run command:
```bash
$ node index.js ./pdf/*.pdf > [YOUR RESULT FILE]
```
