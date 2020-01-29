#Libraries
import sys
OBJECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Database Managerment\SteamDB\Objects'
GETTER_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Database Managerment\SteamDB\Getters'
sys.path.append(OBJECT_PATH)
sys.path.append(GETTER_PATH)
import unittest
import mongoengine
import steam_getters_db as getterdb
import steam_setters_db as setterdb
import steam_setters_manual as settermanual
import steam_user_db as userdb
import steam_game_db as gamedb
import random as rd
import logging
import time
import datetime



#Starting loggers
##Game logger
gamelogger=logging.getLogger('TestGameSetters')
gamelogger.setLevel(logging.DEBUG)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('TestGameSetters.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
gamelogger.addHandler(file_handler)


##Meta logger
metalogger=logging.getLogger('TestMetaSetters')
metalogger.setLevel(logging.DEBUG)
file_handler=logging.FileHandler('TestMetaSetters.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
metalogger.addHandler(file_handler)



#Setting Test class
class TestManual(unittest.TestCase):
	##Creating game
	@classmethod
	def setUpClass(cls):
		mongoengine.register_connection(alias='SteamDB',db='SteamDB')
		setterdb.steam_game_setter('69lmao',gamelogger)
		steamgame=gamedb.SteamGame.objects(appid='69lmao').first()
		steamgame.players=[
			(datetime.date(2019,12,23),1000),
			(datetime.date(2019,12,24),500),
			(datetime.date(2019,12,25),250),
			(datetime.date(2019,12,26),100),
			(datetime.date(2019,12,27),250),
			(datetime.date(2019,12,28),500),
			(datetime.date(2019,12,29),1500),
			(datetime.date(2019,12,30),2000),
			(datetime.date(2019,12,31),500),
			(datetime.date(2020,1,1),100),
			(datetime.date(2020,1,2),300),
			(datetime.date(2020,1,3),400),
			(datetime.date(2020,1,4),500)
			]
		cls.game=steamgame


	##Testing quality_setter function
	@unittest.skip('Skipping quality_setter test')
	def test_steam_game_quality_setter(self):
		print('Set quality to 2')
		steamgame=settermanual.steam_game_quality_setter_menu(
			self.game,
			metalogger
			)
		self.assertEqual(steamgame.quality,2)

		print('Set quality to 1 to modify')
		steamgame=settermanual.steam_game_quality_setter_menu(
			self.game,
			metalogger
			)
		self.assertEqual(steamgame.quality,1)

		print('Set quality to 3 to assert exception')
		with self.assertRaises(ValueError) as context:
			steamgame=settermanual.steam_game_quality_setter_menu(
				self.game,
				metalogger
				)
			self.assertTrue(
				"""
				Only the values 0,1 or 2 are allowed as quality
				""" in context.exception)


	##Testing timperiod_setter function
	@unittest.skip('Skipping timperiod_setter function')
	def test_steam_game_timeperiod_setter(self):
		print(
			"""
			Create a new time period
			\n\t- period_id = 69lmao_0
			\n\t- status = i
			\n\t- start = 25/12/2019
			\n\t- end = 01/01/2020
			"""
			)
		steamgame=settermanual.steam_game_timeperiod_setter_menu(
				self.game,
				metalogger
				)
		period_list=steamgame.periods
		for period in period_list:
			if period.period_id=='69lmao_0':
				period_test=period
				break 
		players=[250,100,250,500,1500,2000,500]
		av_players=sum(players)/len(players)
		dev_players=[(p-av_players)**2 for p in players]
		dev_players=sum(dev_players)**0.5/(len(players)-1)
		self.assertEqual('i',period_test.status)
		self.assertEqual(datetime.date(2019,12,25),period_test.start)
		self.assertEqual(datetime.date(2020,1,1),period_test.end)
		self.assertEqual(av_players,period_test.average_players)
		self.assertEqual(dev_players,period_test.deviation_players)

		print(
			"""
			Modify the previous time period
			\n\t- period_id = 69lmao_0
			\n\t- status = s
			\n\t- start = 01/02/2020
			\n\t- end = 01/03/2020
			"""
			)
		steamgame=settermanual.steam_game_timeperiod_setter_menu(
			self.game,
			metalogger
			)
		PeriodList=steamgame.periods
		for Period in PeriodList:
			if Period.period_id=='69lmao_0':
				PeriodTest=Period
				break
		self.assertEqual('s',Period.status)
		self.assertEqual(datetime.date(2020,2,1),PeriodTest.start)
		self.assertEqual(datetime.date(2020,3,1),PeriodTest.end)

		print(
			"""
			Fail with end earlier than start
			\n\t- period_id = 69lmao_0
			\n\t- status = s
			\n\t- start = 25/12/2019
			\n\t- end = 24/12/2019
			"""
			)
		with self.assertRaises(ValueError) as context:
			steamgame=settermanual.steam_game_timeperiod_setter_menu(
				self.game,
				metalogger
				)
			self.assertTrue(
				'End is earlier than start' in context.exception
				)

		print(
			"""
			Fail with unknown status
			\n\t- period_id = 69lmao_0
			\n\t- status = e
			\n\t- start = 25/12/2019
			\n\t- end = 01/01/2020
			"""
			)
		with self.assertRaises(ValueError) as context:
			settermanual.steam_game_timeperiod_setter_menu(
				self.game,
				metalogger
				)
			self.assertTrue('Unknown status' in context.exception)


	##Testing status setter
	def test_set_status_new(self):
		print(
			"""
			Set the status for the first time
			\n\t- status: a
			\n\t- last checked: 01/01/2020
			"""
			)
		steamgame=settermanual.steam_game_status_menu(
			self.game,
			metalogger
			)
		self.assertTrue(steamgame.current_state,'a')
		self.assertTrue(
			steamgame.last_checked.date(),
			datetime.datetime(2020,1,1)
			)


	##Deleting game
	@classmethod
	def tearDownClass(cls):
		gamedb.SteamGame.objects(appid='69lmao').all().delete()



#Execution
if __name__=='__main__':
	unittest.main()