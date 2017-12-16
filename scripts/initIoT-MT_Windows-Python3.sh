# Initialization of the platform IoT Modelling Tool

# Author: Levindo Gabriel Taschetto Neto
# Advisors: Prof. Dr.-Ing. habil. Bernhard Mitschang,
#           M.Sc. Ana Cristina Franco da Silva
#           Dipl.-Inf. Pascal Hirmer

sed -i 's/\r$//' init.sh # Remove trailing \r character
clear;
echo "Setting the IoT Modelling Tool up";
python ../public/iotmtServer-Python3.py
echo "The server has stopped running";