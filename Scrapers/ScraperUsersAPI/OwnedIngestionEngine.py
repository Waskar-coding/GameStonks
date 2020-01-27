#Libraries
import logging
import requests
import json
import csv
import GetCommunityURL
from threading import Lock



#Initializing logger
logger=logging.getLogger('OwnedCrunchFunc')
logger.setLevel(logging.INFO)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('owned_games.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Private profile ingestion
def private(userid):
	with open('games_blacklist.csv','a',newline='') as blacklist_csv:
		writer=csv.writer(blacklist_csv,delimiter=';')
		writer.writerow([userid])


#Public profile ingestion
def public(userid,data_json,**kwargs):
	##Unpacking data_dict
	tracking_game_list=kwargs['game_list']
	player_dict={}

	##Unpacking data_json
	try:
		game_count=data_json['game_count']
		user_game_json=data_json['games']
		user_game_list=[]
	except KeyError:
		logger.warning('A problem has occured with {}: {}'.format(userid,data_json))
		game_count=0
		user_game_json=[]
		user_game_list=[]

	##Extracting information from selected games
	for element in user_game_json:
		appid=element['appid']
		user_game_list.append(appid)
		if str(appid) in tracking_game_list:
			allplay=element['playtime_forever']
			winplay=element['playtime_windows_forever']
			macplay=element['playtime_mac_forever']
			linplay=element['playtime_linux_forever']
			player_dict[appid]={
								'playtime_forever':allplay,
								'playtime_windows_forever':winplay,
								'playtime_mac_forever':macplay,
								'playtime_linux_forever':linplay
								}

	##Extracting total game count and list of games
	player_dict['game_count']=game_count
	player_dict['game_list']=user_game_list

	##Saving information in monitored_users.json
	lock=Lock()
	lock.acquire()
	with open('monitored_users.json','r') as monitored_json:
		user_json=json.load(monitored_json)
	for key in player_dict.keys():
		user_json['profiles'][userid].update({key:player_dict[key]})
	with open('monitored_users.json','w') as monitored_json:
		json.dump(user_json,monitored_json,indent=2)
	lock.release()


#Main
def main(data_dict,**kwargs):
	userid=list(data_dict.keys())[0]
	data_json=list(data_dict.values())[0]['response']

	if data_json=={}:
		private(userid)
	else:
		public(userid,data_json,**kwargs)


#Execution
if __name__=='__main__':
	profile_url=input('User community url: ')
	key='24E7A4CB6C2041D4C08EC325A5F4FFC3'
	request_dict={
					'proxies':'my_ip',
					'headers':'my_user',
					'timeout':5
					}
	userid=GetCommunityURL.main(profile_url,key,**request_dict)[0]
	url='http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=24E7A4CB6C2041D4C08EC325A5F4FFC3&steamid='+userid+'&include_played_free_games=true&format=json'
	response=requests.get(url)
	try:
		print(response.json()['response']['game_count'])
	except:
		print('Private profile')
	else:
		data_dict={userid:response.json()}
		settings={'game_list':[440]}
		main(data_dict,**settings)