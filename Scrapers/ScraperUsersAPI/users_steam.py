#Description
"""
Checks if a user is allowed to enter the website, to enter
GameStonks the user must comply with the following conditions:

1.	Community visibility must be set to "public".

2.	The account must be at least a year old.

3.	The current value of the account must surpass 20€

If the user's profile does not follow this rules it will be banned
as soon as his/her profile is registered. When they comply with
this rules they can request to have their profile unbanned 
(executing this code again), if all the conditions are met the ban
will be lifted; if on the contrary the conditions are yet to be
met the user will be permanently banned for security reasons.
"""
__author__ = 'Óscar Gómez Nonnato'
__date__ = '27/01/2020'



#Libraries
##Standard
import os
import time
import logging

##Packages
import requests



#Initializing logger
logger=logging.getLogger('OwnedCrunchFunc')
logger.setLevel(logging.INFO)
ST_FORMAT = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(ST_FORMAT)
file_handler=logging.FileHandler('owned_games.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Getting player resume
def getResume(userid: str) -> dict:
	##Documentation
	"""
	"""

	##Url arguments
	BASE_API = 'http://api.steampowered.com'
	ENVIROMENT = '/ISteamUser'
	FUNCTION = '/GetPlayerSummaries'
	VERSION = '/v0002'
	KEY = '/?key=' + os.environ.get('STEAM_PERSONAL_APIKEY')
	args = ['steamids=' + userid]

	##Building url
	url = BASE_API + ENVIROMENT + FUNCTION + VERSION + KEY
	for arg in args:
		url += '&'+ arg 

	##Making request
	response = requests.get(url)
	MAX_COUNT = 10
	count = 0
	while response.status_code != 200 and count<MAX_COUNT:
		print(response.status_code)
		print(response.status_code!=200)
		response = requests.get(url)
		count += 1

	##Returining response or error
	if response.status_code == 200:
		return response.json()
	else:
		logger.error('Request failed for user {}'.format(userid))
		return None

print(getResume('76561198032250208'))
print(getResume('76561197967303511'))