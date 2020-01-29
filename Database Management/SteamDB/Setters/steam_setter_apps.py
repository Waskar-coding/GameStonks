#Description
"""
Pushes all apps registered in steam_products.json into database
using the DynamicDocument flexible structure from mongoengine.
Once it's finished the document is reseted.
"""
__author__='Óscar Gómez Nonnato'
__date__='24/12/2019'



#Libraries
##Standard
import os
import sys
import json
import logging
import datetime as dt

##Local
CONNECTION_PATH = r'../'
OBJECT_PATH = r'../Objects'
sys.path.append(CONNECTION_PATH)
import steam_setters_db as setterdb
import steam_connection_db as connectiondb



#Initializing logger
logger=logging.getLogger('DBAppPush')
logger.setLevel(logging.INFO)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('db_app_push.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Enter selected json
def access_json(
	path: os.path,
	docname: str
	) -> dict:
	os.chdir(path)
	with open(docname,'r') as AppDoc:
		AppJson=json.load(AppDoc)['products']
	return AppJson


#Modifying selected json
def overwrite_json(
	docname: str,
	appjson: dict
	) -> None:
	with open(docname,'w') as AppDoc:
		AppJson={'products':appjson}
		json.dump(AppJson,AppDoc,indent=2)



#Register in db all json instances
def main(
	path: os.path,
	docname: str,
	alias: str,
	db: str,
	logger: logging.Logger
	) -> None:
	AppJson=access_json(path,docname)
	client=connectiondb.register_connection(alias,db)
	
	NewAppJson=AppJson.copy()
	REC_FIELDS=(
		'appid',
		'name',
		'type',
		'is_free',
		'release_date'
		)
	for key in AppJson.keys():
		RecDict={}
		AddDict={}
		RecDict['appid']=key
		for subkey in AppJson[key].keys():
			if subkey in REC_FIELDS: 
				if (
					subkey=='release_date'
					and AppJson[key][subkey]!='NaN'
					):
					value=dt.datetime.strptime(
						AppJson[key][subkey],
						'%d/%m/%Y'
						)
				else:
					value=AppJson[key][subkey]
				RecDict.update({subkey:value})

			else:
				AddDict.update({subkey:AppJson[key][subkey]})
		setterdb.steam_app_setter(
			RecDict['appid'],
			RecDict['name'],
			RecDict['type'],
			RecDict['is_free'],
			RecDict['release_date'],
			logger,
			**AddDict
			)
		del NewAppJson[key]

	overwrite_json(docname,NewAppJson)
	client.close()



#Execution
if __name__=='__main__':
	##Defining vars
	app_json_str=r'../../../Scrapers/ScraperGamesAPI'
	app_json_path=os.path.normpath(app_json_str)
	docname='steam_products.json'
	alias='SteamDB'
	db='SteamDB'

	##Calling main func
	main(app_json_path,docname,alias,db,logger)