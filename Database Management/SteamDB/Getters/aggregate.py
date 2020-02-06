#Description
"""
This module is aimed to aggregate all gameplay information from users
whose gameplay has been registered. Its main function takes a SteamGame
object as argument and returns the average and median gameplay in each
platform and in all platforms at once.
"""
__author__='Óscar Gómez Nonnato'



#Libraries
##Standard
import sys
import logging
import datetime
import statistics

##Local
OBJECT_PATH = '../Objects'
SETTER_PATH = '../Setters'
sys.path.extend([SETTER_PATH, OBJECT_PATH])
import steam_game_db as gamedb
import steam_getters_db
import steam_setters_db



#Additional functions
##Calculating intervals from user tuples
def calculate_intervals(
	tuple_list: list,
	date_list: list,
	gameplay_list: list,
	FirstDate: datetime.datetime,
	SstGameplay: int,
	date_period: datetime.timedelta,
	user_period: int
	) -> tuple:
	for i,tuple_ in enumerate(tuple_list):
		IndexDate=int((tuple_[0]-FirstDate)/date_period)
		IndexGameplay=int((tuple_[1]-SstGameplay)/user_period)
		if i+1<=len(tuple_list)-1:	
			TimeGameplay=tuple_list[i+1][1]-tuple_[1]
			date_list[IndexDate].append(TimeGameplay)
			gameplay_list[IndexGameplay].append(TimeGameplay)

	return (date_list,gameplay_list)


##Aggregating all gameplay intervals
def aggregate_intervals(tuple_list: list) -> list:
	AvList=[]
	MeList=[]
	for Intervals in tuple_list:
		if len(Intervals[1:])>1:
			AvList.append((Intervals[0],sum(Intervals[1:])/len(Intervals[1:])))
			MeList.append((Intervals[0],statistics.median(Intervals[1:])))
	return (AvList,MeList)


##Finding extreme in all gameplay lists
def find_extreme(
	gameplay_list: list,
	extreme: str,
	index: int
	):
	if extreme=='max':
		return max((max((playtime[index] for playtime in gameplay.total_gameplay)) for gameplay in gameplay_list))
	elif extreme=='min':
		return min((min((playtime[index] for playtime in gameplay.total_gameplay)) for gameplay in gameplay_list))
	else:
		return None



#Aggregate main function
def main(
	SteamGame: gamedb.SteamGame,
	date_period: datetime.timedelta,
	user_period: int,
	logger: logging.Logger
	) -> list:
	appid=SteamGame.appid
	GameplayList=steam_getters_db.steam_get_gameplays(appid,logger)
	if GameplayList==[]:
		raise ValueError(
			"""
			No gameplays found for Game {}
			""".format(SteamGame.appid)
			)
	
	FirstDate=find_extreme(GameplayList,'min',0)
	FinalDate=find_extreme(GameplayList,'max',0)
	SstGameplay=find_extreme(GameplayList,'min',1)
	LstGameplay=find_extreme(GameplayList,'max',1)

	DateVector=[]
	CurrentDate=FirstDate
	while CurrentDate<=FinalDate:
		DateVector.append([CurrentDate])
		CurrentDate+=date_period
	GameplayVector=[[Gameplay] for Gameplay in range(SstGameplay,LstGameplay+user_period,user_period)]

	TotalDateList=DateVector
	WinDateList=DateVector
	MacDateList=DateVector
	LinDateList=DateVector

	TotalGameList=GameplayVector
	WinGameList=GameplayVector
	MacGameList=GameplayVector
	LinGameList=GameplayVector

	for Gameplay in GameplayList:
		TotalDateList, TotalGameList=calculate_intervals(Gameplay.total_gameplay,TotalDateList,TotalGameList,FirstDate,SstGameplay,date_period,user_period)
		WinDateList, WinGameList=calculate_intervals(Gameplay.win_gameplay,WinDateList,WinGameList,FirstDate,SstGameplay,date_period,user_period)
		MacDateList, MacGameList=calculate_intervals(Gameplay.mac_gameplay,MacDateList,MacGameList,FirstDate,SstGameplay,date_period,user_period)
		LinDateList, LinGameList=calculate_intervals(Gameplay.lin_gameplay,LinDateList,LinGameList,FirstDate,SstGameplay,date_period,user_period)

	TotalDateList_av, TotalDateList_me=aggregate_intervals(TotalDateList)
	WinDateList_av, WinDateList_me=aggregate_intervals(WinDateList)
	MacDateList_av, MacDateList_me=aggregate_intervals(MacDateList)
	LinDateList_av, LinDateList_me=aggregate_intervals(LinDateList)
	
	TotalGameList_av, TotalGameList_me=aggregate_intervals(TotalGameList)
	WinGameList_av, WinGameList_me=aggregate_intervals(WinGameList)
	MacGameList_av, MacGameList_me=aggregate_intervals(MacGameList)
	LinGameList_av, LinGameList_me=aggregate_intervals(LinGameList)

	
	SteamGame.gameplay_date_total_av=TotalDateList_av
	SteamGame.gameplay_date_win_av=WinDateList_av
	SteamGame.gameplay_date_mac_av=MacDateList_av
	SteamGame.gameplay_date_lin_av=LinDateList_av

	SteamGame.gameplay_user_total_av=TotalGameList_av
	SteamGame.gameplay_user_win_av=WinGameList_av
	SteamGame.gameplay_user_mac_av=MacGameList_av
	SteamGame.gameplay_user_lin_av=LinGameList_av

	SteamGame.gameplay_date_total_me=TotalDateList_me
	SteamGame.gameplay_date_win_me=WinDateList_me
	SteamGame.gameplay_date_mac_me=MacDateList_me
	SteamGame.gameplay_date_lin_me=LinDateList_me

	SteamGame.gameplay_user_total_me=TotalGameList_me
	SteamGame.gameplay_user_win_me=WinGameList_me
	SteamGame.gameplay_user_mac_me=MacGameList_me
	SteamGame.gameplay_user_lin_me=LinGameList_me

	return SteamGame