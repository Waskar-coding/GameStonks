#Description
"""
Aims to test all functions from steam_setter_standby
"""
__author__ = 'Óscar Gómez Nonnato'
__date__ = '26/01/2020'



#Libraries
##Standard
import os
import sys
import logging
import datetime

##Packages
import unittest

##Local
CONNECT_PATH = r'../'
OBJECT_PATH = r'../Objects'
sys.path.extend([CONNECT_PATH,OBJECT_PATH])
import steam_setter_standby as standby
import steam_connection_db as connectdb
import steam_game_db as gamedb
import steam_app_db as appdb



#Initializing logger
logger=logging.getLogger('TestStanbdy')
logger.setLevel(logging.DEBUG)
st_format = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter()
file_handler=logging.FileHandler('standby_maintenance.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Creating TestCase
class TestStandby(unittest.TestCase):
	#Creating mock SteamGame and SteamApp objects
	@classmethod
	def setUpClass(cls):
		##Connecting to DB
		connectdb.register_connection('SteamDB','SteamDB')


		##Pushing data into DB
		###New games not in DB
		NEW_APP = appdb.SteamApp()
		NEW_APP.appid = '69lmao'
		NEW_APP.name = 'Avatar the last Isaac Bender'
		NEW_APP.release_date = datetime.datetime(2020,1,1)
		NEW_APP.type_ = 'game'
		NEW_APP.save()

		###New games in DB
		NEW_GAME_IN = gamedb.SteamGame()
		NEW_GAME_IN.appid = '1234'
		NEW_GAME_IN.name = 'Big Chungus, the game'
		NEW_GAME_IN.release = datetime.datetime(2020,1,15)
		NEW_GAME_IN.image = "b'Bruh'"
		NEW_GAME_IN.priority = False
		NEW_GAME_IN.score = 69
		NEW_GAME_IN.save()

		###Stagnant game
		STAGNANT_GAME = gamedb.SteamGame()
		STAGNANT_GAME.appid = '1488'
		STAGNANT_GAME.name = 'Triple K Mafia'
		STAGNANT_GAME.release = datetime.datetime(2019,11,1)
		STAGNANT_GAME.image = "b'Bruh'"
		STAGNANT_GAME.priority = True
		STAGNANT_GAME.score = 69
		STAGNANT_GAME.save()

		###Old game
		OLD_GAME = gamedb.SteamGame()
		OLD_GAME.appid = '420'
		OLD_GAME.name = 'GameStonks: Extended Edition'
		OLD_GAME.release = datetime.datetime(2019,8,1)
		OLD_GAME.image = "b'Bruh'"
		OLD_GAME.priority = True
		OLD_GAME.score = 69
		OLD_GAME.monitored = ['1','2','3']
		OLD_GAME.save()


		##Standby list
		cls.standby_list = ['69lmao','1234','420']


		##DB list
		cls.db_list = ['1488','420']

		##New list
		cls.new_list = ['69lmao','1234']



	#Testing groupGames
	@unittest.skip('Skipping groupGames test')
	def testGroupGames(self):
		st_list = self.standby_list
		db_list = self.db_list

		partitioned = standby.groupGames(st_list,db_list)
		new_list, old_list, stagnation_list = partitioned

		self.assertEqual(new_list,self.new_list)
		self.assertEqual(old_list,['420'])
		self.assertEqual(stagnation_list,['1488'])



	#Testing groupNew
	@unittest.skip('Skipping groupNew test')
	def testGroupNew(self):
		new_in, new_out = standby.groupNew(self.new_list)

		self.assertEqual(new_in[0],'1234')
		self.assertEqual(new_out[0],'69lmao')



	#Testing assignNewOut
	@unittest.skip('Skipping assignNewOut test')
	def testAssignNewOut(self):
		standby.assignNewOut('69lmao')

		steamapp = appdb.SteamApp.objects(appid='69lmao')\
			.first()
		steamgame = gamedb.SteamGame.objects(appid='69lmao')\
			.first()

		self.assertEqual(steamapp.appid,steamgame.appid)
		self.assertEqual(steamapp.name,steamgame.name)
		self.assertEqual(steamapp.release_date,steamgame.release)
		self.assertEqual(1,steamgame.score)
		self.assertEqual(True,steamgame.priority)



	#Testing assignNewIn
	@unittest.skip('Skipping assignNewIn test')
	def testAssignNewIn(self):
		standby.assignNewIn('1234')
		steamgame = gamedb.SteamGame.objects(appid='1234')\
			.first()
		self.assertEqual(steamgame.priority,True)



	#Testing assignStagnant
	@unittest.skip('Skipping assignStagnant test')
	def testAssignStagnant(self):
		standby.assignStagnant('1488')
		steamgame = gamedb.SteamGame.objects(appid='1488')\
			.first()
		self.assertEqual(steamgame.priority,False)



	#Testing assignOld
	@unittest.skip('Skipping assignOld test')
	def testAssignOld(self):
		standby.assignOld('420')
		steamgame = gamedb.SteamGame.objects(appid='420')\
			.first()

		N = len(steamgame.monitored)
		T = datetime.datetime.now() - steamgame.release
		T = T.days
		score = ((T*N)**(1/3)+1)**(-1)

		self.assertEqual(score,steamgame.score)



	#Deleting mock games
	@classmethod
	def tearDownClass(cls):
		gamedb.SteamGame.objects(appid__in=cls.db_list)\
			.all().delete()
		gamedb.SteamGame.objects(appid__in=cls.standby_list)\
			.all().delete()
		appdb.SteamApp.objects(appid='69lmao').all().delete()



#Execution
if __name__ == '__main__':
	unittest.main()