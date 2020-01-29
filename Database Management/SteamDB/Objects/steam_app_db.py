#Libraries
import mongoengine
import datetime



#Main class
class SteamApp(mongoengine.DynamicDocument):
	##Documentation
	"""
	class SteamApp(mongoengine.DynamicDocument):
	 |	Inherits from DynamicDocument. Document with lots of 
	 |	optional fields aimed to store all the information provided
	 |	by the store API.
	 |
	 |	Arguments:
	 |	- appid (int): Steam application identifier
	 |
	 |	- name (str)
	 |
	 |	- type (str): App type (game,dlc,package ...)
	 |
	 |	- required_age (int): Minimal age required to play the game
	 |
	 |	- is_free (bool)
	 |
	 |	- release_date (datetime.datetime)
	 |
	 |	- meta (Dict): Information of the object's position within the database
	"""

	##Steam appid
	appid=mongoengine.StringField(required=True)
	
	##Name of the app
	name=mongoengine.StringField(required=True)
	
	##Type of app
	type_=mongoengine.StringField(required=True)

	##Required age
	required_age=mongoengine.IntField(default=0)
	
	##Is free
	is_free=mongoengine.BooleanField(default=False)
	
	##Release date
	release_date=mongoengine.DateTimeField(default=datetime.datetime.now)

	##Mongo_
	meta={
			'db_alias':'SteamDB',
			'collection':'SteamApps',
			'indexes':[
				'appid'
			]
	}