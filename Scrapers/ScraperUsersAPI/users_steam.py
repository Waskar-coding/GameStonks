#Description
"""
Searches all games to monitor in stanby.csv and all user
which have an active GameplayRegister on this with these
games. Then uses the SteamAPI to query and add the current
played time to the registers. The user is kicked from all
the active jackpots if his profile is set to private and
issued a strike.
"""
__author__ = 'Óscar Gómez Nonnato'
__date__ = '07/02/2020'



#Libraries
##Standard
import os
import sys
import csv
import logging

##Packages
import requests
import mongoengine

##Local
PROXY_PATH = '../'
OBJECT_PATH = '../../Database Management/SteamDB/Objects'
sys.path.extend([PROXY_PATH, OBJECT_PATH])
import proxypy
import steam_game_db as gamedb
import steam_user_db as userdb
import OwnedIngestionEngine as ingestion



#Initializing logger
logger = logging.getLogger('UserMainFunc')
logger.setLevel(logging.DEBUG)
st_format = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter = logging.Formatter(st_format)
file_handler = logging.FileHandler('steamUsers_products.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Getting data on monitored games
def getGames() -> list:
	##Documentation
	"""
	Retrieves all games to monitor from standby.csv
	"""

	##Retrieving games to monitor
	os.chdir('../ScraperCharts')
	DATE_FORMAT = r'%d/%m/%Y'
	with open('standby.csv','r',newline='') as STANDBY_CSV:
		READER = csv.reader(STANDBY_CSV,delimiter=';')
		GAME_LIST = [row[0] for row in READER]
	return GAME_LIST



#Getting users with active GameplayRegisters
def getUsers(game_list: list) -> userdb.SteamUser:
	##Documentation
	"""
	Gets all users who have an active GameplayRegister
	on any of the monitored games.

	Parameters
	----------
	game_list (list):
		List of all active games from standby.csv
	"""

	##Retrieving user from DB
	USER_LIST = userdb.SteamUser.objects\
		.filter(monitored__appid__in = game_list)
	USER_LIST = [user.steamid for user in USER_LIST]
	return USER_LIST



#Owned request
def requestUser(steamid: str, **kwargs) -> dict:
	##Documentation
	"""
	Makes a request to SteamAPI to obtain information about
	an user's owned games.

	Arguments
	---------
	steamid (str):
		User community id.
	
	
	Key arguments
	-------------
	timeout (float):
		Max time that must pass before a TimeoutExeception is
		raised.
	"""

	##Unpacking kwargs
	timeout = kwargs['timeout']
	
	##Url params
	BASE_API = 'http://api.steampowered.com'
	ENVIRONMENT = '/IPlayerService'
	FUNCTION = '/GetOwnedGames'
	VERSION = '/v0001'
	KWARG_DICT = {
		'key': os.environ['STEAM_PERSONAL_APIKEY'],
		'steamid': steamid,
		'include_played_free_games': 'true',
		'format': 'json'
	}

	##Building base url
	BASE_URL = BASE_API\
		+ ENVIRONMENT\
		+ FUNCTION\
		+ VERSION\
		+ '/'

	##Adding arguments to url
	USER_URL = BASE_URL + '?'
	for key, value in KWARG_DICT.items():
		USER_URL += key + '=' + value + '&'
	USER_URL = USER_URL[:-1]

	##Making a request and reviewing result
	response = requests.get(USER_URL, timeout=timeout)
	if response.status_code != 200:
		logger.warning(
			"""
			An error ocurred while requesting owned
			games for the user {}
			""".format(steamid)
			)
		raise Exception('Request error')
	else:
		logger.info(
			"""
			Owned games for user {} correctly reviewed
			""".format(steamid)
			)
		return response.json()



#Dividing request arglist in chunks
def divideList(list_: list, chunksize: int) -> list:
	##Documentation
	"""
	Divides a given list in chunks of a specific size,
	returns a list of the divided chunks.

	Parameters
	----------
	list_ (list):
		List we wish to divide

	chunksize (int):
		Size of the chunks we desire to divide the list
		into.
	"""

	##Dividing list in chunks
	divided_list = []
	while len(list_) > chunksize:
		divided_list.append(list_[:chunksize])
		for i in range(chunksize):
			list_.pop(0)
	divided_list.append(list_)
	return divided_list



#Main function
def main():
	##Registering connection
	mongoengine.register_connection('SteamDB','SteamDB')

	##Proxypy params
	chunksize = 20
	request_func = requestUser
	request_arglist = getUsers(getGames())
	request_arglist=[[arg] for arg in request_arglist]
	divided_request_arglist=divideList(request_arglist,chunksize)
	proxy_list=['my proxy']
	crunch_func=ingestion.main

	##Initializing manager
	OwnedManager=proxypy.ProxyRotationManager(
		proxy_list,
		request_func,
		request_arglist,
		crunch_func=crunch_func
		)

	##Letting the manager do its work
	for chunk in divided_request_arglist:
		OwnedManager.request_arglist = chunk
		OwnedManager.multithread_request()
		OwnedManager.crunch()



#Execution
if __name__ == '__main__':
	main()