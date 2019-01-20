# Halfway Mapping Project

The node server code for Halfway Mapping Project.

  * This program should calculate a driving route for 2 users if they want to meet in the middle.

*This program is still in development.*


## How to use

Requirements:

* Node.js and npm Installed
* 1 MariaDB/MySQL Database
* This repository downloaded

### Steps

1. Install Node.js version 8.x (this also installs npm)
    * With package manager: https://nodejs.org/en/download/package-manager/
    * Direct download: https://nodejs.org/en/#download
    * All versions: https://nodejs.org/en/download/

2. Check that node and npm are installed
    * `node -v`
    * `npm -v`

3. Download this project
    * https://github.com/DarinDev1000/halfway-backend
    * Or run  `git clone https://github.com/DarinDev1000/halfway-backend`

4. Setup a database: MariaDB/MySQL
    * If you don't have a database, I suggest MariaDB (a fork of MySQL)
        * Mac/Linux check your package manager for MariaDB: "mariadb-server"
        * Add to package manager: https://downloads.mariadb.org/mariadb/repositories
        * Direct Download: https://mariadb.org/download/

5. You may want a database browser to view and edit databases

6. Or edit the database from the command line
    * `sudo mysql -p` or `mysql -u root -p`
    * Optional (add user)
        * To add a user, in mysql, run:
        * `GRANT ALL PRIVILEGES ON *.* TO '<username>'@'localhost' IDENTIFIED BY '<password>';`

7. Create a database in your database server
    * Add tables and columns to each database

8. In the root project directory, rename the "sample.env" file to ".env"
    * `cp sample.env .env`

9. Edit the ".env" file. Fill in the information for database.
    * Use root and database password or the username and password you created.

10. In the root project directory, run:
    * `sudo npm install npm@latest -g`
    * `npm install`

11. This should complete the setup. Now run the server.
    * In the root project directory, run: `node app.js`
    * Or run: `npm run dev-all` to auto restart when a file is saved
    * This will start the server on http://localhost:3000
