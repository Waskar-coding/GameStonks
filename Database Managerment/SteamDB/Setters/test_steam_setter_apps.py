#Libraries
##Standard
import sys
import os
import json
import logging
import datetime

##Packages
import unittest

##Local
import steam_setter_apps as setterapp
CONNECTION_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Database Managerment\SteamDB'
OBJECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Database Managerment\SteamDB\Objects'
sys.path.extend([CONNECTION_PATH,OBJECT_PATH])
import steam_connection_db as connectiondb
import steam_app_db as appdb



#Initializing logger
logger=logging.getLogger('TestAppPush')
logger.setLevel(logging.DEBUG)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('test_app_push.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Setting test case
class TestAppsSetter(unittest.TestCase):
	##Copying test json and connecting to database
	@classmethod
	def setUpClass(cls):
		JSON_STR=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperGamesAPI'
		os.chdir(JSON_STR)
		with open('steam_products.json','r') as AppDoc:
			CopyJson=json.load(AppDoc)
		with open('copy_steam_products.json','w') as CopyDoc:
			json.dump(CopyJson,CopyDoc,indent=2)
		cls.CopyJson=CopyJson
		cls.AppidList=list(CopyJson['products'].keys())


	##Testing main function
	def test_main(self):
		app_json_str=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperGamesAPI'
		app_json_path=os.path.normpath(app_json_str)
		docname='copy_steam_products.json'
		alias='SteamDB'
		db='SteamDB'

		setterapp.main(app_json_path,docname,alias,db,logger)

		AppDBList=appdb.SteamApp.objects(appid__in=self.AppidList).all()
		for App in AppDBList:
			appid=App.appid
			self.assertTrue(appid in self.AppidList)
			CopyDict=self.CopyJson['products'][appid]
			for key in CopyDict.keys():
				if CopyDict[key] not in ['NaN',[],['NaN'],{},None]:
					if key=='type':
						key2=key+'_'
					elif key=='release_date':
						CopyDict[key]=datetime.datetime.strptime(CopyDict[key],'%d/%m/%Y')
						key2=key
					elif key=='required_age':
						CopyDict[key]=int(CopyDict[key])
						key2=key
					else:
						key2=key
					self.assertTrue(hasattr(App,key2))
					self.assertEqual(CopyDict[key],getattr(App,key2))

		with open('copy_steam_products.json','r') as CopyDoc:
			CopyJson=json.load(CopyDoc)
			self.assertEqual(CopyJson['products'],{})


	##Deleteing test json and all database documents
	@classmethod
	def tearDownClass(cls):
		appdb.SteamApp.objects(appid__in=cls.AppidList).delete()
		os.remove('copy_steam_products.json')



if __name__=='__main__':
	unittest.main()