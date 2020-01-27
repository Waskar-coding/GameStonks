#Description
"""
All operations related with setting instances in SteamDB by using
mongoengine. All the funtions in this module may be used into more
complex aplications, or applied individually when manual changes
are needed.
"""
__author__='Óscar Gómez Nonnato'



#Libraries
##Standard
import os
import sys
import json
import logging
import datetime

##Packages
import mongoengine

##Local
OBJECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB\Objects'
sys.path.append(OBJECT_PATH)
import steam_app_db
import steam_user_db
import steam_game_db



#SteamApp basic setter
def steam_app_setter(
	appid: str,
	name: str,
	type_: str,
	is_free: bool,
	release_date: datetime.datetime,
	logger: logging.Logger,
	**kwargs
	)-> None:
	##Checking for the app in database
	if len(steam_app_db.SteamApp.objects(appid=appid).all())!=0:
		logger.warning(
			"""
			Steam App {} already registered, 
			updating fields
			""".format(appid)
			)
		SteamApp=steam_app_db.SteamApp.objects(appid=appid).first()
	else:
		SteamApp=steam_app_db.SteamApp()

	##Setting required fields
	SteamApp.appid=appid
	SteamApp.name=name
	SteamApp.type_=type_
	SteamApp.is_free=is_free
	SteamApp.release_date=release_date

	##Setting additional fields
	for key in kwargs.keys():
		if kwargs[key]=='NaN':
			continue
		elif kwargs[key]==[] or kwargs[key]==['NaN']:
			continue
		elif kwargs[key]=={}:
			continue
		else:
			setattr(SteamApp,key,kwargs[key])

	##Saving document object into DB
	try:
		SteamApp.save()
		logger.info('Steam App {} correctly stored'.format(appid))
	except:
		logger.exception('Error while parsing App {}'.format(appid))



#SteamUser basic setter
def steam_user_setter(
	userid: str,
	game_count: int,
	game_list: list,
	friend_number: int,
	logger: logging.Logger
	)-> None:
	##Checking for the user in DB
	if len(steam_user_db.SteamUser.objects(userid=userid))!=0:
		logger.warning(
			"""
			Steam user {} already registered, updating fields
			""".format(userid)
			)
		SteamUser=steam_user_db.SteamUser.objects(userid=userid).first()
	else:
		SteamUser=steam_user_db.SteamUser()

	##Setting all non-timerelated fields
	SteamUser.userid=userid
	SteamUser.game_count=game_count
	SteamUser.game_list=game_list
	friend_number=friend_number

	##Saving document object into DB
	SteamUser.save()
	logger.info('Steam user {} correctly stored'.format(userid))



#SteanGame basic setter
def steam_game_setter(
	appid: str,
	logger: logging.Logger
	)-> None:
	##Checking for game in db
	if len(steam_game_db.SteamGame.objects(appid=appid).all())!=0:
		logger.warning(
			"""
			Steam game {} already registered, updating fields
			""".format(appid)
			)
		SteamGame=steam_game_db.SteamGame.objects(appid=appid).first()
	else:
		SteamGame=steam_game_db.SteamGame()

	##Assigning appid to game
	SteamGame.appid=appid
	SteamGame.save()
	logger.info('Steam game {} correctly stored'.format(appid))



#SteamUser gameplay setter
def steam_user_addgameplay(
	userid: str,
	appid: str,
	total_gameplay: int,
	win_gameplay: int,
	mac_gameplay: int,
	lin_gameplay: int,
	gamelogger: logging.Logger,
	userlogger: logging.Logger
	)-> None:
	##Accessing SteamUser
	SteamUser=steam_user_db.SteamUser.objects(userid=userid).first()

	##Checking for the gameplay register in embedded documents
	GameFlag=False
	if hasattr(SteamUser,'monitored'):
		MonitoredCopy=SteamUser.monitored[:]
		for i,Register in enumerate(SteamUser.monitored):
			if Register.appid==appid:
				GameplayRegister=Register
				GameFlag=True
				MonitoredCopy.pop(i)
		SteamUser.monitored=MonitoredCopy

	##Creating new object if not found
	if not GameFlag:
		GameplayRegister=steam_user_db.GameplayRegister()
		GameplayRegister.appid=appid
		SteamGame=steam_game_db.SteamGame.objects(appid=appid).first()
		SteamGame.monitored.append(userid)
		SteamGame.save()
		gamelogger.info(
			"""
			Steam User {} has been registered 
			as monitored for the game {}
			""".format(userid,appid)
			)
	
	##Appending points to all lists
	Today=datetime.datetime.now()
	GameplayRegister.total_gameplay.append((Today,total_gameplay))
	GameplayRegister.win_gameplay.append((Today,win_gameplay))
	GameplayRegister.mac_gameplay.append((Today,mac_gameplay))
	GameplayRegister.lin_gameplay.append((Today,lin_gameplay))
	
	##Appending EmbeddedDocument
	SteamUser.monitored.append(GameplayRegister)

	##Saving user information
	SteamUser.save()
	userlogger.info(
		"""
		User {} gameplay of {} correctly saved
		""".format(userid,appid)
		)



