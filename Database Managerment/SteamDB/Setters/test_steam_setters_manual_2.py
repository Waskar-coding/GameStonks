#Description
"""
This module tests the manual setter menu for SteamDB
"""
__author__='Óscar Gómez Nonnato'
__date__='06/01/2020'



#Libraries
##Standard
import sys
import logging
import datetime
import random as rd

##Packages
import unittest

##Local
CONNECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB'
OBJECT_PATH=CONNECT_PATH+r'\Objects'
GETTER_PATH=CONNECT_PATH+r'\Getters'
sys.path.extend([CONNECT_PATH,OBJECT_PATH,GETTER_PATH])
import steam_connection_db as connectdb
import steam_setters_db as setterdb
import steam_app_db as appdb
import steam_user_db as userdb
import steam_game_db as gamedb
import steam_setters_manual as manualdb



#Starting logger
logger=logging.getLogger('ManualSetter')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('ManualSetter.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Starting TestCase
class TestMenu(unittest.TestCase):
	##Creating mock app, user and game
	@classmethod
	def setUpClass(cls):
		###Connecting
		connectdb.register_connection('SteamDB','SteamDB')

		###Setting steam game
		setterdb.steam_game_setter('69lmao',logger)

		##Setting steam user
		setterdb.steam_user_setter(
			'69lmao',
			10,
			['440'],
			100,
			logger
			)

		##Setting steam app
		setterdb.steam_app_setter(
			'69lmao',
			'MoonDoom',
			'dlc',
			False,
			datetime.datetime.now(),
			logger
			)

		##Setting random users
		userid_list=[str(rd.randint(0,1000)) for i in range(20)]
		userid_list=list(set(userid_list))
		cls.userid_list=userid_list
		G_COUNT=2
		G_LIST=['69lmao','1488']
		F_NUMBER=10

		for userid in userid_list:
			setterdb.steam_user_setter(
				userid,
				G_COUNT,
				G_LIST,
				F_NUMBER,
				logger
				)
			gameplay=0
			for i in range(10):
				gameplay+=rd.randint(0,100)
				today=datetime.date.today()+datetime.timedelta(days=i)
				setterdb.steam_user_addgameplay(
					userid,
					'69lmao',
					gameplay,
					gameplay,
					gameplay,
					gameplay,
					logger,
					logger
					)

		##Setting monitored for steamgame
		steamgame=gamedb.SteamGame.objects(appid='69lmao').first()
		steamgame.monitored=userid_list
		steamgame.save()


	##Testing manual session class
	def test_manual(self):
		manualdb.ManualSession()

	##Deleting mock objects
	@classmethod
	def tearDownClass(cls):
		###Deleting steam game
		gamedb.SteamGame.objects(appid='69lmao').all().delete()

		###Deleting steam user
		userdb.SteamUser.objects(userid='69lmao').all().delete()

		###Deleting steam app
		appdb.SteamApp.objects(appid='69lmao').all().delete()

		###Deleting all random users
		userdb.SteamUser.objects(userid__in=cls.userid_list)\
			.all().delete()



#Execution
if __name__=='__main__':
	unittest.main()