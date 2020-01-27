#Description
"""
Includes the classes of all the objects that are found in SteamDB
for the collection SteamGames. This classes are the blueprints for
storing all time-related data about a steam game.
"""
__author__='Óscar Gómez Nonnato'



#Libraries
##Standard
import datetime

##Packages
import mongoengine



#Secondary classes
##TimePeriod class
class TimePeriod(mongoengine.EmbeddedDocument):
	###Documentation
	"""
	class TimePeriod(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument, stores data about
	 |	each time period the game has undergone. This object aims to 
	 |	provide a simple explanation on why data about was collected 
	 |	in a certain maner during a period of time.
	 |
	 |	Attributes
	 |	----------
	 |	period_id: str
	 |		Identifices the time period with a key, usually the steam
	 |		appid of the game followed by and underscore and the number
	 |		of the period starting from 0.
	 |		Example:
	 |			440_0
	 |			440_1
	 |			440_2
	 |			...
	 |
	 |	status: str
	 |		Identifies the state in which the game was during the
	 |	  	perdiod. 'i' stands for inactive, no data is collected
	 |		during this period. 's' stands for stagnant, only 
	 |		concurrent players data is collected. 'a' stands for any
	 |		active period of the game where significant variations
	 |		in players, owners, prices and revenue are experienced
	 |	  	and thus data about this fields is collected. 'a' might 
	 |		be followed by special charcters to indicate the reason
	 |		of the active period.
	 |	  	Example:
	 |			'al' -> Launch
	 |			'as' -> Sales
	 |			'aw' -> Free Weekend
	 |	
	 |	start: datetime.datetime
	 |		Marks the start of the period
	 |
	 |	end: datetime.datetime
	 |		Marks the end of the period
	 |
	 |	average_players: float
	 |		Average number of players during the period. Only appears 
	 |		for stagnation periods.
	 |
	 |	deviation_players: float
	 |		Standard deviation of players during the period.
	 |	  	Only appears for stagnation periods.
	"""

	###Period id
	period_id=mongoengine.StringField(required=True)
	
	###Information about the period
	status=mongoengine.StringField(required=True)
	
	###Starting and ending dates
	start=mongoengine.DateTimeField(required=True)
	end=mongoengine.DateTimeField(required=True)
	
	###Statistical measures (only during stagnation)
	average_players=mongoengine.FloatField()
	deviation_players=mongoengine.FloatField()



##AchievementRegister class
class AchievementRegister(mongoengine.EmbeddedDocument):
	###Documentation
	"""
	class AchievementRegister(mongoengine.EmbeddedDocument)
	 |	Inherits from mongoengine.EmbeddedDocument. Aims to document
	 |	the evolution of game achievemenets during active periods of
	 |	time in order to identify their causes.
	 |
	 |  Attributes
	 |	----------
	 |	achievement_id: str
	 |		Steam identifier for the achievement
	 |
	 | 	percentaje_vector: list
	 |		Evolution of the percentage of players that have
	 |	 	completed the achievement.
	"""
	
	###Achievement id
	achievement_id=mongoengine.StringField(required=True)

	###Percentage timetable
	percentages=mongoengine.ListField(default=[])



