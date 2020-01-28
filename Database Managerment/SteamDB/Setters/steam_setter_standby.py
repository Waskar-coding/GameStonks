#Description
"""
Compares all games from standby.csv and the games in SteamDB with
priority = True and separates them in three groups.


The new standby games
-------------
The games that are present in standby.csv but do not exist in
the steamgaemes collection from SteamDB or their prority is set
to false. For this games the following actions will be taken.

1. Check if the game exist in SteamDB, if so jump to 4rt step.
2. Create a SteamGame assigning the basic info from steampps.
3. Download a the thumbnail and assign it to the game.
4. Set the priority in the SteamGame object to true.
5. Save the SteamGame object.


The stagnant games
------------------
The games that no longer appear in standby.csv but their priority
field keeps assigned to true. With this type of objects the course
of action is simple. Their priority field is set to false, and
they are again saved into SteamDB.


The old standby games
---------------------
The games that appear in standby.csv and have their priority set
to true. This games only need to have their score field refreshed.
"""
__author__ = 'Óscar Gómez Nonnato'
__date__ = '26/01/2020'



#Libraries
##Standard
import os
import sys
import csv
import logging
import datetime

##Local
STANDBY_PATH = r'../../../Scrapers/ScraperCharts'
CONNECT_PATH = r'../'
HEADER_PATH = r'../../../Scrapers/Download Images'
GAME_PATH = r'../Objects'
sys.path.extend(
	[
		STANDBY_PATH,
		CONNECT_PATH,
		HEADER_PATH,
		GAME_PATH
		]
	)
import steam_header
import steam_connection_db as connectdb
import steam_game_db as gamedb
import steam_app_db as appdb



#Initializing logger
logger = logging.getLogger('StandbyMaintenance')
logger.setLevel(logging.DEBUG)
st_format = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter = logging.Formatter()
file_handler = logging.FileHandler('standby_maintenance.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Opening stanby.csv
def getStandbyCSV() -> list:
	##Documentation
	"""
	Opens standby.csv and retrieves all appid from its 
	first column. Returns a list of all appids.
	"""
	
	##Retrieving appid list from standby.csv
	os.chdir(STANDBY_PATH)
	with open('standby.csv','r',newline='') as standby_doc:
		reader = csv.reader(standby_doc,delimiter=';')
		standby_list = [row[0] for row in reader]
	return standby_list



#Retrieving games from SteamDB
def getStandbyDB() -> list:
	##Documentation
	"""
	Retrives all Steamgame objects from steamgames collection
	with priority set to true.
	"""

	#Retriving games with priority set to true from SteamDB
	game_list = gamedb.SteamGame.objects(priority=True).all()
	game_list = [game.appid for game in game_list]

	return game_list



#Grouping games
def groupGames(csv_list: list, db_list: list) -> tuple:
	##Documentation
	"""
	According to their appearance within the two given lists
	all games are classified into 3 groups (see this module's
	description for more information).

	Arguments
	---------
	csv_list : list
		List of game appids retrived from standby.csv.

	db_list : list
		List of game appids retrived from SteamDB.
	"""

	##Transforming lists into sets
	csv_set = set(csv_list)
	db_set = set(db_list)
	
	##Using set theory operations to separate the 3 groups
	new_list = list(csv_set.difference(db_set))
	old_list = list(csv_set.intersection(db_set))
	stagnant_list = list(db_set.difference(csv_set))

	return (new_list, old_list, stagnant_list)



#Checking if new games are in DB
def groupNew(new_games: list) -> tuple:
	##Documentation
	"""
	Separates games in those which already exits in SteamDB and
	those which do not.

	Arguments
	---------
	new_games: list
		List of new games.
	"""

	new_in = []
	new_out = []

	for appid in new_games:
		if gamedb.SteamGame.objects(appid=appid).first()!=None:
			new_in.append(appid)
		else:
			new_out.append(appid)

	return new_in, new_out





#Assigning information
##New games (not in DB)
def assignNewOut(appid: str) -> None:
	###Documentation
	"""
	Assigns information to new standby games (see this
	module's description) which aren not found in SteamDB.
	The process is divided in the following steps:
	
	1. 	Retrieving the game's SteamApp object from steamapps
		collection.
	
	2. 	Creating a SteamGame object from steamgames collection.

	3. 	Reading all the necessary data from the SteamApp object
		and writting it into the SteamGame object.

	4.	Downloading the thumbnail for the game. Using the main
		function from steam_header.

	5.	Setting the SteamGame's priority field to True.

	6.	Saving the SteamGame object.

	
	Arguments
	---------
	appid: str
		A string object containing the appid of the game.
	"""

	###Retrieving app and creating game
	steamapp = appdb.SteamApp.objects(appid=appid).first()
	steamgame = gamedb.SteamGame()

	###Assigning characteristics to game
	steamgame.appid = steamapp.appid
	steamgame.name = steamapp.name
	steamgame.release = steamapp.release_date
	steamgame.score = 1
	
	###Downloading and assigning thumbnail
	steamgame.image = steam_header.main(appid)
	
	###Changing priority to true
	steamgame.priority = True

	steamgame.save()



##New games (in DB)
def assignNewIn(appid: str) -> None:
	###Documentation
	"""
	Assigns information to new standby games (see this
	module's description) which are not found in SteamDB.
	Finds the game in SteamDB and changes its priority to True.

	Arguments
	---------
	appid: str
		A string object containing the appid of the game.
	"""

	###Retrieving game from db and changing priority
	steamgame = gamedb.SteamGame.objects(appid=appid).first()
	steamgame.priority = True
	steamgame.save()



##Stagnant games
def assignStagnant(appid: str) -> None:
	###Documentation
	"""
	Assigns information to stagnant games (see this module's
	description). Finds the game in SteamDB and sets its priority
	to false.

	Arguments
	---------
	appid: str
		A string object containing the appid of the game.
	"""

	###Retrieving game
	steamgame = gamedb.SteamGame.objects(appid=appid).first()

	##Changing priority
	steamgame.priority = False

	steamgame.save()



##Old standby games
def assignOld(appid: str) -> None:
	###Documentation
	"""
	Assigns information to old standby games (see this module's
	description). Finds the game in SteamDB and refreshes its
	score.

	Arguments
	---------
	appid: str
		A string object containing the appid of the game.
	"""

	###Retrieving game
	steamgame = gamedb.SteamGame.objects(appid=appid).first()

	###Refreshing score
	N = len(steamgame.monitored)
	T = datetime.datetime.now() - steamgame.release
	T = T.days
	steamgame.score = ((T*N)**(1/3)+1)**(-1)

	steamgame.save()



#Main
def main():
	connectdb.register_connection('SteamDB','SteamDB')

	standby_list = getStandbyCSV()
	db_list = getStandbyDB()

	partitioned = groupGames(standby_list,db_list)
	new_list, old_list, stagnant_list = partitioned
	new_in, new_out = groupNew(new_list)

	[assignNewIn(appid) for appid in new_in]
	[assignNewOut(appid) for appid in new_out]
	[assignOld(appid) for appid in old_list]
	[assignStagnant(appid) for appid in stagnant_list]



#Execution
if __name__ == '__main__':
	main()