#Libraries
import mongoengine
import datetime



#Secondary classes
##GameplayRegister
class GameplayRegister(mongoengine.EmbeddedDocument):
	###Documentation
	"""
	class GameplayRegister(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument. Gives information
	 |	about the how much time has a user been playing a certain game.
	 |	It also contains information on when was the register created
	 |	for scoring purposes.
	 |
	 |
	 |	Attributes
	 |	----------
	 |	appid (str): 
	 |		Identifier of the gameplay, usually the steam appid of the game.
	 |
	 |	total_gameplay (list): 
	 |		Evolution of the total gameplay time in all operative systems.
	 |
	 |	win_gameplay (list):
	 |		Evolution of the total gameplay time using windows.
	 |
	 |	mac_gameplay (list): 
	 | 		Evolution of the total gameplay time using mac.
	 |
	 |	lin_gameplay (list): 
	 |		Evolution of the total gameplay time using linux.
	 |
	 |	first_date (datetime.datetime):
	 |		Register's creation date.
	 |
	 |	first_gameplay (datetime.datetime):
	 |		Register's first total gameplay.
	"""

	###Game id
	appid=mongoengine.StringField(required=True)

	###Gameplay in every plataform
	total_gameplay=mongoengine.ListField(default=[])
	win_gameplay=mongoengine.ListField(default=[])
	mac_gameplay=mongoengine.ListField(default=[])
	lin_gameplay=mongoengine.ListField(default=[])

	###Register information
	register_date=mongoengine.DateTimeField(default=datetime.datetime.now())



#Recomendation register
class RecomendationRegister(mongoengine.EmbeddedDocument):
	##Documentation
	"""
	class RecomendationRegister(mongoengine.EmbeddedDocument):
	 | 	Inherits from mongoengine.EmbeddedDocument, gives information
	 |	on all friends whom the user has recommended to participate.
	 |
	 |
	 |	Attributes
	 |	----------
	 |	rec_date (datetime.datetime):
	 |		Date in which the user's friend created the first
	 |		gameplay register.
	 |
	 |	rec_userid (str):
	 |		Steam steamid of the user's friend.

	"""
	
	##Recomendation data
	rec_date = mongoengine.DateTimeField(required=True)
	rec_userid = mongoengine.StringField(required=True)



#Prize register
class PrizeRegister(mongoengine.EmbeddedDocument):
	##Documentation
	"""
	class PrizeRegister(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument, gives information
	 |	about the user's prizes, including the id of the prizes, the
	 |	day they were awarded, the prize's value and its category.
	 |
	 |
	 |	Attributes
	 | 	----------
	 |	prize_id (str):
	 |		Prize identification, can be used to check payment claims.
	 |
	 |	prize_date (datetime.datetime):
	 |		Day in which the prize was awarded.
	 |
	 |	prize_cash (float):
	 |		Value of the price
	 |
	 |	prize_category (string):
	 |		Category of the prize
	"""

	##Prize data
	prize_id=mongoengine.StringField(required=True)
	prize_date=mongoengine.DateTimeField(required=True)
	prize_cash=mongoengine.FloatField(required=True)
	prize_category=mongoengine.StringField(required=True)



#Strike Register
class StrikeRegister(mongoengine.EmbeddedDocument):
	##Documentation
	"""
	class StrikeRegister(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument, gives information
	 |	about user strikes, the date they were given, total number of strikes 
	 |	at the moment and the reason for the strike.
	 |
	 |
	 |	Attributes
	 |	----------
	 |	strike_date (datetime.datetime):
	 |		Day the strike is given
	 |
	 |	strike_total (int):
	 |		Total number of strikes in strike_date, the current strike is
	 |		included.
	 |
	 |	strike_reason (str):
	 |		Short explanation on why the strike was issued.
	"""

	##Strike data
	strike_date=mongoengine.DateTimeField(required=True)
	strike_total=mongoengine.IntField(required=True)
	strike_reason=mongoengine.StringField(required=True)



#Ban Register
class BanRegister(mongoengine.EmbeddedDocument):
	##Documentation
	"""
	class BanRegister(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument. Gives information
	 |	about bans issued to a user, including the day the ban started
	 |	and the day it finished (if the ban is temporal).
	 |
	 |
	 |	Required Attributes
	 |	-------------------
	 |	ban_start (datetime.datetime):
	 |		Ban's strating date.
	 |
	 |	ban_type (str):
	 |		Temporal,permanent or conditional ban.
	 |
	 |	ban_reason (str):
	 |		Short exlanation on why the ban was applied.
	 |
	 |
	 |	Optional Arguments
	 |	------------------
	 |	ban_end (datetime.datetime):
	 |		Ban's endint date, only appliable if it is temporal.
	 |
	 |	ban_condition (str):
	 |		Condition that must be met to cancel the ban
	"""

	##Required data
	ban_start=mongoengine.DateTimeField(required=True)
	ban_type=mongoengine.StringField(required=True)
	ban_reason=mongoengine.StringField(required=True)
	
	##Optional data
	ban_end=mongoengine.DateTimeField()
	ban_condition=mongoengine.StringField()



