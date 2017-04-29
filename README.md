# IoT - Modeling Tool
__Author:__ Levindo Gabriel Taschetto Neto (IPVS)

## Repository Structure

* [App](app) (contains the files assigned to organize the high-level architecture of the project)

* [CSS Files](css) (contains the style files for the front-end, e.g., bootstrap files)

* [Images](img) (contains the images used in the project, e.g., devices, sensors and actuators icons)

* [Javascript Files](js) (contains files responsible for the back-end of the project, e.g., AngularJS files)

* [Plugins](plugins) (contains files responsible for add specifics features to the back-end of the project)

* [Resources](resources) (contains the diagrams of the project, e.g., astah files)

## Relationship among the packages in a high level approach

The packages diagram can be viewed in the image bellow.

![packages](resources/packages.jpg)

The environment mock-up can be seen in the picture bellow (not yet).

![Mock-Up Environment](resources/mock-up-environment.jpg)

## How it will work (Initial idea)

I) When an item is drag and dropped in the virtual environment (digital twin) an item is created in the database.
This item has a random ID (Key in the JSON representation).
The values assigned to each key might be:

* Type (sensor, device, actuator) [String]
* Name [String]
* MAC Address [Integer]
* Available connections (in case of the devices this can be sensors, actuators, etc.) [List]
* Connections [List]
* Location (longitudinal, latitudinal)

II) When an item is drag and dropped into the trash icon it'll be removed from the virtual environment and it'll be deleted from the database.

## Utilized technologies

### Front-End

* HTML v5
* CSS v3
* [Bootstrap v3.3.7] (http://getbootstrap.com/)

### Back-End

* [Angular JS] (https://angularjs.org/)

### Database

* [Firebase] (https://firebase.google.com) on Google's cloud
