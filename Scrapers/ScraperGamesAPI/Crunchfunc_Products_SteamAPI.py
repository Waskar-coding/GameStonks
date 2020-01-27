import re
import os
import csv
import json
import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from functools import wraps 



logger=logging.getLogger('StoreCrunchFunc')
logger.setLevel(logging.INFO)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('store_products.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



def keyerror_decorator(format_func):
    @wraps(format_func)
    def error_tester(REGISTERED_KEYS,appid,
    				 app_json,key,**kwargs):
    	NECESSARY_KEYS=('type','name','is_free','release_date')
    	if 'expected_length' in kwargs.keys():
    		expected_length=kwargs['expected_length']
    	else:
    		expected_length=0
    	if not(key in REGISTERED_KEYS):
    		logger.warning(
    						"""
    						Found non registered key in {} : {}
    						""".format(appid,key))
    		return None
    	else:
        	try:
        		func_return=format_func(REGISTERED_KEYS,appid,
        								app_json,key)
        	except KeyError:
        		if key in NECESSARY_KEYS:
        			logger.error('Necessary key {} not found for {}'.format(key,appid))
        		if expected_length==0:
        			return 'NaN'
        		else:
        			return tuple(['NaN' for i in range(0,expected_length)])
        	else:
        		return func_return
    return error_tester



@keyerror_decorator
def none_format(REGISTERED_KEYS,appid,app_json,key):
    return app_json[key]


@keyerror_decorator
def fullgame_format(REGISTERED_KEYS,appid,app_json,key):
	return app_json[key]['appid']


@keyerror_decorator
def demo_format(REGISTERED_KEYS,appid,app_json,key,**kwargs):
	demo_list=[]
	for pair in app_json[key]:
		demo_list.append(pair['appid'])
	return demo_list


@keyerror_decorator
def date_format(REGISTERED_KEYS,appid,app_json,key):
	REGISTERES_DATEINFO=('coming_soon','date')
	def format_date(date_str):
            try:
            	first_num=re.search('[0-9]',date_str).start()
            	len_date=len(re.sub('[^0-9]','',date_str))
            except AttributeError:
            	first_num='NaN'
            	len_date='NaN'
            if first_num==0 and len_date<6:
                date_str='0'+date_str
                steam_format='%d %b, %Y'
            elif first_num==0:
                steam_format='%d %b, %Y'
            elif first_num==4 and len_date<6:
                date_str=date_str[:4]+'0'+date_str[4:]
                steam_format='%b %d, %Y'
            elif first_num==4:
                steam_format='%b %d, %Y'
            else:
                logger.warning(
                			"""
                			Format not recognized in {} 
                			while parsing {} : {}
                			""".format(appid,key,date_str))
                steam_format=None
            my_format='%d/%m/%Y'
            if steam_format!=None:
            	date_datetime=datetime.strptime(date_str,steam_format)
            	newdate_str=datetime.strftime(date_datetime,my_format)
            else:
            	newdate_str='NaN'
            return newdate_str
	date_dict=app_json[key]
	for date_key in date_dict.keys():
		if not(date_key in REGISTERES_DATEINFO):
			logger.warning(
							"""
							Found non registered key in {} 
							while parsing {} : {}
							""".format(appid,key,date_key))
	soon_flag=date_dict['coming_soon']
	if soon_flag==True:
		return 'Soon'
	else:
		date_str=date_dict['date']
		newdate_str=format_date(date_str)
		return newdate_str


@keyerror_decorator
def language_format(REGISTERED_KEYS,appid,app_json,key):
	language_list=app_json[key].split(', ')
	language_list[-1]=language_list[-1].split('<br>')[0]
	AUDIO_MATCH=re.compile(r'<strong>\*<\/strong>')
	audio_list=[]
	for i,language in enumerate(language_list):
		audio_flag=AUDIO_MATCH.search(language)
		if audio_flag!=None:
			language=AUDIO_MATCH.sub('',language)
			language_list[i]=language
			audio_list.append(language)
	with open(key+'_index.csv','r',newline='') as language_csv:
		reg_language_list=[]
		reader=csv.reader(language_csv,delimiter=';')
		for row in reader:
			reg_language_list.append(row[0])
	new_language_list=list(set(language_list).difference(set(reg_language_list)))
	with open(key+'_index.csv','a',newline='') as language_csv:
		if new_language_list!=[]:
			logger.info(
						"""
						The following unregistered languages in {} 
						where added to {}_index.csv : {}
						""".format(appid,key,list(new_language_list)))
		writer=csv.writer(language_csv,delimiter=';')
		for language in new_language_list:
			writer.writerow([language])
	return (language_list,audio_list)


@keyerror_decorator
def requirements_format(REGISTERED_KEYS,appid,app_json,key):
	REGISTERED_LEVELS=('minimum','recommended')
	REGISTERED_REQS=(
						'OS','Processor','Memory',
					 	'DirectX','Network','Storage',
					 	'Graphics','Sound Card','Additional Notes',
					 	'Other','Sound','Hard Drive','Video',
					 	'Internet','Video Card','Hard Disk Space',
					 	'Additional')
	EQUIVALENTS={'DirectX®':'DirectX'}
	REQ_KEY_MATCH=re.compile(r'<strong>.+</strong>')
	REQ_VALUE_MATCH=re.compile(r'</strong>[^\n]+(<br/>|</li>)')
	REQ_SUB=re.compile(r'(<strong>|</strong>|:|<br/>|</li>)')
	minimum_dict={}
	recommended_dict={}
	requirement_dict=dict(app_json[key])
	for level_key in requirement_dict.keys():
		if level_key in REGISTERED_LEVELS:
			value_str=requirement_dict[level_key]
			value_soup=BeautifulSoup(value_str,'lxml')
			value_list=value_soup.find_all('li')
			for pair in value_list:
				try:
					req_key=REQ_KEY_MATCH.search(str(pair)).group(0)
					req_value=REQ_VALUE_MATCH.search(str(pair)).group(0)
					req_key=REQ_SUB.sub('',req_key)
					req_value=REQ_SUB.sub('',req_value)
					req_value=re.sub(r'^\s','',req_value)
					if req_key in EQUIVALENTS.keys():
						req_key=EQUIVALENTS[req_key]
					if req_key in REGISTERED_REQS:
						if level_key=='minimum':
							minimum_dict.update({req_key:req_value})
						elif level_key=='recommended':
							recommended_dict.update({req_key:req_value})
						else:
							pass
					else:
						logger.warning(
										"""
										Found non registered req in {} 
										while parsing {} at level {} : {}
						  				""".format(appid,key,level_key,req_key))
				except AttributeError:
					PROCESSOR_MESSAGES=(
										'<li>Requires a 64-bit processor and operating system<br/></li>',
										'<li>Requires a 64-bit processor and operating system</li>'
										)
					if str(pair) in PROCESSOR_MESSAGES:
						if level_key=='minimum':
							minimum_dict.update({'Needs 64-bit':True})
						elif level_key=='recommended':
							recommended_dict.update({'Needs 64-bit':True})
						else:
							pass
					else:
						logger.error(
										"""
										Found non registered req in {} 
										while parsing {} at level {} : {}
										""".format(appid,key,level_key,pair))
		else:
			logger.warning(
							"""
							Found non registered level in {} 
				  			while parsing {} : {}
							""".format(appid,key,level_key))
	return (minimum_dict,recommended_dict)


@keyerror_decorator
def platform_format(REGISTERED_KEYS,appid,app_json,key):
	REGISTERED_PLATFORMS=('windows','mac','linux')
	platform_json=app_json[key]
	platform_list=[]
	for platform_key in platform_json.keys():
		if platform_key in REGISTERED_PLATFORMS:
			if platform_json[platform_key]==True:
				platform_list.append(platform_key)
			elif platform_json[platform_key]==False:
				pass
			else:
				logger.warning(
								"""
								Found non registered option in {} 
								while parsing {} in platform {} : {}
							  	""".format(appid,key,platform_key,str(platform_json[platform_key])))
		else:
			logger.warning(
							"""
							Found non registered option in {} 
				  			while parsing {} : {} 
				  			""".format(appid,key,platform_key))
	return platform_list


@keyerror_decorator
def critic_format(REGISTERED_KEYS,appid,app_json,key):
	REGISTERED_CRITICS=('score','url')
	critic_json=app_json[key]
	critic_score='NaN'
	critic_source='NaN'
	for critic_key in critic_json.keys():
		if critic_key=='score':
			critic_score=critic_json[critic_key]
		elif critic_key=='url':
			critic_source=critic_json[critic_key]
		else:
			logger.warning(
							"""
							Found non registered option in {} 
				  			 while parsing {} : {}
				  			""".format(appid,key,critic_key)
				  			)
	return (critic_score,critic_source)


@keyerror_decorator
def tags_format(REGISTERED_KEYS,appid,app_json,key):
	INDEX_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperGamesAPI'
	REGISTERED_TAGINFO=('id','description')
	os.chdir(INDEX_PATH)
	tag_json=app_json[key]
	tag_dict={}
	for pair in tag_json:
		tag_dict.update({str(pair['id']):pair['description']})
		for tag_key in pair.keys():
			if not(tag_key in REGISTERED_TAGINFO):
				logger.warning(
								"""
								Found non registered key in {} 
								while parsing {} : {}
								""".format(appid,key,tag_key)) 
	req_id_list=list(tag_dict.keys())
	req_att_list=list(tag_dict.values())
	reg_id_list=[]
	new_id_list=[]
	with open(key+'_index.csv','r',newline='') as index_csv:
		reader=csv.reader(index_csv,delimiter=';')
		for row in reader:
			try:
				reg_id_list.append(row[0])
			except IndexError:
				pass
	for tag_id in req_id_list:
		if not(tag_id in reg_id_list):
			new_id_list.append(tag_id)
	with open(key+'_index.csv','a',newline='') as index_csv:
		if new_id_list!=[]:
			logger.info(
						"""
						The following unregistered tags in {} 
						were added to {}_index.csv : {}
						""".format(appid,key,list(req_att_list)))
		writer=csv.writer(index_csv,delimiter=';')
		for key in new_id_list:
			writer.writerow([key,tag_dict[key]])
	return req_id_list



def format(appid,app_json):
	REGISTERED_KEYS=(
				 		'type', 'name', 'steam_appid',
				 		'required_age', 'is_free', 'dlc', 
				 		'detailed_description', 'about_the_game',
				 		'short_description', 'supported_languages',
				 		'header_image', 'website', 'pc_requirements',
				 		'mac_requirements', 'linux_requirements',
				 		'developers', 'publishers', 'packages',
				 		'package_groups', 'platforms', 'metacritic',
				 		'categories', 'genres', 'screenshots',
				 		'movies', 'recommendations', 'achievements',
				 		'release_date', 'support_info', 'background',
				 		'content_descriptors','legal_notice','controller_support',
				 		'price_overview','ext_user_account_notice',
				 		'fullgame','demos','reviews','drm_notice'
				 		)
	app_dict={}
	
	#Checking if all keys are in REGISTERED_KEYS
	for key in app_json.keys():
		if not(key in REGISTERED_KEYS):
			logger.warning(
							"""
							Found non registered key in {} : {}
							""".format(appid,key))

	#Keys without format
	NONFORMAT_KEYS=(
					'type', 'name', 'required_age',
					'is_free', 'dlc', 'website',
					'developers', 'publishers', 'packages',
					'controller_support'
					)
	for key in NONFORMAT_KEYS:
		nonformat_value=none_format(REGISTERED_KEYS,appid,
									app_json,key)
		if (key=='developers' or key=='publishers') and nonformat_value==['']:
			nonformat_value=[]
		app_dict.update({key:nonformat_value})

	#Fullgames and demos
	fullgame_id=fullgame_format(REGISTERED_KEYS,appid,
					app_json,'fullgame')
	demo_id_list=demo_format(REGISTERED_KEYS,appid,
				app_json,'demos',expected_length=1)
	app_dict.update({'fullgame':fullgame_id})
	app_dict.update({'demos':demo_id_list})

	#Release date
	try:
		date_value=date_format(REGISTERED_KEYS,appid,
							   app_json,'release_date')
		app_dict.update({'release_date':date_value})
	except ValueError:
		app_dict.update({'release_date':'Soon'})
		logger.warning('Unsupported format for release date in {}'.format(appid))

	#Text and audio support
	text_value,audio_value=language_format(REGISTERED_KEYS,appid,
									app_json,'supported_languages',
									expected_length=2)
	app_dict.update({'text_support':text_value})
	app_dict.update({'audio_support':audio_value})

	#Hardware requirements
	REQ_KEYS=('pc_requirements', 'mac_requirements', 'linux_requirements',)
	for key in REQ_KEYS:
		try:
			app_json[key]
		except KeyError:
			logger.warning("KeyError for {} in {}".format(key,appid))
			continue
		if app_json[key]==None:
			app_dict.update({key+'_minreqs':{}})
			app_dict.update({key+'_recreqs':{}})

		else:
			minreqs,recreqs=requirements_format(REGISTERED_KEYS,appid,
												app_json,key,
												expected_length=2)
			if not('Needs 64-bit' in minreqs.keys()):
				minreqs['Needs 64-bit']=False
			if not('Needs 64-bit' in recreqs.keys()):
				recreqs['Needs 64-bit']=False
			app_dict.update({key+'_minreqs':minreqs})
			app_dict.update({key+'_recreqs':recreqs})

	#Accepted platforms
	plat_list=platform_format(REGISTERED_KEYS,appid,
							  app_json,'platforms')
	app_dict.update({'platforms':plat_list})

	#Metacrític
	critic_score, critic_source=critic_format(REGISTERED_KEYS,appid,
							  				  app_json,'metacritic',
							  				  expected_length=2)
	app_dict.update({'critic_score':critic_score})
	app_dict.update({'critic_source':critic_source})	

	#Keys with taglists
	TAG_KEYS=('categories','genres')
	for key in TAG_KEYS:
		tag_list=tags_format(REGISTERED_KEYS,appid,
							app_json,key)
		app_dict.update({key:tag_list})

	#Storing in JSON file
	if app_dict['release_date']=='Soon':
		with open('steam_soon.json','r') as json_file:
			soon_json=json.load(json_file)
		soon_json['products'].update({appid:app_dict})
		with open('steam_soon.json','w') as json_file:
			json.dump(soon_json,json_file,indent=2)
	else:
		with open('steam_products.json','r') as json_file:
			products_json=json.load(json_file)
		products_json['products'].update({appid:app_dict})
		with open('steam_products.json','w') as json_file:
			json.dump(products_json,json_file,indent=2)



def main(data_dict):
	appid=list(data_dict.keys())[0]
	app_json=list(data_dict.values())[0]
	if type(app_json).__name__=='dict':
		format(appid,app_json)
	else:
		logger.error('Unsupported type for {} : {}'.format(appid,type(app_json)))



if __name__=='__main__':
	appid=input('Select appid : ')
	url='https://store.steampowered.com/api/appdetails?appids='+appid
	response=requests.get(url)
	app_json=response.json()[appid]['data']
	format(appid,app_json)