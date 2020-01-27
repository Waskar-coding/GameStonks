# -*- coding: utf-8 -*-
"""
Created on Fry Nov 07 16:35:19 2019

@author: Óscar Gómez Nonnato
"""
#Imported modules
import re
import logging
import json
import requests
from bs4 import BeautifulSoup
from functools import wraps
from random import choice
from threading import Lock



#Initializing logger
logger=logging.getLogger('HUBcrunchfunc')
logger.setLevel(logging.DEBUG)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('hub_products.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Finding all hrefs in html
def find_href(app_html):
	if app_html==None:
		logger.error("Failed requests for {}".format(appid))
	else:
		post_list=app_html.find_all('a')
		get_href=lambda post: post['href']
		href_list=[]
		for post in post_list:
			try:
				href_list.append(get_href(post))
			except KeyError:
				pass
	return href_list


#Finding all profile hrefs
def pattern_users(href,user_list):
	##Registered patterns to match profiles
	NEWPROFILE_MATCH=re.compile(r'https://steamcommunity.com/id/[\w\s]*/')
	OLDPROFILE_MATCH=re.compile(r'https://steamcommunity.com/profiles/[0-9]*/')
	
	#Profile matching
	new_match=NEWPROFILE_MATCH.match(href)
	old_match=OLDPROFILE_MATCH.match(href)
	if new_match==None and old_match==None:
		pass
	elif new_match!=None and old_match==None:
		user_list.append(new_match.group(0))
	elif new_match==None and old_match!=None:
		user_list.append(old_match.group(0))
	else:
		logger.error(
						"""
						Unexpected double match for {} hub:
						new_match -> {}
						old_match -> {}
						""".format(
									appid,
									new_match.group(0),
									old_match.group(0)
									)
						)
	
	return user_list



#Warning if user_list is empty
def check_list_decorator(get_func):
	@wraps(get_func)
	def check_new_users(appid,user_list):
		if user_list==[]:
			logger.warning(
							"""
							No user profiles matched for {} hub
							""".format(appid))
		new_user_list,static_count=get_func(appid,user_list)
		return (new_user_list, static_count)
	return check_new_users


#Getting last check info
@check_list_decorator
def get_new_users(appid,user_list):
	##Retrieving last profiles registered
	with open('last_profiles.json','r') as last_json:
		last_dict=dict(json.load(last_json))
		if appid in last_dict['products'].keys():
			last_list=last_dict['products'][appid]['profiles']
			static_count=int(last_dict['products'][appid]['static_count'])
				
		else:
			last_list=last_dict['products'][appid]={
													'profiles':[],
													'static_count':0,
													'popularity':2
													}
			last_list=[]
			static_count=0
			new_flag=True
	
	##Creating new user list
	last_set=set(last_list)
	user_set=set(user_list)
	new_user_list=list(set(user_list).difference(set(last_list)))

	##Reseting static_count if new users appear
	if len(new_user_list)>0:
		static_count=0
	else:
		static_count+=1

	return (new_user_list, static_count)


#Classifiying app popularity
def classify_app(new_user_list,static_count):
	new_users=len(new_user_list)
	MAX_STATIC_COUNT=15

	if static_count>MAX_STATIC_COUNT:
		popularity=0
	elif static_count>0:
		popularity=1
	elif new_users<10:
		popularity=2
	else:
		popularity=3
	
	return popularity



#Locking threads to avoid data corruption
def lockfunc_decorator(resfresh_func):
	@wraps(resfresh_func)
	def lock_it(*args,**kwargs):
		lock=Lock()
		lock.acquire()
		resfresh_func(*args,**kwargs)
		lock.release()
	return lock_it


#Refreshing last_profiles.json
@lockfunc_decorator
def refresh_last_profiles(
							appid, new_user_list,
							static_count, popularity
							):
	##Retrieving json for refresh
	with open('last_profiles.json','r') as last_json:
		last_dict=json.load(last_json)

	##Comparing popularity
	previous_popularity=last_dict['products'][appid]['popularity']
	if previous_popularity!=popularity:
		logger.info(
					"""
					{} popularity changed from {} to {}
					""".format(appid,previous_popularity,popularity))

	##Refreshing data
	last_dict['products'][appid]['profiles'].extend(new_user_list)
	last_dict['products'][appid]['static_count']=static_count
	last_dict['products'][appid]['popularity']=popularity

	##Rewriting json
	with open('last_profiles.json','w') as last_json:
		json.dump(last_dict,last_json,indent=2)



#Formating data
def format(appid,app_html):
	##Parsing html to find users
	href_list=find_href(app_html)
	user_list=[]
	for href in href_list:
		user_list=pattern_users(href,user_list)

	##Asigning popularity based on new users
	new_user_list, static_count=get_new_users(appid,user_list)
	popularity=classify_app(new_user_list,static_count)

	##Refreshing last_profiles.json
	refresh_last_profiles(appid,new_user_list,static_count,popularity)



#Main
def main(data_dict):
	##Unpacking data_dict and kwargs
	appid=list(data_dict.keys())[0]
	app_html=list(data_dict.values())[0]

	##Formating and saving results
	if app_html==None:
		logger.error("Failed request for {}".format(appid))
	else:
		format(appid,app_html)



if __name__=='__main__':
	appid=input('Select appid : ')
	url='https://steamcommunity.com/app/'+appid
	response=requests.get(url)
	html_soup=BeautifulSoup(response.text,'lxml')
	data_dict={appid:html_soup}
	main(data_dict)