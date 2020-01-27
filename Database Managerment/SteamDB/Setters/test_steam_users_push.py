#Description
"""
"""
__author__='Óscar Gómez Nonnato'
__date__='10/01/2020'



#Libraries
##Standard
import os
import sys
import csv
import json
import logging
import datetime

##Packages
import unittest

##Local
CONNECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Database Managerment\SteamDB'
OBJECT_PATH=CONNECT_PATH+r'\Objects'
sys.path.extend([CONNECT_PATH,OBJECT_PATH])
import steam_game_db as gamedb
import steam_user_db as userdb
import steam_connection_db as connectdb
import steam_users_push as userpush



#Initializing loggers
##Gamelogger
logger=logging.getLogger('TestGameplayPush')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('test_gameplay_push.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

##Userlogger
logger=logging.getLogger('TestUserPush')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('test_user_push.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Creating TestCase
class TestUserPush(unittest.TestCase):
	#Set up class
	@classmethod
	def setUpClass(cls):
		##Connecting to SteamDB
		connectdb.register_connection('SteamDB','SteamDB')

		##Setting constants
		FULL_G=[
			[datetime.datetime(2020,1,1),100],
			[datetime.datetime(2020,1,2),100],
			[datetime.datetime(2020,1,3),100]
			]
		NULL_G=[
			[datetime.datetime(2020,1,1),0],
			[datetime.datetime(2020,1,2),0],
			[datetime.datetime(2020,1,3),0]
			]


		##Creating users in db
		###1st User (1 standby game 1 non stanby game, in json)
		user_1=userdb.SteamUser()
		user_1.userid='01'
		user_1.game_count=3
		user_1.game_list=[
			'69lmao',
			'420',
			'1488'
			]
		register_10=userdb.GameplayRegister()
		register_10.appid='69lmao'
		register_10.total_gameplay=FULL_G
		register_10.win_gameplay=FULL_G
		register_10.mac_gameplay=NULL_G
		register_10.lin_gameplay=NULL_G
		register_11=userdb.GameplayRegister()
		register_11.appid='1488'
		register_11.total_gameplay=FULL_G
		register_11.win_gameplay=NULL_G
		register_11.mac_gameplay=FULL_G
		register_11.lin_gameplay=NULL_G
		user_1.monitored.extend([register_10,register_11])
		user_1.save()

		###2nd User (2 standby games, in json)
		user_2=userdb.SteamUser()
		user_2.userid='02'
		user_2.game_count=4
		user_2.game_list=[
			'69lmao',
			'420',
			'1488',
			'MoonDoom'
			]
		register_20=userdb.GameplayRegister()
		register_20.appid='69lmao'
		register_20.total_gameplay=FULL_G
		register_20.win_gameplay=FULL_G
		register_20.mac_gameplay=NULL_G
		register_20.lin_gameplay=NULL_G
		register_21=userdb.GameplayRegister()
		register_21.appid='MoonDoom'
		register_21.total_gameplay=FULL_G
		register_21.win_gameplay=NULL_G
		register_21.mac_gameplay=NULL_G
		register_21.lin_gameplay=FULL_G
		user_2.monitored.extend([register_20,register_21])
		user_2.save()

		###3rd User (no standby games, in json)
		user_3=userdb.SteamUser()
		user_3.userid='03'
		user_3.game_count=3
		user_3.game_list=[
			'BruhOne',
			'420',
			'1488'
			]
		register_30=userdb.GameplayRegister()
		register_30.appid='1488'
		register_30.total_gameplay=FULL_G
		register_30.win_gameplay=NULL_G
		register_30.mac_gameplay=FULL_G
		register_30.lin_gameplay=NULL_G
		user_3.monitored.extend([register_30])
		user_3.save()

		###4rt User (not in json)
		user_4=userdb.SteamUser()
		user_4.userid='04'
		user_4.game_count=3
		user_4.game_list=[
			'BruhOne',
			'420',
			'1488'
			]
		register_40=userdb.GameplayRegister()
		register_40.appid='1488'
		register_40.total_gameplay=FULL_G
		register_40.win_gameplay=NULL_G
		register_40.mac_gameplay=FULL_G
		register_40.lin_gameplay=NULL_G
		user_4.monitored.extend([register_40])
		user_4.save()


		##Creating registered games
		###1st Game (all monitored in db)
		game_1=gamedb.SteamGame()
		game_1.appid='69lmao'
		game_1.monitored=['01','02']
		game_1.save()

		###2nd Game (new monitored in json)
		game_2=gamedb.SteamGame()
		game_2.appid='MoonDoom'
		game_2.monitored=['02']
		game_2.save()


		##Creating csv with standby games
		appid_list=['69lmao','MoonDoom']
		start_list=['01/01/2020','01/01/2021']
		end_list=['01/01/2020','01/01/2021']
		with open('standby.csv','w',newline='') as game_doc:
			writer=csv.writer(game_doc,delimiter=';')
			writer.writerows(zip(appid_list,start_list,end_list))
		cls.appid_list=appid_list


		##Creating json with users
		###User 1 json
		user_1_dict={
			'01' : {
				'game_count' : 3,
				'game_list' : [
					'69lmao',
					'420',
					'1488'
					],
				'href' : 'www.bruh.gay',
				'friends_checked' : False,
				'69lmao' : {
					"playtime_forever" : 0,
        			"playtime_windows_forever" : 0,
        			"playtime_mac_forever" : 0,
        			"playtime_linux_forever" : 0
					}
				}
			}

		###User 2 json
		user_2_dict={
			'02' : {
				'game_count' : 4,
				'game_list' : [
					'69lmao',
					'420',
					'1488',
					'MoonDoom'
					],
				'href' : 'www.trapsaregay.com',
				'friends_checked' : True,
				'69lmao' : {
					"playtime_forever" : 300,
        			"playtime_windows_forever" : 0,
        			"playtime_mac_forever" : 300,
        			"playtime_linux_forever" : 0
					},
				'MoonDoom' : {
					"playtime_forever" : 400,
        			"playtime_windows_forever" : 300,
        			"playtime_mac_forever" : 0,
        			"playtime_linux_forever" : 100
					}
				}
			}

		###User 3 json
		user_3_dict={
			'03' : {
				'game_count' : 3,
				'game_list' : [
					'BruhOne',
					'420',
					'1488',
					],
				'href' : 'www.thiccboyes&grills.com',
				'friends_checked' : True
				}
			}

		###New User 5 json (has one standby game)
		user_5_dict={
			'05' : {
				'game_count' : 3,
				'game_list' : [
					'420',
					'1488',
					'MoonDoom'
					],
				'href' : 'www.theway.com',
				'friends_checked' : False,
				'MoonDoom' : {
					"playtime_forever": 100,
        			"playtime_windows_forever": 0,
        			"playtime_mac_forever": 0,
        			"playtime_linux_forever": 100
        			}
				}
			}

		###New User 6 json (has no standby games)
		user_6_dict={
			'06' : {
				'game_count' : 3,
				'game_list' : [
					'420',
					'1488',
					'BruhOne'
					],
				'href' : 'www.retrocrush.com',
				'friends_checked' : False,
			}
		}

		###Creating json with
		user_dict={}
		user_dict.update(user_1_dict)
		user_dict.update(user_2_dict)
		user_dict.update(user_3_dict)
		user_dict.update(user_5_dict)
		user_dict.update(user_6_dict)
		user_dict={'profiles':user_dict}
		cls.user_json=user_dict
		with open('monitored_users.json','w') as user_doc:
			json.dump(user_dict,user_doc,indent=2)



	#Testing get_userlist
	def test_get_userlist(self):
		test_user_list=userpush.get_userlist(os.getcwd())
		real_user_list=['01','02','03','05','06']
		self.assertEqual(test_user_list,real_user_list)



	#Testing check_userlist
	#@unittest.skip('Skipping check_userlist test')
	def test_check_userlist(self):
		test_user_list=userpush.get_userlist(os.getcwd())
		test_old, test_new=userpush.check_userlist(test_user_list)
		real_old=['01','02','03']
		real_new=['05','06']
		self.assertEqual(sorted(test_old),real_old)
		self.assertEqual(sorted(test_new),real_new)



	#Testing get_gamelist
	def test_get_gamelist(self):
		test_game_list=userpush.get_gamelist(os.getcwd())
		real_game_list=self.appid_list
		self.assertEqual(test_game_list,real_game_list)



	#Testing register_new
	def test_register_new(self):
		real_new=['05','06']
		real_game_list=self.appid_list
		userpush.register_new(real_new,real_game_list)

		new_users=userdb.SteamUser.objects(userid__in=real_new).all()
		self.assertTrue(len(new_users)==2)

		user_5=userdb.SteamUser.objects(userid='05').first()
		self.assertEqual(user_5.userid,'05')
		self.assertEqual(user_5.game_count,3)
		self.assertEqual(user_5.game_list,['420','1488','MoonDoom'])
		self.assertTrue(len(user_5.monitored)==1)
		user_5_0=user_5.monitored[0]
		self.assertEqual(user_5_0.appid,'MoonDoom')
		self.assertEqual(user_5_0.total_gameplay[0][1],100)
		self.assertEqual(user_5_0.win_gameplay[0][1],0)
		self.assertEqual(user_5_0.mac_gameplay[0][1],0)
		self.assertEqual(user_5_0.lin_gameplay[0][1],100)

		user_6=userdb.SteamUser.objects(userid='06').first()
		self.assertEqual(user_6.userid,'06')
		self.assertEqual(user_6.game_count,3)
		self.assertEqual(user_6.game_list,['420','1488','BruhOne'])
		self.assertTrue(len(user_6.monitored)==0)



	#Testing register old
	def test_register_old(self):
		real_old=['01','02','03']
		appid_list=self.appid_list
		userpush.register_old(real_old,appid_list)

		old_user_list=userdb.SteamUser\
			.objects(userid__in=real_old).all()
		self.assertTrue(len(old_user_list)==3)

		for user in old_user_list:
			print(user.to_json())



	#Tear down class
	@classmethod
	def tearDownClass(cls):
		##Deleting all games from SteamDB
		appid_list=['69lmao','MoonDoom']
		gamedb.SteamGame.objects(appid__in=appid_list)\
			.all().delete()

		##Deleting all users from SteamDB
		userid_list=['01','02','03','04','05','06']
		userdb.SteamUser.objects(userid__in=userid_list)\
			.all().delete()

		##Deleting all temp files
		os.remove('standby.csv')
		os.remove('monitored_users.json')