#Main class
class SteamGame(mongoengine.Document):
	##Documentation
	"""
	class SteamGame(mongoengine.Document)
	 |  Inherits from mongoengine.Document, aims to strore all 
	 |	time-related data about a Steam Game, plus a list of monitored
	 |	owners in case a retrieval is necesary for revision.
	 |
	 |	
	 |	Attributes
	 |	----------
	 |	appid: int
	 |		Steam numeric identifier for the game.
	 |
	 |	player_timetable: list
	 |		Evolution of concurrent players provided by SteamDB. 
	 |
	 |	price_timetable: list
	 |		Evolution of the price in the USA ($) provided by
	 |		SteamDB, not provided if the app is free.
	 |
	 |	gameplay_timetable: list
	 |		Evolution of the average time played by the monitored
	 |		Steam users, not provided if there are not monitored users.
	 |
	 |  owner_timetable: list
	 |		Evolution of total game Steam owners. Only available
	 |		during active periods. There might be more than one with
	 |		differing calculation methods.
	 |	  
	 |	revenue_timetable: list
	 |		Evolution of Steam revenue ($). Only availble during active
	 |		periods.There might be more than one with differing
	 |		calculation methods.
	 |
	 |	approx_quality: int
	 |		Quality of the owner approximation. 0 is for games without
	 |		enough monitored users data, the gameplay data is based on
	 |		gameplays in similar games. 1 is for games with enough
	 |	  	monitored users data, but without confirmation from the
	 |		devs. 2 is the highest quality reserved for games whose 
	 |		devs have provided the real numbers.
	 |
	 |	achievement_timetable: AchievementRegister
	 |		List of game achievements and their percentages evolution.
	 |	  
	 |	monitored_list: list
	 |		List of monitored Steam user community ids.
	 |
	 |	periods: TimePeriod 
	 |		Information about the active and stagnant periods of the
	 |		game.
	 |
	 |	meta: dict
	 |		Information of the object's position within the database
	"""
	
	##GameID
	appid = mongoengine.StringField(required=True)
	name = mongoengine.StringField(required=True)
	release = mongoengine.DateTimeField(required=True)
	image = mongoengine.StringField(required=True)
	priority = mongoengine.BooleanField(required=True)
	score = mongoengine.FloatField(default=0)

	##Timetables
	players = mongoengine.ListField(default=[])
	prices = mongoengine.ListField(default=[])
	ratings = mongoengine.ListField(default=[])
	
	gameplay_date_total_av = mongoengine.ListField(default=[])
	gameplay_date_win_av = mongoengine.ListField(default=[])
	gameplay_date_mac_av = mongoengine.ListField(default=[])
	gameplay_date_lin_av = mongoengine.ListField(default=[])
	gameplay_user_total_av = mongoengine.ListField(default=[])
	gameplay_user_win_av = mongoengine.ListField(default=[])
	gameplay_user_mac_av = mongoengine.ListField(default=[])
	gameplay_user_lin_av = mongoengine.ListField(default=[])
	owners_av = mongoengine.ListField(default=[])
	revenue_av = mongoengine.ListField(default=[])
	
	gameplay_date_total_me = mongoengine.ListField(default=[])
	gameplay_date_win_me = mongoengine.ListField(default=[])
	gameplay_date_mac_me = mongoengine.ListField(default=[])
	gameplay_date_lin_me = mongoengine.ListField(default=[])
	gameplay_user_total_me = mongoengine.ListField(default=[])
	gameplay_user_win_me = mongoengine.ListField(default=[])
	gameplay_user_mac_me = mongoengine.ListField(default=[])
	gameplay_user_lin_me = mongoengine.ListField(default=[])
	owners_me = mongoengine.ListField(default=[])
	revenue_me = mongoengine.ListField(default=[])
	
	##Achievements register
	achievements = mongoengine.\
		EmbeddedDocumentListField(AchievementRegister)

	##Approxiation quality
	quality = mongoengine.IntField(default=2)

	##The game has been checked
	current_state = mongoengine.StringField(default='i')
	now = datetime.datetime.now()
	last_checked = mongoengine.DateTimeField(default=now)

	##Monitored owners
	monitored = mongoengine.ListField(default=[])

	##Active and stagnant periods
	periods = mongoengine.EmbeddedDocumentListField(TimePeriod)

	##Class medata
	meta = {
			'db_alias': 'SteamDB',
			'collection':'steamgames',
			'indexes':[
				'appid'
			]
	}

	##Auto Assign Score
	def auto_assign_score(self):
		dt=datetime.timedelta(datetime.datetime.now()-self.release_date).days
		n=len(self.monitored)
		self.score=1/(dt**2*n+1)*100


	##Manually Assign Score
	def manual_assign_score(self,score):
		self.score=score