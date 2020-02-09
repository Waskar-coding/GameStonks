#Description
"""
Schema for a jackpot object from SteamDB
"""
__author__ = 'Waskar'
__date__ = '29/01/2020'



#Libraries
##Standard
import datetime

##Packages
import mongoengine



#Jackpot class
class SteamJackpot(mongoengine.Document):
	##Documentation
	"""
	class SteamJackpot(mongoengine.Document):
	 |	Inherits from mongoengine.Document. Describes a jackpot.
	 |
	 |	Attributes
	 |	----------
	 |	jackpot_id (str):
	 |		Jackpot identification
	 |
	 |	jackpot_class (str):
	 |		Type of jackpot. Depending on the type different
	 |		features and documentation might appear.
	 |
	 |	jackpot_doc (str):
	 |		Name of the document that contains the rules associated
	 |		with the jackpot.
	 |
	 |	jackpot_start (datetime.datetime):
	 |		Starting date.
	 |
	 |	jackpot_end (datetime.datetime):
	 |		Ending date.
	 |
	 |	total_value (float):
	 |		Monetary value ($) associated with the jackpot.
	 |
	 |	users (dict):
	 |		Dictionary containing all the user and their state
	 |		within the jackpot.
	 |
	 |	winners (list):
	 |		All designated winners and their associate prize ids.
	 |
	 |	featured (dict):
	 |		Additional information about the jackpot (featured games,
	 |		for example).
	"""

	##Jackpot id and entity
	jackpot_id = mongoengine.StringField(required=True)
	entity = mongoengine.StringField(default='GameStonks')
	
	##Jackpot class and associated documentation
	jackpot_class = mongoengine.StringField(required=True)
	jackpot_title = mongoengine.StringField(required=True)
	jackpot_doc_intro = mongoengine.StringField(required=True)
	jackpot_doc_participate = mongoengine.StringField(required=True)
	jackpot_doc_score = mongoengine.StringField(required=True)
	jackpot_doc_rights = mongoengine.StringField(required=True)
	jackpot_doc_kick = mongoengine.StringField(required=True)
	
	##Jackpot timeperiod
	start = mongoengine.DateTimeField(required=True)
	end = mongoengine.DateTimeField(required=True)
	active = mongoengine.BooleanField(required=True)
	
	##Jackpot participants and winners
	total_value = mongoengine.FloatField(required=True)
	users = mongoengine.ListField(default=[])
	winners = mongoengine.ListField(default=[])

	##Additional information
	features = mongoengine.DictField()

	##Class metadata
	meta={
			'db_alias': 'SteamDB',
			'collection':'steamjackpots',
			'indexes':[
				'jackpot_id'
			]
	}