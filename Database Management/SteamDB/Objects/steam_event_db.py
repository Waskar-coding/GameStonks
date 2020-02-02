#Description
"""
Schema for a event in SteamDB
"""



#Libraries
##Standard
import datetime

##Packages
import mongoengine



#Event class
class SteamEvent(mongoengine.Document):
	##Documentation
	"""
	class SteamEvent(mongoengine.Document):
	 |	Inherits from mongoengine.Document, gives basic
	 |	information about an event.
	 |
	 |	Attributes
	 |	----------
	 |	event_id (str):
	 |		Event identificator.
	 |
	 |	event_doc (file):
	 |		txt file describing the event and the multiplier
	 |
	 |	event_start (datetime.datetime):
	 |		Starting date.
	 |
	 |	event_end (datetime.datetime):
	 |		Ending date.
	 |
	 |	event_dict (dict):
	 |		Dictionary containing all relevant gathered data.
	"""

	##Identification and instructions
	event_id = mongoengine.StringField(required=True)
	event_doc = mongoengine.FileField(requried=True)

	##Relevants dates
	event_start = mongoengine.DateTimeFiled(required=True)
	event_end = mongoengine.DateTimeFiled()

	##Event data
	event_dict = mongoengine.DictField()

	meta={
			'db_alias': 'SteamDB',
			'collection':'steamjevents',
			'indexes':[
				'event_id'
			]
	}