#Description
"""
Uses an algorithm based on concurrent players and
statistical gameplay measures to approximate the owners
of a game. Requires a SteamGame object with a players
and total_gameplay tables.
"""
__author__='Óscar Gómez Nonnato'
__date__='07/01/2020'



#Libraries
##Standard
import sys
import logging
import numpy as np
import datetime as dt

##Local
OBJECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB\Objects'
sys.path.append(OBJECT_PATH)
import steam_game_db as gamedb
import steam_getters_db as getterdb




#Starting logger
logger=logging.getLogger('OwnerGetter')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('OwnersGetter.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Getting players and total_gameplays
def get_game_data(steamgame: gamedb.SteamGame) -> gamedb.SteamGame:
	##Description
	"""
	Returns all useful data for owners calcultions from a SteamGame
	object.

	Parameters
	----------
	steamgame: steam_game_db.SteamGame
		SteamGame instance from steam_game_db
	"""

	##Getting concurrent players and gameplay information
	players=steamgame.players
	total_g_av=steamgame.gameplay_user_total_av
	total_g_me=steamgame.gameplay_user_total_me
	return (players, total_g_av, total_g_me)



#Formating players timetable
def slice_fill_players(
	players: list,
	start: dt.datetime,
	end: dt.datetime
	) -> list:
	##Description
	"""
	Slices the players list from a start to an ending date. If there 
	are empty points in the players timetable they will be filled with
	the average players between the surrouding points. If more than 
	two consecutive points are empty, a ValueError is raised.

	Parameters
	----------
	players: list
		SteamGame.players field, points must come in the format
		(datetime.datetime(...),int).

	start: datetime.date
		Starting date

	end: datetime.date
		Ending date
	"""

	##Transforming points tuples into lists
	players=[list(pt) for pt in players]

	##Ajusting players list to timeperiod
	start_index=0
	end_index=np.infty
	for i,pt in enumerate(players):
		if pt[0]<start:
			start_index=i+1
		elif pt[0]<end:
			end_index=i+2
		else:
			pass
	players=players[start_index:end_index]

	##Searching for consecutive empty points
	for i,pt in enumerate(players[:-1]):
		if pt[1]=='' and players[i+1][1]=='':
			raise ValueError(
				"""
				Two consecutive empty points in players timetable:
				{}, {}
				""".format(pt,players[i+1]))
	
	##Checking for empty points in first and last position
	if players[0][1]=='':
		raise ValueError(
			"""
			First position in players list is empty: {}
			""".format(players[0])
			)
	if players[-1][1]=='':
		players[-1][1]=players[-2][1]
	
	##Filling empty points
	for i,pt in enumerate(players):
		if pt[1]=='':
			players[i][1]=(players[i-1][1]+players[i+1][1])/2

	return players



#Calculate average players for a given timeperiod
def calculate_averages(
	players: list,
	date_period: dt.timedelta
	) -> list:
	##Description
	"""
	Calculates the averages for the players timetables within each
	dateperiod.

	Parameters
	----------
	players: list
		SteamGame.players field, points must come in the format
		(datetime.datetime(...),int).

	date_period: datetime.timedelta
		Periods of time to group and average all points in players.
	"""

	##Grouping the players list points in within a date_period
	grouped_players=[]
	current_group=[]
	current_period=players[0][0]+date_period
	for pt in players:
		if pt[0]<current_period:
			current_group.append(pt[1])
		else:
			current_period+=date_period
			grouped_players.append(current_group)
			current_group=[pt[1]]
	grouped_players.append(current_group)

	##Calculating average players for each date_period
	players=[sum(group)/len(group) for group in grouped_players]

	return players



#Calculating owners
def calculate_owners(
	av_p : int,
	g : int,
	dp : int
	) -> int:
	##Documentation
	"""
	Uses an algorithm based on avergae players and gameplay to
	aproximate the number of new owners.

	Parameters
	----------
	av_p: int
		Averge number of new players during the timeperiod, it
		is the diference between the average total players and
		the average old players based on gameplay data.

	g: int
		Gameplay time for new players.

	dp: int
		Timeperiod in which the new owners are estimated. 
	"""

	##Calculating new owners
	return dp*av_p/g*(1+g/dp*(np.e(-dp/g)-1))**(-1)



#Calculating players evolution
def calculate_players(
	p_0 : int,
	g : int,
	r : int,
	dp : int
	) -> int:
	##Documentation
	"""
	"""

	##
	return (p_0-r*g)*np.e(-dp/g)+r*g



#Calculating average players evolution
def calculate_av_players(
	p_0 : int,
	g : int,
	r : int,
	dp : int
	) ->int:
	##Documentation
	"""
	"""

	##
	return g/dp*(p_0-r*g)*(1-np.e(-dp/g))+r*g