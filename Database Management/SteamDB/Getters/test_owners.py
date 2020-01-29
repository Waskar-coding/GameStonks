#Description
"""
This module is aimed to test all functions in owners.py.
"""
__author__='Óscar Gómez Nonnato'
__date__='08/01/2020'



#Libraries
##Standard
import logging
import datetime as dt

##Packages
import unittest

##Local
import owners



#Starting logger
logger=logging.getLogger('TestOwners')
logger.setLevel(logging.DEBUG)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('TestOwners.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Creating TestCase
class TestOwners(unittest.TestCase):
	##Set up class
	@classmethod
	def setUpClass(cls):
		player_list_full=[
			(dt.date(2020,1,1),100),
			(dt.date(2020,1,2),150),
			(dt.date(2020,1,3),200),
			(dt.date(2020,1,4),300),
			(dt.date(2020,1,5),400),
			(dt.date(2020,1,6),1000),
			(dt.date(2020,1,7),1050),
			(dt.date(2020,1,8),1048),
			(dt.date(2020,1,9),1060),
			(dt.date(2020,1,10),1050),
			(dt.date(2020,1,11),900),
			(dt.date(2020,1,12),800),
			(dt.date(2020,1,13),700),
			(dt.date(2020,1,14),600),
			(dt.date(2020,1,15),500),
			(dt.date(2020,1,16),400),
			(dt.date(2020,1,17),400)
			]

		player_list_empty=[
			(dt.date(2020,1,1),100),
			(dt.date(2020,1,2),150),
			(dt.date(2020,1,3),200),
			(dt.date(2020,1,4),300),
			(dt.date(2020,1,5),''),
			(dt.date(2020,1,6),''),
			(dt.date(2020,1,7),1050),
			(dt.date(2020,1,8),1048),
			(dt.date(2020,1,9),1060),
			(dt.date(2020,1,10),1050),
			(dt.date(2020,1,11),900),
			(dt.date(2020,1,12),800),
			(dt.date(2020,1,13),700),
			(dt.date(2020,1,14),600),
			(dt.date(2020,1,15),500),
			(dt.date(2020,1,16),400),
			(dt.date(2020,1,17),400)
			]

		player_list_incomplete=[
			(dt.date(2020,1,1),100),
			(dt.date(2020,1,2),150),
			(dt.date(2020,1,3),200),
			(dt.date(2020,1,4),''),
			(dt.date(2020,1,5),400),
			(dt.date(2020,1,6),1000),
			(dt.date(2020,1,7),1050),
			(dt.date(2020,1,8),''),
			(dt.date(2020,1,9),1060),
			(dt.date(2020,1,10),1050),
			(dt.date(2020,1,11),900),
			(dt.date(2020,1,12),800),
			(dt.date(2020,1,13),700),
			(dt.date(2020,1,14),600),
			(dt.date(2020,1,15),500),
			(dt.date(2020,1,16),400),
			(dt.date(2020,1,17),400)
			]

		player_list_first=[
			(dt.date(2020,1,1),100),
			(dt.date(2020,1,2),150),
			(dt.date(2020,1,3),''),
			(dt.date(2020,1,4),300),
			(dt.date(2020,1,5),400),
			(dt.date(2020,1,6),1000),
			(dt.date(2020,1,7),1050),
			(dt.date(2020,1,8),1048),
			(dt.date(2020,1,9),1060),
			(dt.date(2020,1,10),1050),
			(dt.date(2020,1,11),900),
			(dt.date(2020,1,12),800),
			(dt.date(2020,1,13),700),
			(dt.date(2020,1,14),600),
			(dt.date(2020,1,15),500),
			(dt.date(2020,1,16),400),
			(dt.date(2020,1,17),400)
			]

		player_list_last=[
			(dt.date(2020,1,1),100),
			(dt.date(2020,1,2),150),
			(dt.date(2020,1,3),200),
			(dt.date(2020,1,4),300),
			(dt.date(2020,1,5),400),
			(dt.date(2020,1,6),1000),
			(dt.date(2020,1,7),1050),
			(dt.date(2020,1,8),1048),
			(dt.date(2020,1,9),1060),
			(dt.date(2020,1,10),1050),
			(dt.date(2020,1,11),900),
			(dt.date(2020,1,12),800),
			(dt.date(2020,1,13),700),
			(dt.date(2020,1,14),600),
			(dt.date(2020,1,15),''),
			(dt.date(2020,1,16),400),
			(dt.date(2020,1,17),400)
			]
		
		cls.player_list_full=player_list_full
		cls.player_list_empty=player_list_empty
		cls.player_list_incomplete=player_list_incomplete
		cls.player_list_first=player_list_first
		cls.player_list_last=player_list_last
		cls.start=dt.date(2020,1,3)
		cls.end=dt.date(2020,1,15)


	##Testing slice_fill_players
	###Full list
	def test_slice_fill_players_full(self):
		test_full=owners.slice_fill_players(
			self.player_list_full,
			self.start,
			self.end
			)
		mod_full=[list(pt) for pt in self.player_list_full][2:-2]
		self.assertEqual(test_full,mod_full)

	###Incomplete list
	def test_slice_fill_players_incomplete(self):
		test_i=owners.slice_fill_players(
			self.player_list_incomplete,
			self.start,
			self.end
			)
		mod_i=[list(pt) for pt in self.player_list_incomplete]
		mod_i=mod_i[2:-2]
		mod_i[1][1]=(mod_i[0][1]+mod_i[2][1])/2
		mod_i[5][1]=(mod_i[4][1]+mod_i[6][1])/2
		self.assertEqual(test_i,mod_i)

	###Last list
	def test_slice_fill_players_last(self):
		test_last=owners.slice_fill_players(
			self.player_list_last,
			self.start,
			self.end
			)
		mod_last=[list(pt) for pt in self.player_list_last][2:-2]
		mod_last[-1][1]=mod_last[-2][1]
		self.assertEqual(test_last,mod_last)

	###First list
	def test_slice_fill_players_first(self):
		with self.assertRaises(ValueError) as context:
			test_first=owners.slice_fill_players(
				self.player_list_first,
				self.start,
				self.end
				)
			exception_message="""
				First position in players list is empty: {}
				""".format(self.player_list_first[0])
			self.assertTrue(exception_message in context.exception)

	###Empty list
	def test_slice_fill_player_empty(self):
		with self.assertRaises(ValueError) as context:
			test_empty=owners.slice_fill_players(
				self.player_list_empty,
				self.start,
				self.end
				)
			exception_message="""
				Two consecutive empty points in players timetable:
				{}, {}
				""".format(
					self.player_list_empty[4],
					self.player_list_empty[5]
					)


	##Testing calculate_averages
	###Grouped by 1 day
	def test_calculate_averages_min(self):
		test_min=owners.calculate_averages(
			self.player_list_full,
			dt.timedelta(days=1)
			)
		mod_full=[float(pt[1]) for pt in self.player_list_full]
		self.assertEqual(test_min,mod_full)

	###Grouped by a month
	def test_calculate_average_max(self):
		test_max=owners.calculate_averages(
			self.player_list_full,
			dt.timedelta(days=30)
			)
		mod_full=[list(pt) for pt in self.player_list_full]
		list_sum=0
		for pt in mod_full:
			list_sum+=pt[1]
		mod_full=[list_sum/len(mod_full)]
		self.assertEqual(test_max,mod_full)

	###Grouped by 2 days
	def test_calculate_average_normal(self):
		test_normal=owners.calculate_averages(
			self.player_list_full,
			dt.timedelta(days=2)
			)
		mod_full=[
			250/2,250.0,700.0,
			1049.0,1055.0,850.0,
			650.0,450.0,400.0
			]
		self.assertEqual(test_normal,mod_full)


	#Tear down class
	@classmethod
	def tearDownClass(cls):
		pass