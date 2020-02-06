#Description
"""
All operation related with getting information from instances in
SteamDB using mongoengine. All the funtions in this module may be used 
into more complex aplications, or applied individually when manual
changes are needed.
"""
__author__='Óscar Gómez Nonnato'



#Libraries
##Standard
import os
import sys
import json
import logging

##Packages
import mongoengine

##Local
OBJECT_PATH='../Objects'
sys.path.append(OBJECT_PATH)
import steam_app_db
import steam_user_db
import steam_game_db



#Steam App basic getter
def steam_app_getter(
	appid: str,
	logger: logging.Logger
	) -> steam_app_db.SteamApp:
	##Documentation
	"""
	Gets a SteamApp object (see steam_app_db documentation) 
	from SteamDB using its Steam id.

	Parameters
	----------
	appid: str
		Steam id of the app.

	logger: logging.Logger
		Logger object that registers every operation in the db.
	"""
	
	##Getting App from db
	SteamApp=steam_app_db.SteamApp.objects(appid=appid).first()
	logger.info('Retrieving app {} from db'.format(appid))
	return  SteamApp



#Steam User basic getter
def steam_user_getter(
	steamid: str,
	logger: logging.Logger
	) -> steam_user_db.SteamUser:
	##Documentation
	"""
	Gets a SteamUser object (see steam_user_db documentation)
	from SteamDB using its Steam community id.

	Parameteres
	-----------
	steamid: str
		Steam community id for the user.

	logger: logging.Logger
		Logger object that registers every operation in the db.
	"""

	##Getting User from db
	SteamUser=steam_user_db.SteamUser.objects(steamid=steamid).first()
	logger.info('Retrieving user {} from db'.format(steamid))
	return SteamUser



#Steam Games basic getter
def steam_game_getter(
	appid: str,
	logger: logging.Logger
	) -> steam_game_db.SteamGame:
	##Documentation
	"""
	Gets a SteamGame object (see steam_game_db documentation)
	from SteamDB using its Steam id.

	Parameters
	appid: str
		Steam id for the game.

	logger: logging.Logger
		Logger object that registers every operation in the db.
	----------
	"""

	##Getting game from db
	steamgame=steam_game_db.SteamGame.objects(appid=appid).first()
	logging.info('Retrieving game {} from db'.format(appid))
	return steamgame



#Getting stagnant all games ids
def steam_game_get_i_appid() -> list:
	##Documentation
	"""
	Retrieves a list of all inactive Steam games ids
	"""	
	appid_list=steam_game_db.SteamGame\
		.objects()\
		.filter(current_state='i')\
		.order_by('last_checked')\
		.only('appid')
	return appid_list



#Steam Gameplays getter
def steam_get_gameplays(
	appid: str,
	logger: logging.Logger
	) -> list:
	##Documentation
	"""
	Searches a game's monitored users and returns a list of all
	recorded gameplays.

	Parameteres
	-----------
	appid: str
		Steam id for the game

	logger: logging.Logger
	 	Logger object that records any operations in the db
	"""

	##Getting the monitored users of a game
	SteamGame=steam_game_db.SteamGame.objects(appid=appid).first()
	UseridList=SteamGame.monitored
	SteamUserList=steam_user_db.SteamUser.objects(userid__in=UseridList).all()
	logger.debug(SteamUserList)

	##Extracting gameplays from the monitored users
	GameplayList=[]
	for SteamUser in SteamUserList:
		for Game in SteamUser.monitored:
			if Game.appid==appid:
				GameplayList.append(Game)
	logger.info('Gameplay data from game {} correctly retrieved'.format(appid))
	return GameplayList