#Additional register
class AdditionalRegister(mongoengine.EmbeddedDocument):
	##Documentation
	"""
	class AdditionalRegister(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument, collects information
	 |	about an user's participation in a special event. Includes the
	 |	id of the event, the day the user started and ended his/her participation
	 |	and a dictionary with additional data if necessary.
	 |
	 |
	 |	Required Arguments
	 |	------------------
	 |	evend_id (str):
	 |		Event identifier.
	 |
	 |	user_event_start (datetime.datetime):
	 |		Day in which the user started his/her participation in the event.
	 | 
	 |	user_event_end (datetime.datetime):
	 |		Day in which the user ended his/her partipication in the event.
	 |
	 |	user_multiplier (bool):
	 |		Indicates if the user has used the multiplier awarded in this event.
	 |
	 |
	 |	Optional Arguments
	 |	------------------
	 |	user_event_dict (dict):
	 |		Dictionary with addional information about the user's participation.
	"""

	##Additional register data
	event_id=mongoengine.StringField(required=True)
	user_event_start=mongoengine.DateTimeField(required=True)
	user_event_end=mongoengine.DateTimeField(required=True)
	user_multiplier=mongoengine.BooleanField(default=False)
	user_event_dict=mongoengine.DictField()




#Jackpot register
class JackpotRegister(mongoengine.EmbeddedDocument):
	##Documentation
	"""
	class JackpotRegister(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument, collects information
	 |	about an user's participation in a jackpot. Includes the
	 |	id of the jackpot, the day the user started his/her participation
	 |	and a dictionary with additional data if necessary.
	 |
	 |
	 |	Required Arguments
	 |	------------------
	 |	jackpot_id (str):
	 |		Jackpot identifier.
	 |
	 |	date (datetime.datetime):
	 |		Day in which the user started his/her participation in the jackpot.
	 | 
	 |	score (float):
	 |		How much is the user's information worth.
	 |
	 |	probability (float):
	 |		Indicates the probability of recieving a prize.
	 |
	 |
	 |	Optional Arguments
	 |	------------------
	 |	multipliers (list):
	 |		Indicates the event_id of the multipliers the user has commited to
	 |		this jackpot.
	"""

	##Jackpot data
	jackpot_id=mongoengine.StringField(required=True)
	date=mongoengine.DateTimeField(requied=True)
	score=mongoengine.FloatField(default=0)
	probabilty=mongoengine.FloatField(default=0)
	multipliers=mongoengine.ListField(default=[])




#Main class
class SteamUser(mongoengine.Document):
	##Documentation
	"""
	class SteamUser(mongoengine.Document):
	 |	Inherits from mongoengine.Document, collects information
	 |	about Steams users whose visibility state is set to public. 
	 |	All time-related information will be erased from the 
	 |	database once the active period for each game is over.
	 |
	 |
	 |	Attributes
	 |	----------
	 |	steamid (int):
	 |		Steam community id number of the user.
	 |
	 |	name (list):
	 |		List of games owned by the user.
	 |
	 |	thumbnail (str):
	 |		User's avatar.
	 |
	 |	joined (datetime.datetime):
	 |		The day in which the user's made his/her first gameplay
	 |		register.
	 |
	 |	jackpots (JackpotRegister):
	 |		Jackpots entered by the user.
	 |
	 |	monitored (GamePlayRegister):
	 |		Collection of gameplay time series of all active
	 |		games that the user has.
	 |
	 |	recomendations (RecomendationRegister):
	 |		Information about friends that came into the platform due to the
	 |		user's recommendation.
	 |
	 |	prizes (PrizeRegister):
	 |		Information about all prizes awarded to the user.
	 |
	 |	strikes (StrikeRegister):
	 |		Information about all strikes that where issued to the user.
	 |
	 |	current_strikes (int):
	 |		Number of strikes since last ban.
	 |
	 |	bans (BanRegister):
	 |		Information on all the bans applied to the user.
	 |
	 |	banned (bool):
	 |		The user is or is not banned.
	 |
	 |	permanent_ban (bool):
	 |		The user is or is not permanently banned.
	 |
	 |	blacklisted (bool):
	 |		A special ban state for user's who try to enter the page without
	 |		a valid account.
	 |
	 |	additional (AdditionalRegister):
	 |		Information about the user's participation in platform events
	 |		or client events.
	 |  
	 |	meta (dict):
	 |		Information on the object's position within the database.    
	"""
	
	##Public information
	steamid = mongoengine.StringField(required=True)
	name = mongoengine.StringField(required=True)
	thumbnail=mongoengine.StringField(required=True)
	joined=mongoengine.DateTimeField(default=datetime.datetime.now())
	
	##Score information
	jackpots = mongoengine.EmbeddedDocumentListField(JackpotRegister)

	##Monitorews registers
	monitored=mongoengine.EmbeddedDocumentListField(GameplayRegister)

	##Recomendations registers
	recomendations=mongoengine.EmbeddedDocumentListField(RecomendationRegister)

	##Prizes registers
	prizes=mongoengine.EmbeddedDocumentListField(PrizeRegister)
	current_prizes=mongoengine.IntField(default=0)
	total_prizes=mongoengine.IntField(default=0)
	total_cash=mongoengine.FloatField(default=0)

	##Strikes registers
	strikes=mongoengine.EmbeddedDocumentListField(StrikeRegister)
	current_strikes=mongoengine.FloatField(default=0)

	##Bans registers
	bans=mongoengine.EmbeddedDocumentListField(BanRegister)
	banned=mongoengine.BooleanField(default=False)
	permanent_ban=mongoengine.BooleanField(default=False)
	blacklisted=mongoengine.BooleanField(default=False)

	##Additional registers
	additional=mongoengine.EmbeddedDocumentListField(AdditionalRegister)

	##Class metadata
	meta={
			'db_alias': 'SteamDB',
			'collection':'steamusers',
			'indexes':[
				'steamid'
			]
	}
