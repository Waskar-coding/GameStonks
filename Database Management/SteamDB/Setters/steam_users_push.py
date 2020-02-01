#Description
"""
This script searches for new users in
monitored_users.json and registers them in SteamDB.
It also will add the gameplays of the already
registered users.
"""
__author__='Óscar Gómez Nonnato'
__date__='09/01/2020'



#Libraries
##Standard
import os
import sys
import csv
import json
import logging
import datetime

##Local
CONNECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB'
OBJECT_PATH=CONNECT_PATH+r'\Objects'
GETTER_PATH=CONNECT_PATH+r'\Getters'
sys.path.extend([CONNECT_PATH,OBJECT_PATH,GETTER_PATH])
import steam_connection_db as connectdb
import steam_game_db as gamedb
import steam_user_db as userdb
import steam_setters_db as setterdb
import steam_getters_db as getterdb



#Initializing loggers
##Gamelogger
gamelogger=logging.getLogger('GameplayPush')
gamelogger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('gameplay_push.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
gamelogger.addHandler(file_handler)

##Userlogger
userlogger=logging.getLogger('UserPush')
userlogger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('user_push.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
userlogger.addHandler(file_handler)



#Getting steamid list from monitored_users.json
def get_userlist(monitored_path : os.path) -> list:
	##Documentation
	"""
	Gets a list of user from the temporary file monitored_users.json

	Parameters
	----------
	monitored_path: os.path
		Path to monitored_users.json
	"""

	##Opening monitored_users.json and retrieving user_list
	os.chdir(monitored_path)
	with open('monitored_users.json','r') as user_doc:
		user_list=list(json.load(user_doc)['profiles'].keys())
	return user_list



#Checking which users are registered on SteamDB
def check_userlist(user_list : list) -> list:
	##Documentation
	"""
	Checks SteamDB and separates all profiles from a given user_list
	into new and old. Returns a list of new and old profiles.

	Parameters
	----------
	user_list: list
		List of profiles userids from monitored_users.json
	"""

	##Getting list of registered users
	old_user_list=userdb.SteamUser\
		.objects(userid__in=user_list).all()
	old_user_list=[profile.steamid for profile in old_user_list]

	##Getting list of new users
	new_user_list=list(set(user_list)\
		.difference(set(old_user_list)))

	return (old_user_list,new_user_list)



#Getting standby games
def get_gamelist(game_path : os.path) -> list:
	##Documentation
	"""
	Gets the list of standby games from standby.csv in a given
	directory.

	Parameters
	----------
	game_path : os.path
		Path to standby.csv directory 
	"""

	##Extracting monitored games from standby.csv
	os.chdir(game_path)
	with open('standby.csv','r',newline='') as game_doc:
		reader=csv.reader(game_doc,delimiter=';')
		game_list=[row[0] for row in reader]

	return game_list


#Registering new users
def register_new(
		new_user_list : list,
		game_list : list
		) -> None:
	##Documentation
	"""
	Registers all new users in SteamDB, including all their gameplay
	registers if the users have a register for any of the standy
	games their steamid is added to the monitored attribute of the
	game's SteamGame object monitored attribute.

	Parameters
	----------
	new_user_list : list
		A list with all new users userids.

	game_list : list
		A list with all standby games.
	"""

	##Retrieving monitored_users json
	with open('monitored_users.json','r') as user_doc:
		user_json=json.load(user_doc)['profiles']

	##Registering new users
	for steamid in new_user_list:
		###Unpacking user attributes
		user_dict=user_json[steamid]
		new_user=userdb.SteamUser()
		new_user.steamid=steamid
		new_user.game_count=user_dict['game_count']
		new_user.game_list=user_dict['game_list']

		###Finding user's monitored games
		user_gamelist=set(game_list)\
			.intersection(set(user_dict.keys()))

		###Registering monitored games
		for appid in user_gamelist:
			####Creating a register object
			register=userdb.GameplayRegister()
			
			####Unpacking gameplay register
			today=datetime.datetime.now()
			total_g=user_dict[appid]['playtime_forever']
			win_g=user_dict[appid]['playtime_windows_forever']
			mac_g=user_dict[appid]['playtime_mac_forever']
			lin_g=user_dict[appid]['playtime_linux_forever']

			####Assigning data to register fields
			register.appid=appid
			register.total_gameplay.append((today,total_g))
			register.win_gameplay.append((today,win_g))
			register.mac_gameplay.append((today,mac_g))
			register.lin_gameplay.append((today,lin_g))

			####Introducing register in user
			new_user.monitored.append(register)

			####Adding steamid to monitored list
			steamgame=gamedb.SteamGame.objects(appid=appid).first()
			steamgame.monitored.append(appid)
			steamgame.save()

		###Saving user
		new_user.save()



#Modifiying old users
def register_old(
	old_user_list : list,
	game_list : list
	) -> None:
	##Documentation
	"""
	Adds appends new points to old users gameplays.

	Parameters
	----------
	old_user_list : list
		List of users registered in SteamDB found in
		monitored_users.json.

	game_list : list
		List of games from standby.csv.
	"""

	##Retrieving monitored_users json
	with open('monitored_users.json','r') as user_doc:
		user_json=json.load(user_doc)['profiles']

	##Registering new gameplays for every user
	for steamid in old_user_list:
		steamuser=userdb.SteamUser.objects(steamid=steamid)
		user_dict=user_json[steamid]
		user_gamelist=set(game_list)\
			.intersection(set(user_dict.keys()))
		
		for appid in user_gamelist:
			total_g=user_dict[appid]['playtime_forever']
			win_g=user_dict[appid]['playtime_windows_forever']
			mac_g=user_dict[appid]['playtime_mac_forever']
			lin_g=user_dict[appid]['playtime_linux_forever']
			setterdb.steam_user_addgameplay(
				steamid,
				appid,
				total_g,
				win_g,
				mac_g,
				lin_g,
				gamelogger,
				userlogger
				)



#Main function
def main():
	MONITORED_PATH = r'C:\Users\mcnon\OneDrive\Escritorio'\
		r'\Proyecto Owners\Scrapers\ScraperUsersAPI'
	STANDBY_PATH = r'C:\Users\mcnon\OneDrive\Escritorio'\
		r'\Proyecto Owners\Scrapers\ScraperCharts'
	MONITORED_PATH = os.path.normpath(MONITORED_PATH)
	STANDBY_PATH = os.path.normpath(STANDBY_PATH)

	user_list = get_userlist(MONITORED_PATH)
	game_list = get_gamelist(STANDBY_PATH)
	os.chdir(MONITORED_PATH)

	old_user_list, new_user_list = check_userlist(user_list)
	register_new(new_user_list,game_list)
	register_old(old_user_list,game_list)



#Execution
if __name__ == '__main__':
	main()
