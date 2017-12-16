# Initialization of the platform IoT Modelling Tool

# Author: Levindo Gabriel Taschetto Neto
# Advisors: Prof. Dr.-Ing. habil. Bernhard Mitschang,
#           M.Sc. Ana Cristina Franco da Silva
#           Dipl.-Inf. Pascal Hirmer

sed -i 's/\r$//' init.sh # Remove trailing \r character
clear;
echo "Setting the IoT Modelling Tool up";

if [ "python -V" == "Python 3.5.4 :: Anaconda custom (64-bit)" ]; then
	echo "You have access!"
else
	echo "ACCESS DENIED!"

python iotmtServer-Python2.py;
echo "The server has stopped running";