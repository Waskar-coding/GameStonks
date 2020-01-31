#Libraries
import sys
OBJECT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Database Managerment\SteamDB\Objects'
SETTER_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Database Managerment\SteamDB\Setters'
sys.path.append(OBJECT_PATH)
sys.path.append(SETTER_PATH)
import unittest
import mongoengine
import steam_getters_db as getterdb
import steam_setters_db as setterdb
import steam_user_db as userdb
import steam_game_db as gamedb
import random as rd
import logging
import time
import datetime



#Starting loggers
##User logger
userlogger=logging.getLogger('TestUserAggretate')
userlogger.setLevel(logging.DEBUG)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('TestUserAggretate.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
userlogger.addHandler(file_handler)


##Game logger
gamelogger=logging.getLogger('TestGameAggretate')
gamelogger.setLevel(logging.DEBUG)
file_handler=logging.FileHandler('TestGameAggretate.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
gamelogger.addHandler(file_handler)


##Meta logger
metalogger=logging.getLogger('TestMetaAggretate')
metalogger.setLevel(logging.DEBUG)
file_handler=logging.FileHandler('TestMetaAggretate.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
metalogger.addHandler(file_handler)



#Setting Test class
class TestGetters(unittest.TestCase):
	##Creating game and populating user database
	@classmethod
	def setUpClass(cls):
		mongoengine.register_connection(alias='SteamDB',db='SteamDB')
		setterdb.steam_game_setter('69lmao',gamelogger)
		UseridList=[str(rd.randint(0,1000)) for i in range(20)]
		cls.UseridList=UseridList
		UseridList=list(set(UseridList))
		SteamGame=gamedb.SteamGame.objects(appid='69lmao').first()
		SteamGame.monitored=UseridList
		SteamGame.save()
		UserChoice={}
		UserGameplay={}
		game_count=2
		game_choice=[['69lmao','420'],['420','1488']]
		friend_number=10
		GMax=0
		GMin=10000

		for steamid in UseridList:
			choice=rd.randint(0,1)
			game_list=game_choice[choice]
			UserChoice[steamid]=choice
			setterdb.steam_user_setter(
										steamid,
										game_count,
										game_list,
										friend_number,
										userlogger
										)

			if not choice:
				Gameplay=0
				UserGameplay[steamid]=[]
				for i in range(3):
					Gameplay+=rd.randint(0,100)
					if Gameplay<GMin:
						GMin=Gameplay
					Today=datetime.date.today()+datetime.timedelta(days=i)
					UserGameplay[steamid].append((Today,Gameplay))
					setterdb.steam_user_addgameplay(
													steamid,
													'69lmao',
													Gameplay,
													Gameplay,
													Gameplay,
													Gameplay,
													gamelogger,
													userlogger
													)
				if Gameplay>GMax:
					GMax=Gameplay
		
		cls.GMax=GMax
		cls.GMin=GMin
		cls.UserChoice=UserChoice
		cls.UserGameplay=UserGameplay

		

	##Testing get gameplays function
	@unittest.skip('Skipping steam_get_gameplays test')
	def test_steam_get_gameplays(self):
		BaseGameplay=getterdb.steam_get_gameplays('69lmao',gamelogger)
		for i,Gameplays in enumerate(BaseGameplay):
			ModList=[]
			for j,Gameplay in enumerate(Gameplays.total_gameplay):
				Date=Gameplay[0].date()+datetime.timedelta(days=j)
				ModList.append((Date,Gameplay[1]))
			BaseGameplay[i]=ModList
		UserGameplay=self.UserGameplay
		for Gameplay in UserGameplay.values():
			self.assertIn(Gameplay,list(BaseGameplay))
		metalogger.debug('Gameplays base: {}'.format(UserGameplay))
		metalogger.debug('Gameplays test: {}'.format(BaseGameplay))
	

	##Testing find_extreme function
	@unittest.skip('Skipping find_extreme test')
	def test_find_extreme(self):
		import aggregate
		BaseGameplay=getterdb.steam_get_gameplays('69lmao',gamelogger)
		FuncMax=aggregate.find_extreme(BaseGameplay,'max',1)
		FuncMin=aggregate.find_extreme(BaseGameplay,'min',1)
		self.assertEqual(FuncMax,self.GMax)
		self.assertEqual(FuncMin,self.GMin)


	##Testing calculate_intervals function
	@unittest.skip('Skipping calculate_intervals test')
	def test_calculate_intervals(self):
		import aggregate
		BaseGameplay=getterdb.steam_get_gameplays('69lmao',gamelogger)
		FirstDate=datetime.datetime.now()
		FinalDate=datetime.datetime.now()+datetime.timedelta(days=1)
		SstGameplay=aggregate.find_extreme(BaseGameplay,'min',1)
		LstGameplay=aggregate.find_extreme(BaseGameplay,'max',1)

		date_period=datetime.timedelta(days=1)
		user_period=100

		date_list=[]
		CurrentDate=FirstDate
		while CurrentDate<=FinalDate:
			date_list.append([CurrentDate])
			CurrentDate+=date_period
		gameplay_list=[[Gameplay] for Gameplay in range(SstGameplay,LstGameplay+user_period,user_period)]

		for Gameplay in BaseGameplay:
			for i in range(3):
				Gameplay.total_gameplay[i][0]+=i*date_period
			date_list, gameplay_list=aggregate.calculate_intervals(
													Gameplay.total_gameplay,
													date_list,
													gameplay_list,
													FirstDate,
													SstGameplay,
													date_period,
													user_period
													)

		
		metalogger.debug('\nDate list: {}'.format(date_list))
		metalogger.debug('\nGameplay list: {}'.format(gameplay_list))


	##Testing aggregate_intervals function
	@unittest.skip('Skipping aggregate_intervals test')
	def test_aggregate_intervals(self):
		import aggregate
		import statistics

		date_list=[
					[datetime.date(2019,12,1),5,4,1],
					[datetime.date(2019,12,1),6,7,7],
					[datetime.date(2019,12,1),9,9,1]
					]
		
		av_1=sum([5,4,1])/3
		av_2=sum([6,7,7])/3
		av_3=sum([9,9,1])/3

		TestAv=[av_1,av_2,av_3]

		me_1=statistics.median([5,4,1])
		me_2=statistics.median([6,7,7])
		me_3=statistics.median([9,9,1])

		TestMe=[me_1,me_2,me_3]

		BaseAv, BaseMe=aggregate.aggregate_intervals(date_list)

		for test,base in zip(TestAv,BaseAv):
			self.assertEqual(test,base[1])
		for test,base in zip(TestMe,BaseMe):
			self.assertEqual(test,base[1])	
	

	##Testing main funciton
	##@unittest.skip('Skipping main test')
	def test_main(self):
		import aggregate
		aggregate.main('69lmao',datetime.timedelta(days=1),100,metalogger)
		metalogger.debug(gamedb.SteamGame.objects(appid='69lmao').first().to_json())


	##Deleting game and all fake users
	@classmethod
	def tearDownClass(cls):
		userdb.SteamUser.objects(userid__in=cls.UseridList).all().delete()
		gamedb.SteamGame.objects(appid='69lmao').all().delete()



if __name__=='__main__':
	unittest.main()
