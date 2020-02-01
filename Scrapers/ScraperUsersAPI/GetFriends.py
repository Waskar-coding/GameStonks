#Libraries
import requests
import json
import logging
import csv
import os
from threading import Lock

#Initializing logger
logger=logging.getLogger('FriendsCrunchFunc')
logger.setLevel(logging.DEBUG)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('friends_users.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


#Main
def main(data_dict):
	##Changing dir
	users_dir=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperUsersAPI'
	os.chdir(users_dir)
	##Unpacking data_dict
	steamid=list(data_dict.keys())[0]
	logger.info(steamid)
	friends_json=list(data_dict.values())[0]

	##Extracting friends
	try:
		profiles_list=[]
		if friends_json!={}:
			for friend_dict in friends_json['friendslist']['friends']:
				profiles_list.append(friend_dict['steamid'])
		else:
			with open('friends_blacklist.csv','a',newline='') as blacklist_csv:
				writer=csv.writer(blacklist_csv,delimiter=';')
				writer.writerow([steamid])
		friend_num=len(profiles_list)
	except:
		logger.exception('Unsupported format for friends_json: {}'.format(friends_json))
		profiles_list=[]
		friend_num=0

	##Submitting user information
	lock=Lock()
	lock.acquire()
	with open('monitored_users.json','r') as monitored_json:
		user_json=json.load(monitored_json)
	monitored_list=user_json['profiles'].keys()
	if steamid in monitored_list:
		user_json['profiles'][steamid]['friend_num']=friend_num
		user_json['profiles'][steamid]['friends_checked']=True
	profiles_list=list(set(profiles_list).difference(set(monitored_list)))
	with open('monitored_users.json','w') as monitored_json:
		json.dump(user_json,monitored_json,indent=2)
	lock.release()

	##Returning friends
	return profiles_list



#Execution
if __name__=='__main__':
	steamid=input('Insert steamid: ')
	url='http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=24E7A4CB6C2041D4C08EC325A5F4FFC3&steamid='+steamid+'&relationship=all'
	response=requests.get(url)
	data_json=response.json()
	data_dict={steamid:data_json}
	main(data_dict)
