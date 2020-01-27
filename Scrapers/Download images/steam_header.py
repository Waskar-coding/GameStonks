#Description
"""
Download the header of a steamapp and writes it in a SteamGame
object.
"""
__author__ = 'Óscar Gómez Nonnato'
__date__ = '24/01/2020'



#Libraries
##Standard
import os
import sys
import base64

##Packages
import requests

##Local
CONNECT_PATH = '../../Database Managerment/SteamDB' 
GAME_PATH = CONNECT_PATH + '/Objects'
CONNECT_PATH = os.path.normpath(CONNECT_PATH)
GAME_PATH = os.path.normpath(GAME_PATH)
sys.path.extend([CONNECT_PATH,GAME_PATH])
import steam_connection_db as connectdb
import steam_game_db as gamedb



#Requesting to image href
def requestImage(appid):
	##Generating url
	BASE_URL ="https://steamcdn-a.akamaihd.net/steam/apps/"
	HEADER_URL = "/header.jpg"
	url= BASE_URL+appid+HEADER_URL

	##Sending request
	response = requests.get(url).content

	return response



#Encoding image
def encodeImage(response):
	return base64.b64encode(response)



#Image
def main(appid):
	response = requestImage(appid)
	encoded_image = encodeImage(response)
	return str(encoded_image)



#Execution
if __name__ == "__main__":
	main('440')
