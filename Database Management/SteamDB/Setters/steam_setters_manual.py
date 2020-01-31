#Description
"""
This module contains all functions used to manually asing a property
for an instance in SteamDB.
"""
__author__='Óscar Gómez Nonnato'



#Libraries
##Standard
import sys
import logging
import datetime

##Local
OBJECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB\Objects'
GETTER_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB\Getters'
sys.path.extend([OBJECT_PATH,GETTER_PATH])
import steam_getters_db as getterdb
import steam_setters_db as setterdb
import steam_game_db as gamedb
import aggregate



#Starting logger
logger=logging.getLogger('ManualSetter')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('ManualSetter.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#SteamGame timperiod setter
def steam_game_timeperiod_setter_menu(
	steamgame: gamedb.SteamGame,
	logger: logging.Logger
	) -> gamedb.SteamGame:
	##Documentation
	"""
	When called asks the user to manually input all data associated
	with a timeperiod. Once all the data has been collected it uses
	the function steam_game_timeperiod_setter from steam_setter_db
	to modify a passed SteamGame instance from steam_game_db. Returns
	modified SteamGame.

	Parameters
	----------
	steamgame: steam_game_db.SteamGame
		SteamGame instance we wish to modify 
	"""

	##Setting key attributes
	appid=steamgame.appid
	print('Setting new timeperiod for {}'.format(appid))
	period_id=input('\t- period_id: ')
	status=input('\t- status: ')
	start=input('\t- start (day/month/year): ')
	end=input('\t- end (day/month/year): ')

	##Formatting dates
	start=datetime.datetime.strptime(start,'%d/%m/%Y').date()
	end=datetime.datetime.strptime(end,'%d/%m/%Y').date()

	##Calculating statistical measures
	players=steamgame.players
	player_vector=[]
	if players!=[]:
		for tuple_ in players:
			date, players = tuple_
			if date>=start and date<end:
				player_vector.append(players)
		if len(player_vector)<2:
			print(
				"""
				No players timetable data for {} during 
				this period
				""".format(appid))
			period_dict={}
		else:
			av_players=sum(player_vector)/len(player_vector)
			dif_players=[(p-av_players)**2 for p in player_vector]
			dev_players=sum(dif_players)**0.5/(len(dif_players)-1)
			period_dict={'av':av_players,'dev':dev_players}
	else:
		period_dict={}
		print('No players timetable found for {}'.format(appid))

	##Modifying database instance
	steamgame=setterdb.steam_game_timeperiod_setter(
		steamgame,
		period_id,
		status,
		start,
		end,
		logger,
		**period_dict
		)

	##Returning modified steamgame
	print('Timeperiod {} for {} correctly saved'.format(period_id,appid))
	return steamgame



#SteamGame quality setter
def steam_game_quality_setter_menu(
	steamgame: gamedb.SteamGame,
	logger: logging.Logger
	) -> gamedb.SteamGame:
	##Documentation
	"""
	When called asks the user to manually input the game's quality,
	then calls the function steam_game_quality_setter from 
	steam_setters_db to set the quality of a given SteamGame object
	from steam_game_db. Returns the modified object.
	
	Parameters
	----------
	steamgame: gamedb.SteamGame
		SteamGame instance we wish to modify
	"""

	##Setting key attributes
	appid=steamgame.appid
	print('Setting approximation quality for {}'.format(appid))
	quality=int(input('\t - Quality: '))

	##Setting quality
	steamgame=setterdb.steam_game_quality_setter(
		steamgame,
		quality,
		logger
		)

	##Returning modified steamgame
	print('Quality correctly saved for {}'.format(appid))
	return steamgame



#Steamgame gameplay setter
def steam_game_aggregate_menu(
	steamgame: gamedb.SteamGame,
	logger: logging.Logger
	) -> gamedb.SteamGame:
	##Description
	"""
	When called asks for manual input of date_period and
	user_period, then applies the main function from aggreagate.py
	to a given SteamGame object from steam_game_db. Returns
	the modified object with the aggreagated gameplay.

	Parameteres
	-----------
	steamgame: steam_game_db.SteamGame
		SteamGame instance from steam_game_db

	logger: logging.Logger
		Logger that notifies of all changes in SteamDB
	"""

	##Asking for date_period and user_period
	print('Setting gameplays for Game {}'.format(steamgame.appid))
	date_period=int(input('\t - date_period: '))
	user_period=int(input('\t - user_period: '))
	date_period=datetime.timedelta(days=date_period)

	##Calling aggreagte main function
	steamgame=aggregate.main(
		steamgame,
		date_period,
		user_period,
		logger
		)

	return steamgame



#Steamgame current_state setter
def steam_game_status_menu(
	steamgame: gamedb.SteamGame,
	logger: logging.Logger
	) -> gamedb.SteamGame:
	##Documentation
	"""
	"""

	##Asking for current state data
	print('Setting current state for Game {}'.format(steamgame.appid))
	status=input('\t - status: ')
	last_checked=input('\t - last checked (d/m/Y): ')
	last_checked=datetime.datetime.strptime(last_checked,'%d/%m/%Y')

	##Setting current state data for steamgame
	steamgame.current_state=status
	steamgame.last_checked=last_checked

	return steamgame



#Session class
class ManualSession:
	def __init__(self):
		self.item=None
		self.menu_main()


	def print_main(self):
		print(
			"""
			############################
		  	  STEAMDB MANUAL FUNCTIONS  
			############################
		
				[1] Get SteamGame
				[2] Get SteamUser
				[3] Get SteamApp
				[4] Exit
		
			############################
			"""
			)


	def menu_main(self):
		self.print_main()
		self.item=None
		option=int(input('Select an option: '))
		option_tuple=(
			self.select_game,
			self.select_user,
			self.select_app,
			self.exit
			)
		option_tuple[option-1]()


	def print_game(self,appid):
		print(
			"""
			##############################
			  STEAMGAME MANUAL FUNCTIONS
			##############################
			
				Game: {}
				[1] Show json
				[2] Assign timeperiod
				[3] Assign quality
				[4] Aggregate gameplays
				[5] Assign current state
				[6] Assign last checked
				[7] Save game
				[8] Back

			##############################
			""".format(appid)
			)


	def select_game(self):
		appid=input('Select game appid: ')
		
		steamgame=getterdb.steam_game_getter(appid,logger)
		if steamgame!=None:
			self.item=steamgame
			self.menu_game(appid)
		else:
			print('Game {} not found'.format(appid))
			self.menu_main()
			

	def print_json_game(self,logger):
		print('Game {} json document'.format(self.item.appid))
		print(self.item.to_json())
		self.menu_game(self.item.appid)


	def set_timeperiod(self,logger):
		print(
			"""
			Setting TimePeriod for Game {}
			""".format(self.item.appid)
			)
		self.item=steam_game_timeperiod_setter_menu(
			self.item,
			logger
			)
		self.menu_game(self.item.appid)


	def set_quality(self,logger):
		print(
			"""
			Setting quality for Game {}
			""".format(self.item.appid)
			)
		self.item=steam_game_quality_setter_menu(
			self.item,
			logger
			)
		self.menu_game(self.item.appid)


	def set_gameplay(self,logger):
		print(
			"""
			Aggregating gameplay for Game {}
			""".format(self.item.appid)
			)
		try:
			self.item=steam_game_aggregate_menu(self.item,logger)
		except ValueError as e:
			print(e)
		self.menu_game(self.item.appid)

	def set_status(self,logger):
		try:
			self.item=steam_game_status_menu(self.item,logger)
		except:
			print(e)
		self.menu_game(self.item.appid)


	def save_game(self,logger):
		print(
			"""
			Saving Game {}
			""".format(self.item.appid)
			)
		setterdb.steam_game_save(self.item)
		self.menu_game(self.item.appid)


	def menu_game(self,appid):
		self.print_game(appid)
		option=int(input('Select an option: '))
		option_list=(
			self.print_json_game,
			self.set_timeperiod,
			self.set_quality,
			self.set_gameplay,
			self.save_game,
			self.menu_main
			)
		try:
			if option==6:
				option_list[option-1]()
			else:
				option_list[option-1](logger)
		except Exception as e:
			print(
				"""
				An error has ocurred and the data
				was not correctly saved
				"""
				)
			print(e)
			print('\n')
			self.menu_game(appid)


	def print_user(self,steamid):
		print(
			"""
			############################
			 STEAMUSER MANUAL FUNCTIONS
			############################

				User: {}
				[1] Show json
				[2] Back

			############################
			""".format(steamid)
			)


	def print_json_user(self,logger):
		print('User {} json document'.format(self.item.steamid))
		print(self.item.to_json())
		self.menu_user(self.item.steamid)


	def select_user(self):
		steamid=input('Select steamid: ')
		steamuser=getterdb.steam_user_getter(steamid,logger)
		if steamuser!=None:
			self.item=steamuser
			self.menu_user(steamid)
		else:
			print('User {} not found'.format(steamid))
			self.menu_main()


	def menu_user(self,steamid):
		self.print_user(steamid)
		option=int(input('Select an option: '))
		option_list=(
			self.print_json_user,
			self.menu_main
			)
		try:
			if option==2:
				option_list[option-1]()
			else:
				option_list[option-1](logger)
		except Exception as e:
			print(
				"""
				An error has ocurred and the data
				was not correctly saved
				"""
				)
			print(e)
			print('\n')
			self.menu_user(steamid)

		
	def print_app(self,appid):
		print(
			"""
			#############################
			  STEAMAPP MANUAL FUNCTIONS
			#############################

				App: {}
				[1] Show json
				[2] Back

			#############################
			""".format(appid)
			)


	def print_json_app(self,logger):
		print('App {} json document'.format(self.item.appid))
		print(self.item.to_json())
		self.menu_app(self.item.appid)


	def select_app(self):
		appid=input('Select appid: ')
		steamapp=getterdb.steam_app_getter(appid,logger)
		if steamapp!=None:
			self.item=steamapp
			self.menu_app(appid)
		else:
			print('App {} not found'.format(appid))
			self.menu_main()
			


	def menu_app(self,appid):
		self.print_app(appid)
		option=int(input('Select an option: '))
		option_list=(
			self.print_json_app,
			self.menu_main
			)
		try:
			if option==2:
				option_list[option-1]()
			else:
				option_list[option-1](logger)
		except Exception as e:
			print(
				"""
				An error has ocurred and the data
				was not correctly saved
				"""
				)
			print(e)
			print('\n')
			self.menu_app(appid)


	def exit(self):
		print('Exiting manual menu')
