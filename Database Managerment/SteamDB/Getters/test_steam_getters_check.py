#Description
"""
This module is aimed to test all function related with getting steam
games from SteamDB in order to check them with steamcharts_products.py. 
"""
__author__='Óscar Gómez Nonnato'
__date__='05/01/2020'



#Libraries
##Standard
import os
import sys
import csv
import logging
import random as rd
import datetime as dt

##Packages
import unittest

##Local
CONNECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners'\
	r'\Database Managerment\SteamDB'
OBJECT_PATH=CONNECT_PATH+r'\Objects'
SETTER_PATH=CONNECT_PATH+r'\Setters'
sys.path.extend([CONNECT_PATH,OBJECT_PATH,SETTER_PATH])
import steam_connection_db as connectdb
import steam_getter_check as checkdb
import steam_getters_db as getterdb
import steam_setters_db as setterdb
import steam_game_db as gamedb



#Starting loggers
logger=logging.getLogger('TestGameCheck')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('GameCheck.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Setting TestCase
class TestCheck(unittest.TestCase):
	##Set up class
	@classmethod
	def setUpClass(cls):
		###Connecting to db and creating mock SteamGame objects
		connectdb.register_connection('SteamDB','SteamDB')
		id_ls=[
			'69lmao','440','1488',
			'101','202','303'
			]
		cls.ids=id_ls
		[setterdb.steam_game_setter(id_,logger) for id_ in id_ls]
		
		###Posible cases
		####Current state is not i
		case_1=getterdb.steam_game_getter('69lmao',logger)
		case_1=setterdb.steam_game_timeperiod_setter(
			case_1,
			'69lmao_0',
			'al',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_1=setterdb.steam_game_timeperiod_setter(
			case_1,
			'69lmao_1',
			's',
			dt.date(2019,6,15),
			dt.date(2019,7,15),
			logger
			)
		case_1=setterdb.steam_game_timeperiod_setter(
			case_1,
			'69lmao_2',
			'i',
			dt.date(2019,7,16),
			dt.date(2019,8,15),
			logger
			)
		case_1.current_state='as'
		case_1.last_checked=dt.date(2020,1,1)
		setterdb.steam_game_save(case_1)
		cls.case_1=case_1

		####Current state is i but no s periods
		case_2=getterdb.steam_game_getter('440',logger)
		case_2=setterdb.steam_game_timeperiod_setter(
			case_2,
			'440_0',
			'al',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_2=setterdb.steam_game_timeperiod_setter(
			case_2,
			'440_1',
			'as',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_2.current_state='i'
		case_2.last_checked=dt.date(2020,1,1)
		setterdb.steam_game_save(case_2)
		cls.case_2=case_2

		####Current state is i but last period was not s
		case_3=getterdb.steam_game_getter('1488',logger)
		case_3=setterdb.steam_game_timeperiod_setter(
			case_3,
			'1488_0',
			'al',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_3=setterdb.steam_game_timeperiod_setter(
			case_3,
			'1488_1',
			's',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_3.current_state='i'
		case_3.last_checked=dt.date(2020,1,1)
		setterdb.steam_game_save(case_3)
		cls.case_3=case_3

		####Current state is i and last period was s (various games)
		case_4_0=getterdb.steam_game_getter('101',logger)
		case_4_0=setterdb.steam_game_timeperiod_setter(
			case_4_0,
			'101_0',
			'al',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_4_0=setterdb.steam_game_timeperiod_setter(
			case_4_0,
			'101_1',
			's',
			dt.date(2019,6,14),
			dt.date(2019,7,14),
			logger,
			av=100,
			dev=25
			)
		case_4_0.current_state='i'
		case_4_0.last_checked=dt.date(2020,1,1)
		setterdb.steam_game_save(case_4_0)
		cls.case_4_0=case_4_0

		case_4_1=getterdb.steam_game_getter('202',logger)
		case_4_1=setterdb.steam_game_timeperiod_setter(
			case_4_1,
			'202_0',
			'al',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_4_1=setterdb.steam_game_timeperiod_setter(
			case_4_1,
			'202_1',
			's',
			dt.date(2019,6,14),
			dt.date(2019,7,14),
			logger,
			av=200,
			dev=100
			)
		case_4_1=setterdb.steam_game_timeperiod_setter(
			case_4_1,
			'202_2',
			'as',
			dt.date(2019,7,15),
			dt.date(2019,8,14),
			logger
			)
		case_4_1=setterdb.steam_game_timeperiod_setter(
			case_4_1,
			'202_3',
			's',
			dt.date(2019,8,15),
			dt.date(2019,9,14),
			logger,
			av=100,
			dev=10
			)
		case_4_1.current_state='i'
		case_4_1.last_checked=dt.date(2020,1,4)
		setterdb.steam_game_save(case_4_1)
		cls.case_4_1=case_4_1

		case_4_2=getterdb.steam_game_getter('303',logger)
		case_4_2=setterdb.steam_game_timeperiod_setter(
			case_4_2,
			'303_0',
			'al',
			dt.date(2019,5,14),
			dt.date(2019,6,14),
			logger
			)
		case_4_2=setterdb.steam_game_timeperiod_setter(
			case_4_2,
			'303_1',
			's',
			dt.date(2019,6,14),
			dt.date(2019,7,14),
			logger,
			av=150,
			dev=25
			)
		case_4_2.current_state='i'
		case_4_2.last_checked=dt.date(2020,1,5)
		setterdb.steam_game_save(case_4_2)
		cls.case_4_2=case_4_2


	#Testing steam_game_get_i_appid
	def test_game_game_get_i_appid(self):
		check_list=getterdb.steam_game_get_i_appid()
		appid_list=[steamgame.appid for steamgame in check_list]
		logger.debug('Check id list from db: {}'.format(appid_list))
		self.assertEqual(appid_list,self.ids[1:])
		checkdb.write_checklist(
			appid_list,
			CONNECT_PATH+r'\Getters'
			)
		appid_list=checkdb.read_checklist(CONNECT_PATH+r'\Getters')
		self.assertEqual(appid_list,self.ids[1:])


	#Testing check_last_period
	@unittest.skip('Skipping check_last_period test')
	def test_check_last_period(self):
		self.assertEqual(
			checkdb.check_last_period('69lmao'),
			None
			)
		self.assertEqual(
			checkdb.check_last_period('440'),
			None
			)
		self.assertEqual(
			checkdb.check_last_period('1488'),
			None
			)
		self.assertEqual(
			checkdb.check_last_period('101'),
			('101',100,25)
			)
		self.assertEqual(
			checkdb.check_last_period('202'),
			('202',100,10)
			)
		self.assertEqual(
			checkdb.check_last_period('303'),
			('303',150,25)
			)
		
		for id_ in self.ids:
			case=getterdb.steam_game_getter(id_,logger)
			logger.debug(
				"""
				{} last_checked: {}
				""".format(id_,case.last_checked))


	#Testing main function
	def test_main(self):
		tuple_list=[]
		file=open('to_check.csv','w+',newline='')
		file.close()
		checkdb.main()
		with open('to_check.csv','r',newline='') as to_check_csv:
			reader=csv.reader(to_check_csv,delimiter=';')
			for row in reader:
				tuple_list.append((row[0],row[1],row[2]))
		self.assertEqual(tuple_list[0],('101','100.0','25.0'))
		self.assertEqual(tuple_list[1],('202','100.0','10.0'))
		self.assertEqual(tuple_list[2],('303','150.0','25.0'))


	#Tear Down class
	@classmethod
	def tearDownClass(cls):
		gamedb.SteamGame.objects(appid__in=cls.ids).delete()



#Execution
if __name__=='__main__':
	unittest.main()