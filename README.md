# IoT - Modeling Tool

Iot Modelling Tool is a platform which allows users to have their own devices and components modeled in order to represent a physical environment.

__Author__

[Levindo Gabriel Taschetto Neto](http://levindoneto.github.io/)

__Advisors__

[Prof. Dr.-Ing. habil. Bernhard Mitschang](https://www.ipvs.uni-stuttgart.de/abteilungen/as/abteilung/mitarbeiter/bernhard.mitschang)

[M.Sc. Ana Cristina Franco da Silva](https://www.ipvs.uni-stuttgart.de/abteilungen/as/abteilung/mitarbeiter/Ana.Franco)

[Dipl.-Inf. Pascal Hirmer](https://www.ipvs.uni-stuttgart.de/abteilungen/as/abteilung/mitarbeiter/Pascal.Hirmer)


## Repository's Wiki

Access the wiki of the repository for obtaining some information about the platform, such as how to deploy it and how to use it.
The wiki can be access [here](https://github.com/levindoneto/IoT-Modelling-Tool/wiki)

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

Each submenu has its own controller and view. 

### Admin View

In total, there are eleven submenus on the developed IoT Modelling Tool in the admin view:

* My Account
* Add Default @Context
* Add Specific @Context
* Add Default @Graph
* IoT Lite @Context
* IoT Lite @Graph
* IoT Modelling Environment
* Add Device or Component
* Devices and Components
* Add Additional Properties
* Search

### Normal User View

In total, there are two submenus on the developed IoT Modelling Tool in the admin view:

* My Account
* IoT Modelling Environment

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

