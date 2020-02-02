#Description
"""
Schema for a prizes object in SteamDB
"""



#Libraries
##Standard
import datetime

##Packages
import mongoengine



#Prize class
class SteamPrize(mongoengine.Document):
	##Documentation
	"""
	class SteamPrize (mongoengine.Document):
	 |	Inherits from mongoengine.Document. Describes a jackpot.
	 |
	 |	Attributes
	 |	----------
	 |	prize_id (str):
	 |		Prize identification
	 |
	 |	prize_emission (datetime.datetime):
	 |		Date the prize was awarded.
	 |
	 |	prize_value (str):
	 |		Value of the prize, might be in dolars or a free game.
	 |
	 |	bill_code (str):
	 |		Transmission reference.
	 |
	 |	prize_comprobation (str):
	 |		Screen capture that proves the transmission, coded in 
	 |		base64.
	"""

	##Prize data
	prize_id = mongoengine.StringField(required=True)
	prize_emission = mongoengine.DateTimeFiled(required=True)
	prize_value = mongoengine.StringField(required=True)
	bill_code = mongoengine.StringField(required=True)
	prize_comprobation = mongoengine.StringField(required=True)

	##Prize metadata
	meta={
			'db_alias': 'SteamDB',
			'collection':'steamprizes',
			'indexes':[
				'prize_id'
			]
	}