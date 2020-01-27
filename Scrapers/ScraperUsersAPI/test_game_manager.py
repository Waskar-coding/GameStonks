#Description
"""
This module tests all functions from game_manager.py
"""
__author__ = 'Óscar Gómez Nonnato'
__date__ = '11/01/2020'



#Libraries
##Standard
import os
import csv
import json
import logging

##Packages
import unittest

##Local
import game_manager



#Initializing logger
logger=logging.getLogger('TestGameManager')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('test_game_manager.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Setting TestCase
class TestGameManager(unittest.TestCase):
	#Set up class
	@classmethod
	def setUpClass(cls):
		##Creating mock dir
		CURRENT_PATH = os.getcwd()
		os.mkdir('TestGameManager')
		MOCK_PATH = CURRENT_PATH + r'\TestGameManager'
		os.chdir(MOCK_PATH)
		cls.cpath = CURRENT_PATH
		cls.mpath = MOCK_PATH


		##Creating mock standby.csv
		with open('standby.csv','w',newline='') as standby:
			writer=csv.writer(standby,delimiter=';')
			writer.writerow(['69lmao',0,0])
			writer.writerow(['SUCC',0,0])
			writer.writerow(['MoonDoom',0,0])


		##Creaint mock game json
		game_dict={
			'games' : {
				'69lmao' : 14,
				'SUCC' : 5,
				'MoonDoom' : 6,
				'Yeet' : 10,
				'Yoot' : 11
				}
			}
		with open('monitored_games.json','w') as game_doc:
			json.dump(game_dict,game_doc,indent=2)
		cls.game_dict=game_dict


		##Creating mock users json
		###User 1 (has one monitored game)
		user_1={
			'01':{
				'game_count' : 3,
				'game_list' : [
					'69lmao',
					'420',
					'1488'
					],
				'href' : 'www.bruh.com',
				'friends_checked' : False,
				'69lmao' : {
					"playtime_forever" : 1079,
        			"playtime_windows_forever" : 1079,
        			"playtime_mac_forever" : 0,
        			"playtime_linux_forever" : 0
					},
				'420' : {
					"playtime_forever" : 1079,
        			"playtime_windows_forever" : 1079,
        			"playtime_mac_forever" : 0,
        			"playtime_linux_forever" : 0
					}
				}
			}

		###User 2 (has two monitored games)
		user_2={
			'02':{
				'game_count' : 3,
				'game_list' : [
					'69lmao',
					'1488',
					'SUCC'
					],
				'href' : 'www.bruh.com',
				'friends_checked' : False,
				'69lmao' : {
					"playtime_forever" : 1079,
        			"playtime_windows_forever" : 1079,
        			"playtime_mac_forever" : 0,
        			"playtime_linux_forever" : 0
					},
				'SUCC' : {
					"playtime_forever" : 1079,
        			"playtime_windows_forever" : 1079,
        			"playtime_mac_forever" : 0,
        			"playtime_linux_forever" : 0
					}
				}
			}

		###User 3 (has no monitored games)
		user_3={
			'03':{
				'game_count' : 3,
				'game_list' : [
					'69lmao',
					'420',
					'1488'
					],
				'href' : 'www.bruh.com',
				'friends_checked' : False,
				'Bruh' : {
					"playtime_forever" : 1079,
        			"playtime_windows_forever" : 1079,
        			"playtime_mac_forever" : 0,
        			"playtime_linux_forever" : 0
					}
				}
			}

		###User 4 (has no games)
		user_4={
			'04':{
				'game_count' : 3,
				'game_list' : [
					'Bruh',
					'Bruh',
					'Bruh'
					],
				'href' : 'www.bruh.com',
				'friends_checked' : False
				}
			}

		###Creating user dictionary
		user_dict = {'profiles' : {}}
		user_dict['profiles'].update(user_1)
		user_dict['profiles'].update(user_2)
		user_dict['profiles'].update(user_3)
		user_dict['profiles'].update(user_4)
		cls.user_dict = user_dict


		###Saving mock user json
		with open('monitored_users.json','w') as user_doc:
			json.dump(user_dict,user_doc,indent=2)



	#Testing get_standby
	@unittest.skip('Skipping get_standby test')
	def test_get_standby(self):
		test_standby = game_manager.get_standby(self.mpath)
		real_standby = ['69lmao','SUCC','MoonDoom']
		self.assertEqual(test_standby,real_standby)



	#Testing get_monitored_users
	@unittest.skip('Skipping get_monitored_users test')
	def test_get_monitored_users(self):
		test_user_dict = game_manager.get_monitored_users(self.mpath)
		real_user_dict = self.user_dict
		self.assertEqual(test_user_dict,real_user_dict)



	#Testing get_monitored_games
	@unittest.skip('Skipping get_monitored_games test')
	def test_get_monitored_games(self):
		test_game_dict = game_manager.get_monitored_games(self.mpath)
		real_game_dict = self.game_dict
		self.assertEqual(test_game_dict,real_game_dict)



	#Testing delete_users
	@unittest.skip('Skipping delete_users test')
	def test_delete_users(self):
		user_dict = self.user_dict
		game_list = ['69lmao','SUCC','MoonDoom']
		user_dict = game_manager.delete_users(game_list,user_dict)
		print(user_dict)



	#Testing delete games
	@unittest.skip('Skipping delete_games test')
	def test_delete_games(self):
		game_dict = self.game_dict
		game_list = ['69lmao','SUCC','MoonDoom']
		game_dict = game_manager.delete_games(game_list,game_dict)
		print(game_dict)



	#Testing save users
	@unittest.skip('Skipping save_users test')
	def test_save_users(self):
		user_dict = self.user_dict
		game_manager.save_users(user_dict)



	#Testing save_games
	@unittest.skip('Skipping save_games test')
	def test_save_games(self):
		game_dict=self.game_dict
		game_manager.save_games(game_dict)



	#Tear down class
	@classmethod
	def tearDownClass(cls):
		MOCK_PATH = cls.mpath
		CURRENT_PATH = cls.cpath
		os.chdir(MOCK_PATH)
		os.remove('standby.csv')
		os.remove('monitored_users.json')
		os.remove('monitored_games.json')
		os.chdir(CURRENT_PATH)
		os.rmdir('TestGameManager')