#!/bin/bash

# Script for bundling the react components

# Author: Levindo Gabriel Taschetto Neto
# Advisors: Prof. Dr.-Ing. habil. Bernhard Mitschang,
#           M.Sc. Ana Cristina Franco da Silva
#           Dipl.-Inf. Pascal Hirmer

sed -i 's/\r$//' init.sh # Remove trailing \r character
clear;
echo "___________________________________________________";
echo "Setting Node JS (npm) up";
echo "___________________________________________________";
sudo apt-get update && sudo apt-get -y upgrade
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Setting Up and Initializing the IoT Modelling Tool";
echo "___________________________________________________";
echo "Setting Webpack up (This might take a few seconds)";
npm install --save-dev webpack;
echo "___________________________________________________";
echo "Bundling React JS Components (Wait until webpack has finished watching all the files)";
pushd ../public/app/modules/dashboard/digital_environment/src/main/js/; # Go to the directory where the web app's files are in
webpack -p;