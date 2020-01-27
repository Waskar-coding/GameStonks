#Description
"""
This script aims to test all functions related with setting achievement
time tables into SteamDB
"""
__author__='Óscar Gómez Nonnato'



#Libraries
##Standard
import os
import sys
import json
import logging
import datetime as dt

##Packages
import unittest

##Local
CONNECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
			r'\Proyecto Owners\Database Managerment'\
			r'\SteamDB'
OBJECT_PATH=CONNECT_PATH+r'\Objects'
GETTER_PATH=CONNECT_PATH+r'\Getters'
sys.path.extend([CONNECT_PATH,OBJECT_PATH,GETTER_PATH])
import steam_connection_db as connectdb
import steam_setters_db as setterdb
import steam_getters_db as getterdb
import steam_game_db as gamedb
import steam_setters_achievements as mainmodule



#Initializing logger
logger=logging.getLogger('TestAchievementPush')
logger.setLevel(logging.DEBUG)
st_format = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter()
file_handler=logging.FileHandler('test_achievement_push.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Setting TestCase
class TestAchievementSetter(unittest.TestCase):
	##Creating mock SteamGame object in db
	@classmethod
	def setUpClass(cls):
		###Documentation
		"""
		Creates a fake SteamGame and sets some fictional 
		achievement vectors.
		"""

		###Conecting to db and creating game
		connectdb.register_connection(
			'SteamDB',
			'SteamDB'
			)
		setterdb.steam_game_setter(
			'69lmao',
			logger
			)
		steamgame=getterdb.steam_game_getter(
			'69lmao',
			logger
			)

		###Dates for achievements vector
		D_1=dt.datetime(2019,1,1)
		D_2=dt.datetime(2019,1,2)
		D_3=dt.datetime(2019,1,3)

		###Achievements vectors
		old_achievements={
			'bruh':[
				(D_1,0.1),
				(D_2,80.3),
				(D_3,1.2)
				],
			'get_big_td_goth_gf':[
				(D_1,0.0),
				(D_2,0.0),
				(D_3,0.0)
				],
			'give_up_on_life':[
				(D_1,100.0),
				(D_2,100.0),
				(D_3,100.0)
				]
			}
		cls.D_1=D_1.date()
		cls.D_2=D_2.date()
		cls.D_3=D_3.date()

		###Introducing achievement vectors into object
		for tuple_ in old_achievements.items():
			achievement_instance=gamedb.AchievementRegister()
			achievement_instance.achievement_id=tuple_[0]
			achievement_instance.percentages.extend(tuple_[1])
			steamgame.achievements.append(achievement_instance)

		###Saving object
		cls.game=steamgame
		setterdb.steam_game_save(steamgame)


	##Testing achievement setter
	@unittest.skip('Skipping achievement_setter')
	def test_steam_achievement_setter(self):
		###Documentation
		"""
		Assigns to fake game new achievements, tests function's 
		response to old, missing and new achievements. Asserts
		that all the information is correctly stored in db. You
		must manually check if the loggers write the correct 
		messages.
		"""

		###Setting new achievements
		steamgame=self.game
		new_achievements={
			'bruh':50.8,
			'give_up_on_life':100,
			'get_diagnosed_with_the_gay':50.0
			}
		steamgame=setterdb.steam_achievement_setter(
			steamgame,
			new_achievements,
			logger
			)
		setterdb.steam_game_save(steamgame)

		###This is how the results are supposed to be
		D_4=dt.date.today()
		final_result={
			'bruh':[
					(self.D_1,0.1),
					(self.D_2,80.3),
					(self.D_3,1.2),
					(D_4,50.8)
					],
			'give_up_on_life':[
					(self.D_1,100.0),
					(self.D_2,100.0),
					(self.D_3,100.0),
					(D_4,100.0)
					],
			'get_big_td_goth_gf':[
					(self.D_1,0.0),
					(self.D_2,0.0),
					(self.D_3,0.0)
					],
			'get_diagnosed_with_the_gay':[
					(D_4,50.0)]
			}

		###Checking database
		steamgame=getterdb.steam_game_getter(
			'69lmao',
			logger
			)
		achievements=steamgame.achievements
		for a in achievements:
			a.percentages=[(p[0].date(),p[1]) for p in a.percentages]
			print(a.achievement_id)
			self.assertEqual(
				final_result[a.achievement_id],
				a.percentages
				)


	##Testing main function
	def test_main(self):
		###Documentation
		"""
		Creates a mock achievements document and simulates the main
		function of steam_setters_achievements. Checks if the mock
		document has been reseted and if all data has been pushed
		into the db 
		"""

		###Creating mock achievements document
		with open('achievements.json','w') as mockdoc:
			mockdict={
				'games':{
					'69lmao':{
						'bruh':80.3,
						'brah':1.0
						}
					}
				}
			json.dump(mockdict,mockdoc,indent=2)

		###Appliying main module function for mock document
		CURRENT_DIR=os.getcwd()
		a_dict=mainmodule.get_achievements(CURRENT_DIR)
		mainmodule.push_achievements(a_dict)


		###Checking mock document reset
		with open('achievements.json','r') as mockdoc:
			a_dict=json.load(mockdoc)
		self.assertEqual(a_dict,{'games':{}})

		###Checking database
		steamgame=getterdb.steam_game_getter(
			'69lmao',
			logger
			)
		D_4=dt.date.today()
		final_result={
			'bruh':[
				(self.D_1,0.1),
				(self.D_2,80.3),
				(self.D_3,1.2),
				(D_4,80.3)
				],
			'get_big_td_goth_gf':[
				(self.D_1,0.0),
				(self.D_2,0.0),
				(self.D_3,0.0)
				],
			'give_up_on_life':[
				(self.D_1,100.0),
				(self.D_2,100.0),
				(self.D_3,100.0)
				],
			'brah':[
				(D_4,1.0)
				]
			}
		for a in steamgame.achievements:
			if a.achievement_id == 'bruh':
				percents=a.percentages
				percents=[(p[0].date(),p[1]) for p in percents]
				self.assertEqual(percents,final_result['bruh'])
			elif a.achievement_id == 'brah':
				percents=a.percentages
				percents=[(percents[0][0].date(),percents[0][1])]
				self.assertEqual(percents,final_result['brah'])


	##Deleting mock SteamGame object from db
	@classmethod
	def tearDownClass(cls):
		###Documentation
		"""
		Deletes all fake games from SteamDB
		"""
		
		###Deleting fake games
		gamedb.SteamGame.objects(appid='69lmao').all().delete()



#Execution
if __name__=='__main__':
	unittest.main()