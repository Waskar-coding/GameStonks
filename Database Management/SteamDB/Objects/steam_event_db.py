#Description
"""
Schema for a event in SteamDB
"""



#Libraries
##Standard
import datetime

##Packages
import mongoengine



#Question class
class QuestionRegister(mongoengine.EmbeddedDocument):
	##Documentation
	"""
	class QuestionRegister(mongoengine.EmbeddedDocument):
	 |	Inherits from mongoengine.EmbeddedDocument, represents
	 |	a question within the event, all the avaiable options and
	 |	the answers, it also registers the users that have answered
	 |	in order to avoid repetitions.
	 |
	 |	Attributes
	 |	----------
	 |	question (str):
	 |		A sort sentence expressing a question we're trying to solve
	 |
	 |	options (list):
	 |		An array with all possible answers, expressed in a sort
	 |		sentence.
	 |
	 |	answers (list):
	 |		An array with all the user answers, the answers are represented
	 |		as the index of the selected options in the "options" array.
	 |
	 |	users (list):
	 |		Temporal register of user ids to avoid repetition
	"""

	##Question fields
	question = mongoengine.StringField(required = True)
	options = mongoengine.ListField(required = True)
	answers = mongoengine.ListField(default = [])
	users = mongoengine.ListField(default = [])



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
	event_title = mongoengine.StringField(required=True)
	event_class = mongoengine.StringField(required=True)
	event_entity = mongoengine.StringField(default='GameStonks')
	event_doc = mongoengine.StringField(required=True)

	##Relevants dates
	event_start = mongoengine.DateTimeField(required=True)
	event_end = mongoengine.DateTimeField(required=True)
	active = mongoengine.BooleanField(required=True)

	##Event questions
	questions = mongoengine.EmbeddedDocumentListField(QuestionRegister)

	meta={
			'db_alias': 'SteamDB',
			'collection':'steamevents',
			'indexes':[
				'event_id'
			]
	}