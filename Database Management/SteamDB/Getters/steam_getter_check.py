#Description
"""
This module will search in SteamDB for unchecked games
(with their checked fields set to false) and place some
of them in to_check.csv, to be reviewed by 
SteamCharts_products.py. If all games in SteamDB have
been checked all the checked fields will reset to false.
"""
__author__='Óscar Gómez Nonnato'
__date__='03/01/2020'



#Libraries
##Standard
import os
import sys
import csv
import logging
import datetime

##Local
CONNECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB'
SETTERS_PATH=CONNECT_PATH+r'\Setters'
sys.path.extend([CONNECT_PATH,SETTERS_PATH])
import steam_connection_db as connectdb
import steam_getters_db as getterdb
import steam_setters_db as setterdb
import steam_game_db as gamedb



#Initializing logger
logger=logging.getLogger('CheckedDB')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('checklist.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Reading checklist from csv
def read_checklist(db_path: os.path) -> list:
	##Documentation
	"""
	Reads checklist.csv and returns a list of steamgame ids.
	
	Parameteres
	-----------
	db_path: os.path
		Path to the checklist folder 
	"""

	##Accessing checklist and getting appid list
	os.chdir(db_path)
	with open('checklist.csv','r',newline='') as check_csv:
		reader=csv.reader(check_csv,delimiter=';')
		checklist=[row[0] for row in reader]
	return checklist



#Writting in checklist csv
def write_checklist(
	checklist: list,
	db_path: os.path
	) -> None:
	##Documentation
	"""
	Rewrites the entire checklist.csv document with a given list of
	steamgame ids.

	Parameters
	----------
	checklist: list
		List of steam games to check

	db_path: os.path
		Path to the checklist folder
	"""

	##Accesing checklist in database directory
	os.chdir(db_path)
	with open('checklist.csv','w',newline='') as check_csv:
		writer=csv.writer(check_csv,delimiter=';')
		for appid in checklist:
			writer.writerow([appid])



#Writting in to check csv
def write_to_check(
	tuple_list: list,
	scraper_path: os.path
	) -> None:
	##Documentation
	"""
	Writtes the given data in to_check.csv. 

	Parameters
	----------
	tuple_list: dict
		List of tuples with information about the game's last
		stagnation timeperiod, each tuple has three elements,
		the firts one is a steam game id, the second and the
		third are the average number of players and the standard
		deviation. 

	scraper_path: os.path
		Path to the to_check.csv document
	"""

	##Writting new games to check
	os.chdir(scraper_path)
	with open('to_check.csv','a',newline='') as to_check_csv:
		writer=csv.writer(to_check_csv,delimiter=';')
		for tuple_ in tuple_list:
			writer.writerow(tuple_)



#Getting game last period and the statistical measures
def check_last_period(appid: str) -> bool:
	##Documentation
	"""
	Finds the latest registred TimePeriod object within a Steamgame
	instance from steam_game_db and checks if status is 's'. If the
	condition is met returns a tuple with the appid, the average and
	the standard deviation. If the last period status is not 's' 
	(or no registered periods are found) returns None.

	Parameters
	----------
	appid: str
		Steam id for the game
	"""

	##Getting steamgame
	steamgame=getterdb.steam_game_getter(appid,logger)
	steamgame.last_checked=datetime.datetime.now()
	steamgame.save()
	
	##Finding latest period
	if steamgame.periods!=[]:
		lt_period=steamgame.periods[0]
		for period in steamgame.periods:
			if period.end>lt_period.end:
				lt_period=period
		if lt_period.status=='s':
			return (
				appid,
				lt_period.average_players,
				lt_period.deviation_players
				)
		else:
			logger.warning(
				"""
				Latest registered timeperiod {} for {} was not a
				stagnation period
				""".format(lt_period.period_id,appid))
			return None
	else:
		logger.warning(
			"""
			No timeperiods registered for {}
			""".format(appid))
		return None



#Main
def main():
	##Documentation
	"""
	The module's main function. Loads an steamgame id list from 
	checklist.csv. For every appid in the list checks for the latest
	registered period, if it is a stagnation period the information
	is stored in a tuple list and latter introduced in to_check.csv
	for a stagnation check. The checked appid are erased from 
	checklist.csv, if it empties before the daily number of db queries
	is met checklist.csv is rested, with new games.
	"""

	##Constants
	DB_PATH=CONNECT_PATH+r'\Getters'
	SCRAPER_PATH=CONNECT_PATH+r'\Getters'
	DB_PATH=os.path.normpath(DB_PATH)
	SCRAPER_PATH=os.path.normpath(SCRAPER_PATH)
	DAILY_CHECKS=49

	##Steam id lists
	checklist=read_checklist(DB_PATH)
	logger.debug('Main checklist: {}'.format(checklist))
	scraplist=[]
	count=0

	##Checking last game period for every game in checklist
	while count<DAILY_CHECKS:
		###Refilling checklist.csv when checklist is empty
		if checklist==[]:
			checklist=getterdb.steam_game_get_i_appid()
			logger.info(
				"""
				Checklist is empty, loading new games
				"""
				)
			break
		###Checking last timeperiod and getting stats tuple
		else:
			appid=checklist.pop(0)
			game_tuple=check_last_period(appid)
			if game_tuple!=None:
				scraplist.append(game_tuple)
				count+=1
			else:
				continue

	##Writting results in files
	write_to_check(scraplist,SCRAPER_PATH)
	write_checklist(checklist,DB_PATH)



#Execution
if __name__=='__main__':
	main()