#SteamUser gameplay deleter
def steam_user_delgameplay(
	appid: str,
	logger: logging.Logger
	) -> None:
	##Getting monitored
	SteamGame=steam_game_db.SteamGame.objects(appid=appid)
	OwnerList=SteamGame.monitored

	##Getting all owners documents
	OwnerDocs=steam_user_db.SteamUser.objects(userid__in=OwnerList)
	
	##Deleting gameplay register from documents
	for SteamUser in OwnersDocs:
		for GameplayRegister in SteamUser.monitored:
			if GameplayRegister.appid==appid:
				GameplayRegister.delete()
				break
		SteamUser.save()
		logger.info(
			"""
			{} gameplay successfully deleted for user {}
			""".format(appid,SteamUser.userid)
			)



#SteamGame timeseries setter
def steam_game_timeseries_setter(
	steamgame: steam_game_db.SteamGame,
	timeseries: list,
	property_: str,
	logger: logging.Logger
	) -> steam_game_db.SteamGame:
	##Documentation
	"""
	Recieves a SteamGame object from steam_game_db, sets a given
	attribute with a given timeseries. Returns the modified object.

	Parameters
	----------
	steamgame: steam_game_db.SteamGame
		SteamGame object we wish to modify.

	timeseries: list
		List of tuples with a datetime.datetime object and a value
		of the given property.

	property_: str
		Name of the attribute we wish to set/modify.

	logger: logging.Logger
		Logger object, records all important changes.
	"""

	##Setting timeseries
	type(steamgame)
	setattr(steamgame,property_,timeseries)
	logger.info(
		"""
		{} for {} correctly updated
		""".format(property_,steamgame.appid)
		)
	return steamgame



##SteamGame approx quality setter
def steam_game_quality_setter(
	steamgame: steam_game_db.SteamGame,
	quality: int,
	logger: logging.Logger
	) -> None:
	##Documentation
	"""
	Recieves a SteamGame object from steam_game_db, and a quality
	attribute represented by a number. Checks if the quality is
	an accepted number (for more information check SteamGame 
	class documentation from steam_game_db). Sets the quality
	attribute for the object and returns it.

	Parameteres
	-----------
	steamgame: steam_game_db.SteamGame
		SteamGame instance we wish to modify

	quality: int
		Number that represents the quality of the approximations
		in the SteamGame object.

	logger: logging.Logger
		Logger objects that informs of any changes.
	"""

	##Checking if quality is allowed
	QUALITY_LIST=[0,1,2]

	if not(quality in QUALITY_LIST):
		raise ValueError(
			"""
			Only the values 0, 1 or 2 are allowed as quality
			"""
			)

	##Setting quality
	steamgame.quality=quality
	
	##Returning modified steamgame
	logger.info(
		"""
		Quality for {} set to {}
		""".format(steamgame.appid,quality)
		)
	return steamgame



