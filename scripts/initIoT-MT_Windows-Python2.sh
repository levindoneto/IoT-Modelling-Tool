# Initialization of the platform IoT Modelling Tool

# Author: Levindo Gabriel Taschetto Neto
# Advisors: Prof. Dr.-Ing. habil. Bernhard Mitschang,
#           M.Sc. Ana Cristina Franco da Silva
#           Dipl.-Inf. Pascal Hirmer
# Requirements:
# Operating System: Windows
# Python Version: 2.0 or superior

sed -i 's/\r$//' init.sh # Remove trailing \r character
clear;
echo "Setting Up and Initializing the IoT Modelling Tool";
pushd ../public; # Go to the directory where the web app's files are in
python ../public/iotmtServer-Python2.py
echo "The server has stopped running";