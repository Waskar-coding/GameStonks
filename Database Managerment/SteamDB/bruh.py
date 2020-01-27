#Libraries
##Standard
import os
import sys
from datetime import datetime

##Local
OBJECT_PATH=os.path.normpath(r'./Objects')
sys.path.append(OBJECT_PATH)
import steam_connection_db as connectdb
import steam_game_db as gamedb



#Creating objects
user_list=[
	('69lmao','Avatar the last Isaac Bender',datetime(2020,1,1),b'asdgj1k34h',False,100),
	('1488','MoonDoom',datetime(2020,1,2),b'adfkjq35',True,50),
	('420','Triple K Mafia: Back to business',datetime(2020,1,3),b'1j32hnklrn',True,65),
	('360','Bigus Dickus and the Glory of Rome',datetime(2020,1,4),b'13kj4hf',False,112),
	('101','Europe Simulator 2 : Now with more cuckery',datetime(2020,2,5),b'123o4hj',True,77)
	]



connectdb.register_connection('SteamDB','SteamDB')
def populate(user_list):
	for user in user_list:
		new_game = gamedb.SteamGame()
		new_game.appid = user[0]
		new_game.name = user[1]
		new_game.release = user[2]
		new_game.image = str(user[3])
		new_game.priority = user[4]
		new_game.score = user[5]
		new_game.save()



def delete(user_list):
	for user in user_list:
		gamedb.SteamGame.objects(appid = user[0]).all().delete()



if __name__ == '__main__':
	populate(user_list)