# Nodejs && MongoDB User Authentication 


## Getting Started

Please following the following steps in order to install the repo in your local/remote machines.

### Prerequisites

What things you need to install the software and how to install them

```
Nodejs
npm
```

* Fork/clone this repository using git
```
git clone https://github.com/Decoder3-14/Node-Express-Auth.git

```
* Then install the project's required packages using npm

```
cd Node-Express-Auth

npm install
```
This will install all the packages into a node_modules folder inside the project.



* Add an .env file in the main dir, then insert the following key-value pairs:
- DB_CONNECTION (Refers to your specific MongoDB configuration. In my case, and for ease, I just created a database in [Atlas Cloud](https://www.mongodb.com/cloud), 
then you will use the link that is provided to you in the dashboard this way,  DB_CONNECTION=<long_link_to_be_inserted>. You can use your own MongoDB config and also 
speicify it in this .env file.

- JWT_KEY (This is any long random string that can be seen as a private key for JWT keys to be generated.)
- EMAIL (For simplicity, I am only using normal GMail NodeMailer service, hence you need to specify them in order for the API to work.)
- PASSWORD (Password for the GMail id you entered for EMAIL key.)


* After finishing with some config, run the server in the development mode using the following command:
```
npm run dev
```

* Note: This API structure can be easily extended to a more complex form, by adding Controllers classes, Models and routes files based on the use case.

