#Description
"""
Test module for steam_setter_prices, uses a mock file to test all
the functions in the module and afterwards erases the results
"""
__author__='Óscar Gómez Nonnato'
__date__='31/12/2019'



#Libraries
##Standard
import os
import csv
import sys
import logging
import shutil

##Packages
import unittest

##Local
CONNECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB'
GETTER_PATH=CONNECT_PATH+r'\Getters'
OBJECT_PATH=CONNECT_PATH+r'\Objects'
sys.path.extend([CONNECT_PATH,OBJECT_PATH])
import steam_setter_timetables as ttsetter
import steam_getters_db as getterdb
import steam_setters_db as setterdb
import steam_game_db as gamedb
import steam_connection_db as connectdb



#Initializing logger
logger=logging.getLogger('TestTimetables')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('test_timetables.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Testing the modules functions
class TestTimetables(unittest.TestCase):
	##Set up classmethod
	@classmethod
	def setUpClass(cls):
		connectdb.register_connection('SteamDB','SteamDB')
		setterdb.steam_game_setter('69',logger)

		DOWNLOAD_DIR=r'C:\Users\mcnon\OneDrive\Escritorio'\
			r'\Proyecto Owners\Scrapers\ScraperDB'
		PRICE_DIR=DOWNLOAD_DIR+r'\Prices'
		PLAYER_DIR=DOWNLOAD_DIR+r'\Players'
		cls.DOWNLOAD_DIR=DOWNLOAD_DIR
		cls.PRICE_DIR=PRICE_DIR
		cls.PLAYER_DIR=PLAYER_DIR

		os.chdir(DOWNLOAD_DIR)
		with open('downloaded.csv','a',newline='') as download_doc:
			writer=csv.writer(download_doc,delimiter=';')
			writer.writerow(['69',200,10])

		os.chdir(PRICE_DIR)
		shutil.copy(
			'price-history-for-271590.csv',
			'price-history-for-69.csv'
			)

		os.chdir(PLAYER_DIR)
		shutil.copy(
			'271590_Players.csv',
			'69_Players.csv'
			)


	##Testing find_pattern function
	@unittest.skip('Skippgin find_pattern test')
	def test_find_pattern(self):
		self.assertEqual(
			ttsetter.find_pattern(
				self.PRICE_DIR,
				'69',
				ttsetter.price_pattern
				),
			'price-history-for-69.csv'
			)

		self.assertEqual(
			ttsetter.find_pattern(
				self.DOWNLOAD_DIR,
				'69',
				ttsetter.price_pattern
				),
			None
			)

		self.assertEqual(
			ttsetter.find_pattern(
				self.PLAYER_DIR,
				'69',
				ttsetter.player_pattern
				),
			'69_Players.csv'
			)


	##Testing get_timetable function
	@unittest.skip('Skipping get_timetable test')
	def test_get_timetable(self):
		os.chdir(self.PRICE_DIR)
		timetable=ttsetter.get_timetable('price-history-for-69.csv')
		logger.debug('Price timetable: {}'.format(timetable))
		is_doc='price-history-for-69.csv' in os.listdir()
		self.assertEqual(is_doc,False)

		os.chdir(self.PLAYER_DIR)
		timetable=ttsetter.get_timetable('69_Players.csv')
		logger.debug('Players timetable: {}'.format(timetable))
		is_doc='69_Players.csv' in os.listdir()
		self.assertEqual(is_doc,False)


	##Testing main function
	def test_main(self):
		ttsetter.main()
		steamgame=getterdb.steam_game_getter('69',logger).to_json()
		logger.debug('Game db: {}'.format(steamgame))


	##Tear down classmethod
	@classmethod
	def tearDownClass(cls):
		gamedb.SteamGame.objects(appid='69').all().delete()
		pass


#Execution
if __name__=='__main__':
	unittest.main()