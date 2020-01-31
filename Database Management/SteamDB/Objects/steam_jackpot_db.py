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
class Jackpot(mongoengine.Document):
	##Documentation
	"""
	"""

	##
	jackpot_id = mongoengine.StringField(required=True)
	jackpot_class = mongoengine.StringField(required=True)
	start = mongoengine.DateTimeField(required=True)
	end = mongoengine.DateTimeField(required=True)
	total_value = mongoengine.FloatField(required=True)
	users = mongoengine.ListField(required=True)
	prize_ids = mongoengine.ListField(required=True)