#SteamGame timeperiod setter
def steam_game_timeperiod_setter(
	steamgame: steam_game_db.SteamGame,
	period_id: str,
	status: str,
	start: datetime.date,
	end: datetime.date,
	logger: logging.Logger,
	**kwargs
	) -> None:
	##Documentation
	"""
	Recieves a SteamGame object from steam_game_db and timeperiod
	arguments, checks if the period_id is not repeated within
	the object and if the status is valid. Creates a timeperiod
	with all the given arguments and includes it into the SteamGame
	timeperiod embedded document list. Returns the modified object.

	Parameters
	----------
	steamgame: steam_game_db.SteamGame
		SteamGame instance we wish to modify.

	period_id: str
		String the identificates any time period, every timeperiod
		in a SteamGame instance must have an unique period_id.

	status: str
		Indicates the state in which the game was during the period.
		For more information search the documentation for the
		SteamGame class in steam_game_db.
	
	start: datetime.date
		Starting date of the period.

	end: datetime.date
		Ending date of the period.

	logger: logging.Logger
		Logger object that register any important changes. 
	"""

	##Checking for repeated ids
	IdList=[Period.period_id for Period in steamgame.periods]
	if period_id not in IdList:
		logger.info('New TimePeriod: {}'.format(period_id))
		TimePeriod=steam_game_db.TimePeriod()
		ModFlag=False
	else:
		logger.info('Modifying TimePeriod: {}'.format(period_id))
		for i,period in enumerate(steamgame.periods):
			if period.period_id==period_id:
				TimePeriod=period
				steamgame.periods.pop(i)
				break
		ModFlag=True

	##Checking for wrong ending dates
	if start>end:
		raise ValueError('End is earlier than start')

	##Checking for unkwown status
	STATUS_DICT={
		'i':'inactive',
		's':'stagnant',
		'a':'active (unknown cause)',
		'al':'active (launch)',
		'as':'active (sales)',
		'aw':'active (free weekend)'
		}
	if status not in STATUS_DICT.keys():
		raise ValueError('Unknown status')

	##Setting properties
	TimePeriod.period_id=period_id
	TimePeriod.status=status
	TimePeriod.start=start
	TimePeriod.end=end
	if 'av' in kwargs.keys():
		TimePeriod.average_players=kwargs['av']
	if 'dev' in kwargs.keys():
		TimePeriod.deviation_players=kwargs['dev']

	##Appending to period list and saving in db
	steamgame.periods.append(TimePeriod)
	logger.info(
		"""
		Period {} for game {} correctly saved
		""".format(period_id,steamgame.appid)
		)
	return steamgame



#SteamGame set achievements
def steam_achievement_setter(
	steamgame: steam_game_db.SteamGame,
	achievements_json: dict,
	logger: logging.Logger
	) -> steam_game_db.SteamGame:
	##Documentation
	"""
	Recieves a SteamGame object from steam_game_db, and a dictionary
	with achievements, classifies achievements in Old, Missing, and 
	New according to the given dictionary and SteamGame.achievements.
	Adds to the list of Old achievements already in db a tuple with
	the current date and percentaje, warns of missing achievements
	which are on SteamGame.achievements but not on the passed json.
	Creates new achievements for those which are on the json but not
	on SteamGame.achievements. Returns the updated SteamGame instance.

	Parameters
	----------
	steamgame: steam_game_db.SteamGame
		Object from SteamDB database and SteamGames collection 

	achievement_json: dict
		Dictionary containing a game's current archievements retrieved
		from SteamAPI. Every achievement is identified with a key
		(achievement_id) and a percentaje with one or two decimals
		precision  
	"""

	##Getting all id from db and json
	IdDbSet=set([a.achievement_id for a in steamgame.achievements])
	IdJsonSet=set(achievements_json.keys())

	##Classifiying ids
	old_id=list(IdDbSet.intersection(IdJsonSet))
	mis_id=list(IdDbSet.difference(IdJsonSet))
	new_id=list(IdJsonSet.difference(IdDbSet))
	today=datetime.datetime.now()

	##Adding to old achievements in db, warning if missing
	for i,achievement in enumerate(steamgame.achievements):
		achievement_id=steamgame.achievements[i].achievement_id
		if achievement_id in old_id:
			percent=achievements_json[achievement_id]
			steamgame.achievements[i].percentages.append(
				(today,percent)
				)
		elif achievement_id in mis_id:
			logger.warning(
				"""
				Missing achievement {} for game {}
				"""
				.format(achievement_id,steamgame.appid))
		else:
			logger.error(
				"""
				Something unexpected happened with achievement
				{} for game {}
				"""
				.format(achievement_id,steamgame.appid))

	##Adding new archievements to db
	for id_ in new_id:
		logger.info(
			"""
			Adding new achievement {} to game {}
			"""
			.format(achievement_id,steamgame.appid))
		new_a=steam_game_db.AchievementRegister()
		new_a.achievement_id=id_
		new_a.percentages.append((today,achievements_json[id_]))
		steamgame.achievements.append(new_a)

	return steamgame 



#SteamGame saver
def steam_game_save(steamgame: steam_game_db.SteamGame) -> None:
	steamgame.save()



#Execution
if __name__=='__main__':
	userid=str(input('Select userid: '))
	session=mongoengine.register_connection(alias='SteamDB',db='SteamDB')
	
	appid='110'
	total_gameplay=100
	win_gameplay=50
	mac_gameplay=50
	lin_gameplay=0

	steamuser_addgameplay(
		userid=userid,
		appid=appid,
		total_gameplay=total_gameplay,
		win_gameplay=win_gameplay,
		mac_gameplay=mac_gameplay,
		lin_gameplay=lin_gameplay
						)	
	print(steam_user_db.SteamUser.objects().first().to_json())