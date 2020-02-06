#Description
"""
Gets appids from downloaded files, looks for players, prices and
ratings and pushes all the data into SteamDB
"""
__author__='Óscar Gómez Nonnato'
__date__='31/12/2019'



#Libraries
##Standard
import os
import re
import sys
import csv
import logging
import platform
import datetime as dt

##Local
CONNECT_PATH='../'
GETTER_PATH='../Getters'
OBJECT_PATH='../Objects'
sys.path.extend([CONNECT_PATH,GETTER_PATH,OBJECT_PATH])
import steam_setters_db as setterdb
import steam_getters_db as getterdb
import steam_game_db as gamedb
import steam_connection_db as connectdb



#Initializing logger
logger=logging.getLogger('PricesPlayersDB')
logger.setLevel(logging.INFO)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('prpl_push.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Finding pattern in dir
def find_pattern(
	path: str,
	appid: str,
	pattern: 'function',
	) -> str:
	##Documentation
	"""
	Searches a given pattern for a steam app within the names of
	a directory. If no match is found returns none, otherwise it
	will return an str object with the name of the document.

	Parameters
	----------
	path (str):
		Directory to search

	appid: str
		Steam id of the searched app

	pattern: func
		Pattern that the app's document must match, it must
		accept appid as its first argument and a document name
		as its second. Returns a bool object. 
	"""

	##Accessing directory and listing documents
	os.chdir(path)
	doclist=os.listdir()

	##Searching for pattern in every document
	matchlist=[]
	for doc in doclist:
		if pattern(appid,doc):
			matchlist.append(doc)

	##Logging/returning results
	if len(matchlist) == 0:
		logger.error('No match for {}'.format(appid))
		return None
	elif len(matchlist) == 1:
		return matchlist[0]
	else:
		logger.warning(
			"""
			{} matches for {}, returning first match
			""").format(len(matchlist),appid)
		return matchlist[0]



#Price pattern
def price_pattern(
	appid: str,
	doc: str
	) -> bool:
	##Documentation
	"""
	Uses the match function from the re standard library to
	match a document name with the price pattern. Returns True
	if the match function returns and object and if appid is
	in the document, if not returns False.

	Parameters
	----------
	appid: str
		Steam id for the app.

	doc: str
		Document name
	"""

	##Matching pattern
	PRICE_MATCH=re.compile(r'price-history-for-[0-9]*\.csv')
	is_match=PRICE_MATCH.match(doc)

	if is_match and appid in doc:
		return True
	else:
		return False



#Player pattern
def player_pattern(
	appid: str,
	doc: str
	) -> bool:
	##Documentation
	"""
	Uses the match function from the re standard library to
	match a document name with the price pattern. Returns True
	if the match function returns and object and if appid is
	in the document, if not returns False.

	Parameters
	----------
	appid: str
		Steam id for the app.

	doc: str
		Document name
	"""

	##Matching pattern
	PLAYER_MATCH=re.compile(r'[0-9]*_Players\.csv')
	is_match=PLAYER_MATCH.match(doc)

	if is_match and appid in doc:
		return True
	else:
		return False



#Getting timetables
def get_timetable(doc: str) -> list:
	##Documentation
	"""
	Opens csv document and changes data into the timetable format of
	SteamDB. Returns a list of tuples of datetime objects and prices
	or players.

	Parameters
	----------
	doc: str
		Name of the csv where the data is stored
	"""

	##Opening document and saving data into tuples
	with open(doc,'r',newline='') as timedoc:
		reader=csv.reader(timedoc,delimiter=';')
		next(reader,None)
		PRF='%Y-%m-%d %H:%M:%S'
		PLF='%d-%m-%Y %H:%M:%S'
		try:
			tt=[(dt.datetime.strptime(r[0],PRF),r[1]) for r in reader]
		except ValueError:
			tt=[(dt.datetime.strptime(r[0],PLF),r[1]) for r in reader]


	##Deleting document and returning timetable
	os.remove(doc)
	print(tt)
	return tt



#Getting ratings
def get_ratings(
	path: os.path,
	doc: str
	) -> dict:
	##Documentation
	"""
	Opens a register for downloaded documents and returns a
	dictionary with all appids as keys and a tuple with the
	good and bad ratings.

	Parameters
	----------
	path: os.path
		Path where the register is located

	doc: str
		Name of the register document
	"""

	##Opening register and extracing ratings
	with open(doc,'r',newline='') as regdoc:
		reader=csv.reader(regdoc,delimiter=';')
		ratings={r[0]:(r[1],r[2]) for r in reader}
	empty_file=open(doc,'w+')
	empty_file.close()
	return ratings



#Main
def main():
	##Documentation
	"""
	Module's main funciton, searches all games which prices/players
	tables have been downloaded, gets their appids and ratings and
	searches for their price/players timetables within a diretory.
	Modifies the csv format of the timetables into the standard
	format for SteamDB and sets each game attributes with the 
	results.
	"""
	##Connecting to db
	connectdb.register_connection('SteamDB','SteamDB')

	##Steam db scraper dirs
	DOWNLOAD_PATH='../../../Scrapers/ScraperDB'
	PRICE_PATH='./Prices'
	PLAYER_PATH='./Players'

	##Getting ratings
	os.chdir(DOWNLOAD_PATH)
	ratings=get_ratings(DOWNLOAD_PATH,'downloaded.csv')

	##Getting price/players timetables and modifying steamgame
	for appid in ratings.keys():
		###Getting steamgame
		steamgame=getterdb.steam_game_getter(appid,logger)
		
		###Searching, getting and setting price timetable
		price_doc=find_pattern(PRICE_PATH,appid,price_pattern)
		if price_doc:
			timetable=get_timetable(price_doc)
			steamgame=setterdb.steam_game_timeseries_setter(
				steamgame,
				timetable,
				'prices',
				logger)
		os.chdir('../')

		###Searching, getting and setting players timetable
		player_doc=find_pattern(PLAYER_PATH,appid,player_pattern)
		if player_doc:
			timetable=get_timetable(player_doc)
			steamgame=setterdb.steam_game_timeseries_setter(
				steamgame,
				timetable,
				'players',
				logger)
		else:
			logger.warning('{} has not players timetable'.format(appid))
		os.chdir('../')

		###Setting game ratings
		timeseries=(
			dt.datetime.now(),
			ratings[appid][0],
			ratings[appid][1]
			)
		steamgame.ratings.append(timeseries)
		
		###Saving game in db
		setterdb.steam_game_save(steamgame)