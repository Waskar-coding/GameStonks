#Libraries
##Standard
import os
import sys
import csv
import json
import logging
import requests
from time import time

##Local
PROXY_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers'
sys.path.append(PROXY_PATH)
import proxypy
import achievments_ingestion



#Initializing logger
logger=logging.getLogger('AchievmenetsMainFunc')
logger.setLevel(logging.INFO)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('Achievments.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#File management
##Getting games from standby list
def get_games(
				path: os.path,
				docname: str,
				) -> list:
	os.chdir(path)
	with open(docname,'r',newline='') as GameDoc:
		Reader=csv.reader(GameDoc,delimiter=';')
		GameList=[row[0] for row in Reader]
	return GameList



#Request function
def request_achievements(
						appid: str,
						**kwargs,
						) -> dict:
	proxies=kwargs['proxies']
	headers=kwargs['headers']
	timeout=kwargs['timeout']

	url='http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid='+appid
	try:
		response=requests.get(
								url,
								proxies=proxies,
								headers=headers,
								timeout=timeout
								)
	except:
		response=requests.get(url)

	if response.status_code==200:
		logger.info('Successful request for {}'.format(appid))
		GameJson=response.json()
	else:
		logger.warning('Failed request for {}'.format(appid))
		GameJson={}

	return GameJson



#Additional functions    
##Dividing request arglist in chunks
def divide_chunks(
					list_: list,
					chunksize: int
					) -> list:
    divided_list=[]
    while len(list_)>chunksize:
        divided_list.append(list_[:chunksize])
        for i in range(chunksize):
            list_.pop(0)
    divided_list.append(list_)
    return divided_list



#Main
def main():
	##Getting game list
	STANDBY_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperCharts'
	ACHIEVEMENTS_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperArchievementsAPI'
	STANDBY_DOCNAME='standby.csv'
	GameList=get_games(STANDBY_PATH,STANDBY_DOCNAME)

	##Request function args and params
	chunksize=10
	request_func=request_achievements
	request_arglist=[[str(appid)] for appid in GameList]
	divided_request_arglist=divide_chunks(request_arglist,chunksize)
	header_os=['win','mac','linux']

	##Crunch function params
	crunch_func=achievments_ingestion.main

	##Refresh function params
	os.environ['chromedriver']=r'C:\Users\mcnon\OneDrive\Escritorio\chromedriver_win32\chromedriver'
	refresh_func=proxypy.pool_spyone
	refresh_arglist=['chromedriver','DE','AT','UK','FR']
	refresh_kwargdict={'Anonymity':['HIA','ANM'],'Uptime':70}
	refresh_time=60*5

	##Initial proxy list
	proxy_list=proxypy.pool_spyone(*refresh_arglist,**refresh_kwargdict)

	##Starting ProxyRotationManager
	Manager=proxypy.ProxyRotationManager(
										proxy_list,
										request_func,
										request_arglist,
										header_os=header_os,
										crunch_func=crunch_func,
										refresh_func=refresh_func,
										refresh_func_args=refresh_arglist,
										refresh_func_kwargdict=refresh_kwargdict,
										refresh_time=refresh_time
										)

	##The manager does its work for every chunk
	for chunk in divided_request_arglist:
		Manager.request_arglist=chunk
		Manager.multithread_request()
		os.chdir(ACHIEVEMENTS_PATH)
		Manager.crunch()



#Execution
if __name__=='__main__':
	start=time()
	main()
	print(time()-start)