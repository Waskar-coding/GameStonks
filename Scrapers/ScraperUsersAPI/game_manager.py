#Description
"""
This script will eliminate from the registers all data
related with games that are not in standby.csv and from
user with no information related with these games.
"""
__author__='Óscar Gómez Nonnato'
__date__='11/01/2020'



#Libraries
##Standard
import os
import csv
import json
import logging



#Initializing logger
gamelogger=logging.getLogger('GameManager')
gamelogger.setLevel(logging.INFO)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('game_manager.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
gamelogger.addHandler(file_handler)



#Getting standby games
def get_standby(standby_path : os.path) -> list:
	##Documentation
	"""
	Retrieves a list of all currently monitored games.

	Parameters
	----------
	standby_path : os.path
		Path to standby.csv
	"""

	##Extracting list of standby games
	os.chdir(standby_path)
	with open('standby.csv','r',newline='') as game_doc:
		reader=csv.reader(game_doc,delimiter=';')
		game_list=[row[0] for row in reader]
	
	return game_list



#Getting monitored users json
def get_monitored_users(monitored_path : os.path) -> dict:
	##Documentation
	"""
	Retrieves a json with all the monitored users and their gameplay
	data.

	Parameters
	----------
	monitored_path : os.path
		Path to monitored_users.json
	"""

	##Extracting json with user data
	os.chdir(monitored_path)
	with open('monitored_users.json','r') as user_doc:
		user_dict=json.load(user_doc)
	
	return user_dict



#Getting monitored games json
def get_monitored_games(monitored_path : os.path) -> dict:
	##Documentation
	"""
	Retrieves a json with all monitired games and their number
	of monitored users.

	Parameters
	----------
	monitored_path : os.path
		Path to monitored_games.json
	"""

	##Extracting json with game data
	os.chdir(monitored_path)
	with open('monitored_games.json','r') as game_doc:
		game_dict=json.load(game_doc)

	return game_dict



#Eliminating users with no monitored games
def delete_users(game_list : list, user_dict : dict) -> dict:
	##Documentation
	"""
	Deletes all users which do not have any information regarding
	the currently monitored games.

	Parameters
	----------
	game_list : list
		List of all games currently being monitored.

	user_dict : dict
		Dict object with all monitored users data.
	"""

	##Adding to delete list users without monitored games
	to_delete=[]
	for userid in user_dict['profiles'].keys():
		user_set = set(user_dict['profiles'][userid].keys())
		game_set = set(game_list)
		user_games = game_set.intersection(user_set)
		if len(user_games) == 0:
			to_delete.append(userid)
	
	##Deleting users in delete list from json
	logger.info(
		"""
		Deleting the following users from monitored_users.json : {}
		""".format(to_delete)
		)

	for userid in to_delete:
		del user_dict['profiles'][userid]
	
	return user_dict



#Eliminating non monitored games from json
def delete_games(game_list : list, game_dict : dict) -> dict:
	##Documentation
	"""
	Deletes the data of all games that do not appear in standby.csv

	Parameters
	----------
	game_list:
		List of all steam appids from standby.csv.

	game_dict:
		Dictionary extracted from monitored_games.json.
	"""

	#Adding non-monitored games to delete list
	to_delete=[]
	for appid in game_dict['games'].keys():
		if appid not in game_list:
			to_delete.append(appid)

	#Deleting all games from delete list
	logger.info(
		"""
		Deleting the following games from monitored_games.json: {}
		""".format(to_delete)
		)
	for appid in to_delete:
		del game_dict['games'][appid]

	return game_dict



#Saving new user json
def save_users(user_dict : dict) -> None:
	##Documentation
	"""
	Saves a filtered user_dict into monitored_user.json.

	Parameters
	----------
	user_dict : dict
		Dictionary with all monitored users gameplay information.
	"""

	##Saving new user json
	with open('monitored_users.json','w') as user_doc:
		json.dump(user_dict,user_doc,indent=2)



#Saving new game json
def save_games(game_dict : dict) -> None:
	##Documentation
	"""
	Saves filetered game_dict into monitored_games.json.

	Parameters
	----------
	game_dict : dict
		Dictionary with all monitored games information.
	"""

	##Saving new games json
	with open('monitored_games.json','w') as game_doc:
		json.dump(game_dict,game_doc,indent=2)



#Main
def main():
	##Documentation
	"""
	Module's main function, filters the data from 
	monitored_users.json and monitored_games.json according
	to the current standbygames. Deletes data which is not
	related to the currently monitored games.
	"""

	##Path constants
	STANDBY_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
		r'\Proyecto Owners\Scrapers\ScraperCharts'
	MONITORED_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
		r'\Proyecto Owners\Scrapers\ScraperUsersAPI'
	STANDBY_PATH=os.path.normpath(STANDBY_PATH)
	MONITORED_PATH=os.path.normpath(MONITORED_PATH)

	##Getting data from standby games and monitored games and users
	game_list = get_standby(STANDBY_PATH)
	user_dict = get_monitored_users(MONITORED_PATH)
	game_dict = get_monitored_games(MONITORED_PATH)

	##Filtering non monitored games data
	user_dict = delete_users(game_list,user_dict)
	game_dict = delete_games(game_list,game_dict)

	##Saving results
	save_users(user_dict)
	save_games(game_dict)



#Execution
if __name__ == '__main__':
	main()