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


## Relationship among the Packages in a High Level Approach

The packages diagram can be viewed in the image bellow.

![packages](public/resources/packages.jpg)


## System's Submenus

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


## IoT Modelling Environment's Navigation Bar

The navigation bar contains synchronized functionalities with the real-time database, as well as importing and exporting models using the file system.

### Synchronized with Firebase
* Save
* Save As
* Load

### Independent from Firebase
* Export
* Import
* Clear


## Database

The utilized database for synchronized data on this platform is [Firebase](https://firebase.google.com/).
Firebase Real Time Database is a cloud-hosted NoSQL database that lets you store and sync data between your users in real time.

### Utilized Keys

* IoT Lite Contexts
* Defaults (IoT Lite Context and IoT Lite Graph)
* IoT Lite Graphs
* Icons (For the components and devices)
* Saved Models' Information (Last saved and last loaded one on the digital twin)
* Devices and Components (with id, ontology, company's prefix, etc)
* Map between specific types and components' ids
* Saved Models (By the Save and Save As buttons on the navigation bar)
* Users (each one e-mail, password and username)


## Used Technologies

### Front-End

* HTML v5
* CSS v3
* [Bootstrap v3.3.7](http://getbootstrap.com/)
* [React JS v15.5.4](https://facebook.github.io/react/)

### Back-End

* [Angular JS](https://angularjs.org/)

### Database

* [Firebase](https://firebase.google.com) on Google's cloud

### Utilized Frameworks

* [AngularFire v2.3.0](https://github.com/firebase/angularfire)
* [ReactFire v1.0.0](https://github.com/firebase/reactfire)

### Linter

* [ESLint v4.1.1](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Alert Animations

* [Sweet Alert v2.0.8](https://sweetalert.js.org)

### Requirements
* [Python](https://www.python.org)

## Bundle the Scripts

### Requirements
* [npm](https://www.npmjs.com/get-npm) 

### Install Webpack
```terminal
$ npm install --save-dev webpack
```

### Use Webpack in order to create the *client.min* for the IoT Modelling Environment
```terminal
$ cd public/app/modules/dashboard/digital_environment/src/main/js
$ webpack -p
```

The parameter *-p* must be used in order to minify the bundled javascript file.


## Setup the IoT Modeling Tool locally (In order to get it running)

### On windows (in the folder [scripts/])

#### For python versions 2.x
```terminal
$ bash initIoT-MT_Windows-Python2.sh
```

#### For python versions 3.x
```terminal
$ bash initIoT-MT_Windows-Python3.sh
```

### On Linux (in the folder [scripts/])
#### For python versions 2.x
```terminal
$ bash initIoT-MT_Linux-Python2.sh
```

#### For python versions 3.x
```terminal
$ bash initIoT-MT_Linux-Python2.sh
```

### Access the Platform
#### Go the following link using any browser
[http://localhost:8080/](http://localhost:8080/)


## Deploy the IoT Modelling Tool using Firebase Hosting
```terminal
$ npm install -g firebase-tools
$ firebase init
$ firebase deploy
```


### Access the Platform
#### Go the following link using any browser
[https://iot-mt.firebaseapp.com](https://iot-mt.firebaseapp.com)
