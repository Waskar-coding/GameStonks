#Description
"""
Queries SteamHub main page of all the games, gets all coments href
and stores them for future queries. Classifies the game using the
number of daily comments as a metric for its popularity.
"""
__author__='Óscar Gómez Nonnato'
__date__='26/09/2019'



#Libraries
##Standard
import os
import sys
import json
import logging
import requests
from time import sleep
from random import choice
import requests.exceptions as reqex

##Packages
from bs4 import BeautifulSoup

##Local
PROXY_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
	r'\Proyecto Owners\Scrapers'
sys.path.append(PROXY_PATH)
import Crunchfunc_Users_SteamHUB
import proxypy



#Initializing logger
logger=logging.getLogger('HUBmainfunc')
logger.setLevel(logging.INFO)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('hub_products.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Refresh ID file
def refresh_id():
	##Establishing paths
	GAMES_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
		r'\Proyecto Owners\Scrapers\ScraperGamesAPI'
	USERS_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
		r'\Proyecto Owners\Scrapers\ScraperUsersHUB'
	PRODUCT_TEMPFILES=(
		'steam_products.json',
		'steam_soon.json'
		)
	
	##Retrieving new products
	os.chdir(GAMES_PATH)
	product_list=[]
	with open('steam_products.json','r') as store_json:
		store_dict=json.load(store_json)['products']
		for appid in store_dict.keys():
			try:
				if store_dict[appid]['type']=="game":
					product_list.append(appid)
			except:
				logger.warning(
					"""
					There was a problem with {}: {}
					""".format(appid,store_dict[appid]))
				pass

	##Retrieving registered products
	os.chdir(USERS_PATH)
	with open('last_profiles.json','r',newline='') as hub_json:
		hub_dict=json.load(hub_json)
	
	##Refreshing registered products
	new_id_list=list(set(product_list)\
		.difference(set(hub_dict["products"].keys())))
	for appid in new_id_list:
		hub_dict["products"][appid]={
			"profiles":[],
			"static_count":0,
			"popularity":2
			}

	##Saving registered products
	with open('last_profiles.json','w',newline='') as hub_json:
		json.dump(hub_dict,hub_json,indent=2)

	##Notifiying changes
	if new_id_list!=[]:
		logger.info(
		"""
		The following game ids were added to the trending list: {}
		""".format(new_id_list))


#Getting ID list
def get_id(popularity):
	id_list=[]
	with open('last_profiles.json','r',newline='') as hub_json:
		products_json=json.load(hub_json)["products"]
	for appid in products_json.keys():
		if products_json[appid]['popularity']==popularity:
			id_list.append(appid)
	return id_list


#Generating hub url
def gen_url(appid):
	return 'https://steamcommunity.com/app/'+appid


#Request function
def request_hub(appid,url,**kwargs):
	try:
		proxies=kwargs['proxies']
		headers=kwargs['headers']
		timeout=kwargs['timeout']
		response=requests.get(
			url,
			proxies=proxies,
			headers=headers,
			timeout=timeout
			)
	except:
		response=requests.get(url)
	
	try:
		sleep(2)
		html_soup=BeautifulSoup(response.text,'lxml')
	except UnboundLocalError:
		html_soup=None
	return html_soup



#Dividing request arglist in chunks
def divide_chunks(list_,chunksize):
    divided_list=[]
    while len(list_)>chunksize:
        divided_list.append(list_[:chunksize])
        for i in range(chunksize):
            list_.pop(0)


    divided_list.append(list_)
    return divided_list


#Main
def main(popularity):
	##Refresh and retrieve id_list
	refresh_id()
	id_list=get_id(popularity)

	##Request function args and params
	chunksize=5
	url_list=map(gen_url,id_list)
	request_func=request_hub
	req_arglist=[[str(appid),url] for appid,url in zip(id_list,url_list)]
	divided_request_arglist=divide_chunks(req_arglist,chunksize)
	header_os=['win','mac','linux']
	timeout=30

	##Crunch function params
	crunch_func=Crunchfunc_Users_SteamHUB.main

	##Refresh function params
	os.environ['chromedriver']=r'C:\Users\mcnon\OneDrive\Escritorio'\
		r'\chromedriver_win32\chromedriver'
	refresh_func=proxypy.pool_spyone
	refresh_arglist=['chromedriver','FI','UK','IE','NL']
	refresh_kwargdict={'Anonymity':['HIA','ANM'],'Uptime':70}
	refresh_time=60
	proxy_list=proxypy.pool_spyone(*refresh_arglist,**refresh_kwargdict)

	##Starting ProxyRotationManager
	store_manager=proxypy.ProxyRotationManager(
		proxy_list,
    	request_func,
        req_arglist,
        header_os=header_os,
        timeout=timeout,
        crunch_func=crunch_func,
        refresh_func=refresh_func,
        refresh_func_args=refresh_arglist,
        refresh_func_kwargdict=refresh_kwargdict,
        refresh_time=refresh_time
        )

	##The manager does its work for every chunk
	for chunk in divided_request_arglist:
		store_manager.request_arglist=chunk
		store_manager.multithread_request()
		HUB_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
			r'\Proyecto Owners\Scrapers\ScraperUsersHUB'
		os.chdir(HUB_PATH)
		store_manager.crunch()



#Execution
if __name__=='__main__':
	p=int(sys.argv[1])
	main(p)