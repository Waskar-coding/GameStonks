#Libraries
import os
import csv
import requests
import logging
import json
import OwnedIngestionEngine
import GetCommunityURL
import GetFriends
import numpy
import proxypy
from datetime import datetime



#Initializing logger
logger=logging.getLogger('Usercrunchfunc')
logger.setLevel(logging.DEBUG)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('steamUsers_products.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#File management and presorting
##Getting data on monitored games
def retrieve_game_data():
	###Creating dictionary for gamedata
	gamedata_dict={}
	
	###Extracing release_date and calculating age
	os.chdir(r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperCharts')
	DATE_FORMAT=r'%d/%m/%Y'
	with open('standby.csv','r',newline='') as standby_csv:
		reader=csv.reader(standby_csv,delimiter=';')
		for row in reader:
			appid=row[0]
			release=datetime.strptime(row[1],DATE_FORMAT).date()
			today=datetime.now().date()
			age=(today-release).days
			gamedata_dict.update({appid:age})

	###Extracting number of monitored users per game
	os.chdir(r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperUsersAPI')
	with open('monitored_games.json','r') as games_json:
		monitored_dict=json.load(games_json)
	for key in gamedata_dict.keys():
		if not(key in monitored_dict['games'].keys()):
			monitored_dict['games'][key]=0
			count=0
		else:
			count=monitored_dict['games'][key]
		gamedata_dict[key]=(gamedata_dict[key],count)
	with open('monitored_games.json','w') as games_json:
		json.dump(monitored_dict,games_json,indent=2)

	###Returning information
	return gamedata_dict


##Retrieving monitored users
def retrieve_monitored():
	with open('monitored_users.json','r') as monitored_json:
		monitored_dict=json.load(monitored_json)
		monitored_list=list(monitored_dict['profiles'].keys())
		monitored_dict={steamid:monitored_dict['profiles'][steamid]['game_list'] for steamid in monitored_list}
	return monitored_dict


##Retrieving user hrefs from HUB
def retrieve_new():
	###Defining vars
	new_dict={}
	USER_HUB_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperUsersHUB'
	USER_API_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperUsersAPI'

	###Retrieving last profiles registered on HUB
	os.chdir(USER_HUB_PATH)
	with open('last_profiles.json','r') as hub_json:
		hub_dict=json.load(hub_json)['products']
		for appid in hub_dict.keys():
			for href in hub_dict[appid]['profiles']:
				if href in new_dict.keys():
					new_dict[href].append(appid)
				else:
					new_dict.update({href:[appid]})

	###Comparing with consulted hrefs
	os.chdir(USER_API_PATH)
	with open('monitored_users.json','r') as monitored_json:
		monitored_dict=json.load(monitored_json)['profiles']
	for steamid in monitored_dict.keys():
		try:
			monitored_href=monitored_dict[steamid]['href']
		except KeyError:
			monitoref_href='NaN'
			monitored_dict[steamid]['href']='NaN'
		if monitored_href in new_dict.keys():
			del new_dict[monitored_href]

	###Returning dictionary
	return new_dict


##Generating normalized score dict for each game
def gen_scores(gamedata_dict):
	total_score=0
	for appid in gamedata_dict.keys():
		score=(gamedata_dict[appid][0]*gamedata_dict[appid][1]+1)**(-1)
		gamedata_dict[appid]=score
		total_score+=score
	for appid in gamedata_dict.keys():
		gamedata_dict[appid]=gamedata_dict[appid]/total_score
	return gamedata_dict


##Solving vanity urls for user hrefs and simplifying to profile num
def resolve_url(new_dict):
	key='24E7A4CB6C2041D4C08EC325A5F4FFC3'
	request_dict={
					'proxies':'my_ip',
					'headers':'my_user',
					'timeout':5
					}
	query_count=0
	copy_new_dict={key:new_dict[key] for key in new_dict.keys()}
	url_dict={}

	for href in new_dict.keys():
		games=new_dict[href]
		profile_num,vanity_flag=GetCommunityURL.main(href,key,**request_dict)
		del copy_new_dict[href]
		if profile_num==None:
			pass
		else:
			copy_new_dict.update({profile_num:games})
			url_dict.update({profile_num:href})
		if vanity_flag==True:
			query_count+=1

	new_dict=copy_new_dict
	return (new_dict,url_dict,query_count)

		
##Scoring profiles and sorting
def score_profiles(profile_dict,gamedata_dict):
	for steamid in profile_dict.keys():
		user_score=0
		user_games=profile_dict[steamid]
		for appid in gamedata_dict.keys():
			if user_games==[]:
				break
			elif appid in user_games:
				user_score+=gamedata_dict[appid]
				user_games.remove(appid)
		new_dict[steamid]=user_score
	profile_list=sorted(profile_dict.items(),key=lambda kv: kv[1])
	profile_list=[value[0] for value in profile_list]
	return profile_list


##Distribute queries
def distribute_queries(monitored_list,new_list,vanity_count):
	MAX_ALLOWED_QUERIES=100000
	allowed_queries=MAX_ALLOWED_QUERIES-vanity_count-len(monitored_list)
	residual_queries=0
	logger.debug(allowed_queries)
	if allowed_queries>len(new_list):
		residual_queries=allowed_queries-len(new_list)
	elif allowed_queries==len(new_list):
		pass
	else:
		new_list=new_list[:allowed_queries]
	return (new_list,residual_queries)


#Additional functions    
##Dividing request arglist in chunks
def divide_chunks(list_,chunksize):
    divided_list=[]
    while len(list_)>chunksize:
        divided_list.append(list_[:chunksize])
        for i in range(chunksize):
            list_.pop(0)
    divided_list.append(list_)
    return divided_list


##Filtering blacklisted
def filter_blacklisted(monitored_list,document):
	with open(document,'r',newline='') as blacklisted_csv:
		reader=csv.reader(blacklisted_csv,delimiter=';')
		for row in reader:
			if row!=[]:
				if row[0] in monitored_list:
					monitored_list.remove(row[0])
	return monitored_list



#Friends
##Filtering already checked friends
def filter_checked(monitored_list):
	with open('monitored_users.json','r') as monitored_json:
		monitored_dict=json.load(monitored_json)
		copy_monitored_list=monitored_list[:]
		for steamid in monitored_list:
			try:
				checked_flag=monitored_dict['profiles'][steamid]['friends_checked']
			except KeyError:
				checked_flag=False
			if checked_flag:
				copy_monitored_list.remove(steamid)
	monitored_list=copy_monitored_list
	return monitored_list


##Friends requestfunc
def request_friends(steamid,**kwargs):
	#proxies=kwargs['proxies']
	#headers=kwargs['real_headers']
	timeout=kwargs['timeout']
	url='http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=24E7A4CB6C2041D4C08EC325A5F4FFC3&steamid='+steamid+'&relationship=all'
	response=requests.get(url,timeout=timeout)
	app_json=response.json()
	return app_json


##Friends main
def friends_main(profile_list,residual_queries):	
	###Proxypy args
	chunksize=10
	request_func=request_friends
	request_arglist=[[profile] for profile in profile_list]
	divided_request_arglist=divide_chunks(request_arglist,chunksize)
	proxy_list=['my proxy']

	###Initializing manager
	FriendsManager=proxypy.ProxyRotationManager(
													proxy_list,
                                               		request_func,
                                               		request_arglist
                                               		)

	###Scraping friends with residual queries
	friend_list=[]
	for chunk in divided_request_arglist:
		logger.debug(chunk)
		FriendsManager.request_arglist=chunk
		FriendsManager.multithread_request()
		residual_queries-=len(chunk)

		for steamid in FriendsManager.passed_cache.keys():
			data_dict={steamid:FriendsManager.passed_cache[steamid]}
			friend_list.extend(GetFriends.main(data_dict))

		if len(friend_list)>=residual_queries:
			friend_list=friend_list[:residual_queries]
			break
	
	###Returning friends list
	return friend_list



#Owned games
##Owned requestfunc
def owned_request(steamid,**kwargs):
	#proxies=kwargs['proxies']
	#headers=kwargs['real_headers']
	timeout=kwargs['timeout']
	url='http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=24E7A4CB6C2041D4C08EC325A5F4FFC3&steamid='+steamid+'&include_played_free_games=true&format=json'
	response=requests.get(url,timeout=timeout)
	app_json=response.json()
	return app_json


##Owned main
def owned_main(profile_list,url_dict,gamedata_dict):
	###Proxypy params
	chunksize=20
	request_func=owned_request
	request_arglist=profile_list
	request_arglist=[[arg] for arg in request_arglist]
	divided_request_arglist=divide_chunks(request_arglist,chunksize)
	proxy_list=['my proxy']
	crunch_func=OwnedIngestionEngine.main
	crunch_kwargdict={'game_list':list(gamedata_dict.keys())}

	###Initializing manager
	OwnedManager=proxypy.ProxyRotationManager(
												proxy_list,
                                               	request_func,
                                               	request_arglist,
                                               	crunch_func=crunch_func,
                                               	crunch_kwargdict=crunch_kwargdict
                                               	)

	###Scraping owner information
	for chunk in divided_request_arglist:
		user_list=chunk[:]
		OwnedManager.request_arglist=chunk
		OwnedManager.multithread_request()
		OwnedManager.crunch()
		with open('monitored_users.json','r') as monitored_json:
			monitored_dict=json.load(monitored_json)
		for user in user_list:
			if user[0] in monitored_dict['profiles'].keys():
				if user[0] in url_dict.keys():
					monitored_dict['profiles'][user[0]]['href']=url_dict[user[0]]
				else:
					monitored_dict['profiles'][user[0]]['href']='NaN'	
				if not('friends_checked' in  monitored_dict['profiles'][user[0]].keys()):
					monitored_dict['profiles'][user[0]]['friends_checked']=False
		with open('monitored_users.json','w') as monitored_json:
			json.dump(monitored_dict,monitored_json,indent=2)

	###Counting game owners
	with open('monitored_games.json','r') as games_json:
		games_dict=json.load(games_json)
		for appid in games_dict['games'].keys():
			games_dict['games'][appid]=0
	with open('monitored_users.json','r') as monitored_json:
		monitored_dict=json.load(monitored_json)['profiles']
		for steamid in monitored_dict.keys():
			for appid in games_dict['games'].keys():
				if appid in monitored_dict[steamid].keys():
					games_dict['games'][appid]+=1
	with open('monitored_games.json','w') as monitored_json:
		json.dump(games_dict,monitored_json,indent=2)




if __name__=='__main__':
	gamedata_dict=retrieve_game_data()
	monitored_dict=retrieve_monitored()
	monitored_list=list(monitored_dict.keys())
	new_dict=retrieve_new()
	
	gamedata_dict=gen_scores(gamedata_dict)

	new_dict,url_dict,vanity_count=resolve_url(new_dict)
	logger.info('vanity_url queries: {}'.format(vanity_count))

	new_list=score_profiles(new_dict,gamedata_dict)
	monitored_list=score_profiles(monitored_dict,gamedata_dict)

	new_list,r_queries=distribute_queries(
											monitored_list,
											new_list,
											vanity_count
											)

	if r_queries>0:
		r_queries=10
		monitored_checkf=filter_checked(monitored_list)
		monitored_checkf=filter_blacklisted(monitored_checkf,'friends_blacklist.csv')
		monitored_checkf.extend(new_list)
		friend_list=friends_main(monitored_checkf,r_queries)
		new_list.extend(friend_list)

	monitored_list=filter_blacklisted(monitored_list,'games_blacklist.csv')
	owned_main(monitored_list[0:10],url_dict,gamedata_dict)
