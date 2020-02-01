#Libraries
import requests
import re
import csv
import os
import logging
import json
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime,timedelta
from bs4 import BeautifulSoup
from threading import Lock
from functools import wraps



#Logging
logger=logging.getLogger('ChartsCrunchFunc')
logger.setLevel(logging.INFO)
st_format = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('ChartTriggers.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Data ingestion
##Getting Steamcharts average players for last 30 days
def get_avplayers_web(html_soup):
	last30_table=html_soup.find('tr',{'class':'odd'})
	avplayers=last_30_table.find('td',{'class':'right num-f italic'})
	return  float(avplayers.text)


##Getting Steamcharts all metadata
def get_metadata(html_soup):
	print(html_soup)
	df=pd.read_html(html_soup)[0]
	return df


###Creating metadata csv
def csv_metadata(appid,df):
	df.to_csv(appid+'.csv',sep=';')


##Creating metadata plots
def plot_metadata(appid,df):
	###Formating month axis
	time_axis=tuple(df['Month'])[1:]
	datetime_format='%B %Y'
	datetime_axis=[datetime.strptime(time,datetime_format) for time in time_axis]
	first_datetime=datetime_axis[-1]
	duration_axis=[(datetime_-first_datetime).days for datetime_ in datetime_axis]

	###Formating average and peak players
	average_list=[float(players) for players in tuple(df['Avg. Players'])[1:]]
	peak_list=[int(players) for players in tuple(df['Peak Players'])[1:]]

	###Formating total and percent gain
	replace_by_zero= lambda gain: gain.replace('-','0') if gain=='-' else gain
	replace_by_none= lambda gain: gain.replace('%','')
	total_list=list(map(replace_by_zero,tuple(df['Gain'])[1:]))
	percent_list=list(map(replace_by_zero,tuple(df[r'% Gain'])[1:]))
	percent_list=list(map(replace_by_none,percent_list))
	total_list=[float(gain) for gain in total_list]
	percent_list=[float(gain) for gain in percent_list]

	###Creating graphs
	plot_dict={
				'average':average_list,
				'peak':peak_list,
				'total':total_list,
				'percent':percent_list
				}
	for key in plot_dict.keys():
		plt.figure(appid+'_'+key)
		plt.plot(duration_axis,plot_dict[key])
		plt.savefig(appid+'_'+key)


##Searching for singularities
def trending_trigger(appid,avplayers_web,avplayers_db,devplayers_db):
	MAX_DEVIATION_COEF=4
	trending_flag=False
	av_difference=avplayers_web-avplayers_db
	if av_difference>MAX_DEVIATION_COEF*devplayers_db:
		logger.info(
					"""
					Unusually large amount of 
					players detected for {}
					""".format(appid))
		trending_flag=True
	elif av_difference<-1*MAX_DEVIATION_COEF*devplayers_db:
		logger.info(
					"""
					Unusually low amount of
					players detected for {}
					""".format())
	else:
		pass
	return trending_flag



#File management
##Creating and accessing dir for stagnation or upturn checks
def create_checkdir(appid,event):
	CHECK_PATH='../../Calculations'
	os.chdir(CHECK_PATH)
	event_path=os.path.join(os.getcwd(),event+' Check')
	os.chdir(event_path)
	os.mkdir(appid)
	app_path=os.path.join(event_path,appid)
	os.chdir(app_path)


##Retrieving metadata from check file
def retrieve_metadata(appid):
	with open('check.csv','r',newline='') as check_csv:
		reader=csv.reader(check_csv,delimiter=';')
		for row in reader:
			if row[0]==appid:
				avplayers_db=row[1]
				devplayers_db=row[2]
	return avplayers_db,dev_players_db


##Locking threads to avoid data corruption
def lockfunc_decorator(resfresh_func):
	@wraps(resfresh_func)
	def lock_it(*args,**kwargs):
		lock=Lock()
		lock.acquire()
		resfresh_func(*args,**kwargs)
		lock.release()
	return lock_it



##Deleting instance from check or standby files
@lockfunc_decorator
def delete_appid(appid,file):
	appid_list=[]
	att_1_list=[]
	att_2_list=[]
	with open(file,'r',newline='') as file_csv:
		reader=csv.reader(file_csv,delimiter=';')
		for row in reader:
			if not(row[0]==appid):
				appid_list.append(row[0])
				att_1_list.append(row[1])
				att_2_list.append(row[2])
	with open(file,'w',newline='') as file_csv:
		writer=csv.writer(file_csv,delimiter=';')
		writer.writerows(zip(appid_list,att_1_list,att_2_list))



#Main functions
##Main check
def main_check(data_dict):
	STANDBY_PATH = os.getcwd()
	appid=list(data_dict.keys())[0]
	html_soup=list(data_dict.values())[0]
	avplayers_web=get_avplayers(html_soup)
	avplayers_db,devplayers_db=retrieve_metadata(appid)
	trending_flag=trending_trigger(appid,avplayers_web,avplayers_db,devplayers_db)
	if trending_flag:
		url='https://steamcharts.com/app/'+appid
		response=requests.get(url)
		html_soup=BeautifulSoup(response.text,'lxml')
		df=get_metadata(html_soup)
		create_checkdir(appid,'Upturn')
		csv_metadata(appid,df)
		plot_metadata(appid,df)
		os.chdir(STANDBY_PATH)
		delete_appid(appid,'check.csv')
		logger.info('{} saved for upturn check'.format(appid))


##Main standby
def main_standby(data_dict):
	STANDBY_PATH = os.getcwd()
	appid=list(data_dict.keys())[0]
	html_soup=list(data_dict.values())[0]
	try:
		df=get_metadata(html_soup)
	except TypeError:
		logger.warning(
			"""
			Steamcharts does not have information on {}
			""".format(appid)
			)
	else:
		create_checkdir(appid,'Stagnantion')
		csv_metadata(appid,df)
		plot_metadata(appid,df)
		os.chdir(STANDBY_PATH)
		delete_appid(appid,'standby.csv')
		logger.info('{} saved for stagnation check'.format(appid))



#Execution
if __name__=='__main__':
	appid=input('Appid: ')
	event=input('Event: ')
	url='https://steamcharts.com/app/'+appid
	response=requests.get(url)
	html_soup=BeautifulSoup(response.text,'lxml')
	data_dict={appid:html_soup}
	if event==0:
		main_check(data_dict)
	elif event==1:
		main_standby(data_dict)