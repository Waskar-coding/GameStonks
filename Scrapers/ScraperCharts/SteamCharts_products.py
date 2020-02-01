#Libraries
##Standard
import os
import sys
import csv
import json
import logging
from time import sleep
from datetime import datetime, timedelta

##Packages
import requests
from requests.exceptions import ProxyError
from bs4 import BeautifulSoup

##Local
PROXY_PATH = r'../'
sys.path.append(PROXY_PATH)
import proxypy
import Charts_Ingestion_Engine



#Logging
logger=logging.getLogger('ChartsMainFunc')
logger.setLevel(logging.INFO)
st_format = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('ChartTriggers.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#File management
##Retrieving games on standby
def retrieve_standby():
	###Checking standby.csv
	review_list=[]
	with open('standby.csv','r',newline='') as standby_csv:
		reader=csv.reader(standby_csv,delimiter=';')
		FORMAT_DATETIME=r'%d/%m/%Y'
		today_datetime=datetime.now().date()
		for row in reader:
			review_datetime=datetime.strptime(row[2],FORMAT_DATETIME).date()
			if today_datetime>=review_datetime:
				review_list.append(row[0])

	###Returning list of programs to review
	return review_list


##Refreshing standby games with new games
def refresh_standby():
	###Path constants
	PRODUCTS_STR=r'../ScraperGamesAPI'
	STANDBY_PATH=os.getcwd()
	PRODUCTS_PATH=os.path.normpath(PRODUCTS_STR)

	###Retrieving new games from steam_products.json
	os.chdir(PRODUCTS_PATH)
	game_dict={}
	with open('steam_products.json','r') as products_json:
		FORMAT_DATETIME=r'%d/%m/%Y'
		REVIEW_INTERVAL=365
		products_dict=json.load(products_json)['products']
		for key in products_dict.keys():
			if products_dict[key]['type']=='game':
				appid=key
				release=products_dict[appid]['release_date']
				review=datetime.strptime(release,FORMAT_DATETIME)+timedelta(days=REVIEW_INTERVAL)
				review=datetime.strftime(review,FORMAT_DATETIME)
				game_dict.update({appid:(release,review)})
	game_list=game_dict.keys()
	logger.debug(game_dict)

	###Retrieving games from standby.csv
	os.chdir(STANDBY_PATH)
	standby_list=[]
	with open('standby.csv','r',newline='') as standby_csv:
		reader=csv.reader(standby_csv,delimiter=';')
		for row in reader:
			standby_list.append(row[0])

	###Getting unregistered games
	newgames_list=list(set(game_list).difference(set(standby_list)))
	with open('standby.csv','a',newline='') as standby_csv:
		writer=csv.writer(standby_csv,delimiter=';')
		for appid in newgames_list:
			release,review=game_dict[appid]
			writer.writerow([appid,release,review])


##Retrieving games to check
def retrieve_check():
	###Retrieving games to check
	check_list=[]
	with open('check.csv','r',newline='') as check_csv:
		reader=csv.reader(check_csv,delimiter=';')
		try:
			for row in reader:
				check_list.append(row[0])
		except IndexError:
			pass

	###Returning list of games to check
	return check_list



#Request func
def request_charts(appid,**kwargs):
	proxies=kwargs['proxies']
	headers=kwargs['headers']
	timeout=kwargs['timeout']
	url='https://steamcharts.com/app/'+appid
	try:
		response=requests.get(url,proxies=proxies,
        	                  headers=headers,timeout=timeout)
	except:
		response=requests.get(url)
		if response.status_code==200:
			pass
		else: 
			raise ProxyError
	finally:
		html_soup=BeautifulSoup(response.content,'lxml')
		if html_soup==None:
			print(appid)
			print('Bruh')
	return html_soup



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



#Main
def main():
	##Refreshing standby.csv
	refresh_standby()

	##Request function args and params
	chunksize=10
	request_func=request_charts
	request_arglist_1=retrieve_standby()
	request_arglist_2=retrieve_check()
	request_arglist_1=[[appid] for appid in request_arglist_1]
	request_arglist_2=[[appid] for appid in request_arglist_2]
	divided_request_arglist_1=divide_chunks(request_arglist_1,chunksize)
	divided_request_arglist_2=divide_chunks(request_arglist_2,chunksize)
	header_os=['win','mac','linux']
	timeout=10

	##Crunch function params
	crunch_func_1=Charts_Ingestion_Engine.main_standby
	crunch_func_2=Charts_Ingestion_Engine.main_check

	##Refresh function params
	os.environ['chromedriver']=r'C:\Users\mcnon\OneDrive\Escritorio\chromedriver_win32\chromedriver'
	refresh_func=proxypy.pool_spyone
	refresh_arglist=['chromedriver','DE','AT','UK','FR']
	refresh_kwargdict={'Anonymity':['HIA','ANM'],'Uptime':70}
	refresh_time=60*5

	##Initial proxy list
	proxy_list=proxypy.pool_spyone(*refresh_arglist,**refresh_kwargdict)

	##Starting ProxyRotationManager
	store_manager=proxypy.ProxyRotationManager(
		proxy_list,
        request_func,
        request_arglist_1,
        header_os=header_os,
        timeout=timeout,
        refresh_func=refresh_func,
        refresh_func_args=refresh_arglist,
        refresh_func_kwargdict=refresh_kwargdict,
        refresh_time=refresh_time
        )
	
	##The manager does its work for every chunk
	def steamcharts_main(store_manager,divided_request_arglist,crunch_func):
		store_manager.crunch_func=crunch_func
		for chunk in divided_request_arglist:
			store_manager.request_arglist=chunk
			store_manager.multithread_request()
			store_manager.crunch()
	if request_arglist_1!=[]:
		steamcharts_main(store_manager,divided_request_arglist_1,crunch_func_1)
	if request_arglist_2!=[]:
		steamcharts_main(store_manager,divided_request_arglist_1,crunch_func_2)



#Execution
if __name__=='__main__':
	main()