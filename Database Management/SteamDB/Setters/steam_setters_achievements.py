#Description
"""
This script collects achievements from a temporary
document and pushes the data into SteamDB using
steam_achievement_setter from steam_setters_db
"""
__author__='Óscar Gómez Nonnato'



#Libraries
##Standard
import os
import sys
import json
import logging

##Local
CONNECT_PATH = '../'
GETTER_PATH = '../Getters'
sys.path.extend([CONNECT_PATH,GETTER_PATH])
import steam_connection_db as connectdb
import steam_setters_db as setterdb
import steam_getters_db as getterdb



#Initializing logger
logger=logging.getLogger('AchievementPush')
logger.setLevel(logging.DEBUG)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('achievement_push.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Getting achievement dictionary
def get_achievements(path: str) -> dict:
	##Documentation
	"""
	When called opens the document achievements.json
	from a given path and returns a dictionary with all
	the achievements in every standby game. The document
	is reseted after every call.

	Parameters
	----------
	path: os.path
		Directory with an achievement.json file
	"""

	##Accessing selected directory
	os.chdir(path)

	##Getting achievement dictionary
	with open('achievements.json','r') as a_doc:
		a_dict=json.load(a_doc)['games']
	
	##Reseting achievements.json
	with open('achievements.json','w') as a_doc:
		json.dump({'games':{}},a_doc,indent=2)

	return a_dict


#Pushing achievements into SteamDB
def push_achievements(a_dict:dict) -> None:
	##Documentation
	"""
	Pushes the content for every game registered in a_dict to SteamDB
	using the function steam_achievement_setter from steam_setters_db

	Parameters
	----------
	a_dict: dict
		Contains all appids of standby games as keys, the achievements
		data is registered in the values as nested dictionaries with the
		achievement ids as keys and the percerntages as values.   
	"""

	##Pushing items into db
	for item in a_dict.items():
		appid,app_json=item
		steamgame=getterdb.steam_game_getter(
			appid,
			logger
			)
		steamgame=setterdb.steam_achievement_setter(
			steamgame,
			app_json,
			logger)
		setterdb.steam_game_save(steamgame)


#Main
def main():
	##Description
	"""
	Main function, contains the constant that indicates the path for
	the get_achievements function in this same module. Calls all the
	other functions in this module sequentially.
	"""

	##Achievement path constant
	ACHIEVEMENT_PATH='../../../Scrapers/ScraperAchievementsAPI'
	
	##Getting Achievements dictionary
	a_dict=get_achievements(ACHIEVEMENT_PATH)

	##Pushing contents into db
	push_achievements(a_dict)



#Execution
if __name__=='__main__':
	main()