# IoT - Modeling Tool

Iot Modelling Tool is a platform which allows users to have their own devices and components modeled in order to represent a physical environment.


__Author__

[Levindo Gabriel Taschetto Neto](http://levindoneto.github.io/)

__Advisors__

[Prof. Dr.-Ing. habil. Bernhard Mitschang](https://www.ipvs.uni-stuttgart.de/abteilungen/as/abteilung/mitarbeiter/bernhard.mitschang)

[M.Sc. Ana Cristina Franco da Silva](https://www.ipvs.uni-stuttgart.de/abteilungen/as/abteilung/mitarbeiter/Ana.Franco)

[Dipl.-Inf. Pascal Hirmer](https://www.ipvs.uni-stuttgart.de/abteilungen/as/abteilung/mitarbeiter/Pascal.Hirmer)


## Repository Structure

* [App](public/app) (contains the files assigned to organize the high-level architecture of the project)
* [Firebase Hosting](public/bin) (contains the server configurations for the hosting on the firebase platform)
* [CSS Files](public/css) (contains the style files for the front-end, e.g., bootstrap files)
* [Fonts](public/fonts) (contains all the used fonts of the project's front-end)
* [Platform' Images](public/images) (contains the images used in the project, e.g., devices, sensors and actuators icons)
* [Front-End's Images](public/images) (contains the images used on the front-end of the project, e.g. dashboard and index)
* [Javascript Files](public/js) (contains files responsible for the back-end of the project, e.g., AngularJS files)
* [Less Files](public/less) (contains files responsible for CSS pre-processing)
* [Node.js Modules](public/node_modules) (contains files of the Node.js' set of built-in modules)
* [Plugins](public/plugins) (contains files responsible for add specifics features to the back-end of the project)
* [Resources](public/resources) (contains the diagrams of the project, e.g., astah files)
* [Routes](public/routes) (contains the Angular Router for navigation from one view to the next as users perform application tasks)
* [SCSS Files](public/scss) (contains the files for the nested metalanguage scss, which is interpreted into CSS on this platform)
* [Jade Files](public/views) (contains the files for the Jade high performance template engine)

## Relationship among the packages in a high level approach

The packages diagram can be viewed in the image bellow.

![packages](public/resources/packages.jpg)

## System's submenus

Each submenu has its own controller and view. In total, there are 11 submenus on the developed IoT Modelling Tool:

* My Account
* Add Default @Context 
* Add Specific @Context 
* Add Default @Graph
* My @Context
* My @Graph
* IoT Modelling Environment
* Add Device
* My Modeled Hardware Devices and Components
* Add Additional Properties
* Search

## Database

The utilized database for synchronized data on this platform is [Firebase](https://firebase.google.com/). The Firebase Real Time Database is a cloud-hosted NoSQL database that lets you store and sync data between your users in real time.

### Utilized Keys

* IoT Lite Contexts
* Defaults (IoT Lite Context and IoT Lite Graph)
* IoT Lite Graphs
* Icons (For the components and devices)
* Saved Models' Information (Last saved and last loaded one on the digital twin)
* Devices and Components (with id, ontology, company's prefix, etc)
* Saved Models (By the Save and Save As buttons on the navigation bar)
* Users (each one e-mail, password and username)

## Utilized technologies

### Front-End

* HTML v5
* CSS v3
* [Bootstrap v3.3.7](http://getbootstrap.com/)
* [React JS v15.5.4](https://facebook.github.io/react/)

### Back-End

* [Angular JS](https://angularjs.org/)

### Database

* [Firebase](https://firebase.google.com) on Google's cloud

### Utilized frameworks

* [AngularFire v2.3.0](https://github.com/firebase/angularfire)
* [ReactFire v1.0.0](https://github.com/firebase/reactfire)

### Linter

* [ESLint v4.1.1](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Alert animations

* [Sweet Alert](http://t4t5.github.io/sweetalert/)

## Setup IoT Modeling Tool

### On windows

#### Install NodeJS

* [Download the installer](https://nodejs.org/en/download/)
* Install NodeJS
* Restart the machine

##### Simple commands to test NodeJS

###### Test Node
```terminal
$ node -v
```

###### Test NPM
```terminal
$ npm -v
```

###### Run a file (file.js)
```terminal
$ node file.js
```

##### Install Bower
```terminal
$ npm install -g bower
```

###### Init Bower inside the project folder
```terminal
$ bower init
```

###### The configurations in a JSON format should be like this
```json
{
  name: 'IoT-MT',
  authors: [
    'Levindo Neto <levindogtn@gmail.com>'
  ],
  description: 'Modeling Tool',
  main: 'index.html',
  keywords: [
    'iot'
  ],
  license: 'MIT',
  homepage: '',
  ignore: [
    '**/.*',
    'node_modules',
    'bower_components',
    'test',
    'tests'
  ]
}
```

###### Bind Bower and Angular JS
```terminal
bower install --save angular
```

##### Install the frameworks

TODO

###### AngularFire

TODO

##### ReactFire

TODO

##### Set-up the database

TODO

##### Server for tests

For tests can be used the [http-server](https://www.npmjs.com/package/http-server)
The installation can be done with NPM
```terminal
$ npm install -g http-server
```

or can be used Python Server (It's compatible with [font awesome](https://fontawesome.io))
```terminal
$ python -m http.server [<portNo>]  // Windows
```

```terminal
$ python -m SimpleHTTPServer  // Linux
```

###### To access the application can be used link
```terminal
http://localhost:[<portNo>]/
```
directly in any web browser.

##### Setup the directory for express
```terminal
$ npm install -g express-generator
$ express Implementierung
$ npm install -d
$ npm start
```

Another way to start the application in the browser is with the Zervit.

Also it should be added on [package.json](public/package.json) in "scripts":
```json
"start": "http-server ./Implementierung -a localhost -p 8080"
```
