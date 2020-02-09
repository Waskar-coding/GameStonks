#Libraries
##Standard
import os
import sys
import datetime

##Packages
import requests
import unittest
import mongoengine

#Local
OBJECT_PATH = '../../Database Management/SteamDB/Objects'
sys.path.append(OBJECT_PATH)
import steam_game_db as gamedb
import steam_user_db as userdb
import steam_jackpot_db as jackpotdb
import OwnedIngestionEngine as oi
import users_steam as us



#Setting TestCase
class TestUser(unittest.TestCase):
	##Getting user from DB
	@classmethod
	def setUpClass(cls):
		mongoengine.register_connection('SteamDB','SteamDB')
		my_user = userdb.SteamUser\
			.objects(name = 'CHADVS MAXIMVS').first()
		steam_user = requests.get('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=24E7A4CB6C2041D4C08EC325A5F4FFC3&steamid='+my_user.steamid+'&include_played_free_games=true&format=json')
		cls.user = my_user
		cls.request = steam_user.json()



	##Testing ingestion user ban
	@unittest.skip('Skipping banUser test')
	def test_oi_banUser(self):
		user = oi.banUser(self.user)
		for register in user.monitored:
			self.assertEqual(register.active,False)

		for jackpot in user.jackpots:
			self.assertEqual(jackpot.status,'k')

		for ban in user.bans:
			if ban.ban_active:
				print(ban.to_json())



	##Testing ingestion user strike
	@unittest.skip('Skipping strikeUser test')
	def test_oi_strikeUser(self):
		gamelist = ['440']
		user = oi.strikeUser(self.user,gamelist)

		for register in user.monitored:
			if register.appid in gamelist:
				self.assertEqual(register.active,False)

		for jackpot in user.jackpots:
			self.assertEqual(jackpot.status,'k')

		for strike in user.strikes:
			print(strike.to_json())



	##Testing ingestion update user
	@unittest.skip('Skipping updateUser test')
	def test_oi_updateUser(self):
		user = oi.updateUser(self.user,self.request['response'])
		print(user.to_json())



	##Testing ingestion main
	@unittest.skip('Skipping main test')
	def test_oi_main(self):
		steamid = self.user.steamid
		data_dict = {steamid: self.request}
		oi.main(data_dict)



	##Testing main module getUsers & getGames
	@unittest.skip('Skipping getUser')
	def test_main_getUsers(self):
		GAMELIST = us.getGames()
		USERLIST = us.getUsers(GAMELIST)
		print(GAMELIST)
		[print(user.name) for user in USERLIST]



	##Testing main module requestUser
	@unittest.skip('Skipping requestUser')
	def test_main_requestUser(self):
		response = us.requestUser(self.user, timeout=10)
		print(response)



#Execution
if __name__ == '__main__':
	unittest.main()

