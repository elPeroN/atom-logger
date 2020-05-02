# Atom Logger
Atom editor activity logger

###  Install atom-logger

* Git clone this repository.

* Switch to the root directory of the clone on your local disk.

* Install dependencies:

  * [Sqlite](https://www.sqlite.org/index.html)  

    >  npm install sqlite3

  * [Diff](https://www.npmjs.com/package/diff)

    >  npm install diff

  * [ChartJs](https://www.chartjs.org/)

    >npm install chart.js --save

  * Network

    >npm install network

* Link plugin with Atom

  > apm link

* Reload Atom.

If the user encounters this error:
Cannot find module /$INSTALL_FOLDER/node_modules/sqlite3/lib/binding/electron-v4.2-linux-x64/node_sqlite3.node

He should run:
  > apm install
  
  > apm link
    
And then restart Atom.
