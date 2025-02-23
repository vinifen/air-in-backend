# Air-in Backend
#### v-1.1

Air-in is an application developed by Vinicius FN for weather research in any city worldwide. It was created to improve skills in web software development.

This repository is one of three created for the project's development, with the other two being:
- frontend: https://github.com/vinifen/air-in-frontend
- docker: https://github.com/vinifen/air-in

## Installation:

For a complete and simplified installation, it is recommended to use the Docker version and follow the instructions in the corresponding repository.

Make sure you have the following installed:
- git:  `sudo apt install git-all`
- mysql-server: `sudo apt install mysql-server`
- node.js: `sudo apt install nodejs` 
- npm: `sudo apt install npm` 

### Create API Key
First, you need to create an API key at: https://openweathermap.org/api


### Clone the repository:

```bash
git clone https://github.com/vinifen/air-in-backend.git
```

### Create the database:

After cloning the repository, you will find the air-in-db.sql file inside the db folder.
You can manually copy and paste the code into MySQL Server or use the command below, editing the file path accordingly:

```bash
mysql < /caminho/para/air-in-db.sql
```


### Create .env

Create a `.env` file in the project's root directory for general configuration.
Follow the template below and replace WEATHER_API_KEY with your generated key.
(The default settings work with the database)

```.env
SERVER_HOSTNAME=localhost
SERVER_PORT=1111

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=abc321
DB_NAME=air_in_db

CORS_ORIGIN=http://localhost:4200

WEATHER_API_KEY=yourkeyhere

JWT_SESSION_KEY=yourjwtsessionkey
JWT_REFRESH_KEY=yourjwtrefreshkey 
 
COOKIE_SECURE=0
```

### Install dependencies:

```bash
npm install
```

### Run the application in development mode:

```bash
npm run dev
```

### Build the project:

If you want to build the project, use the command below:

```bash
npm run build
```

### Start the application:

After building, start the application with the command:

```bash
npm run start
```



