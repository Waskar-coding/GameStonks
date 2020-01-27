#Libraries
##Standard
import os
import json
import requests
import logging



#Initializing logger
logger=logging.getLogger('AchievmenetsCrunchFunc')
logger.setLevel(logging.INFO)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('Achievments.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#File management
def set_achievements(
					path: os.path,
					appid: str,
					achievements: dict,
					) -> None:
	os.chdir(path)
	with open('achievements.json','r') as AchievementDoc:
		AchievementDict=json.load(AchievementDoc)
	AchievementDict['games'][appid]=achievements
	with open('achievements.json','w') as AchievementDoc:
		json.dump(AchievementDict,AchievementDoc,indent=2)



#Modify percentajes
def modify_percents(achievements: dict) -> dict:
	AchievementList=achievements['achievementpercentages']['achievements']
	AchievementDict={}
	for Achievement in AchievementList:
		name=Achievement['name']
		percent=round(Achievement['percent'],2)
		AchievementDict.update({name:percent})
	return AchievementDict



#Main function
def main(data_dict: dict) -> None:
	appid=list(data_dict.keys())[0]
	achievements=list(data_dict.values())[0]
	ACHIEVEMENT_PATH=r'C:\Users\mcnon\OneDrive\Escritorio\Proyecto Owners\Scrapers\ScraperArchievementsAPI'
	ACHIEVEMENT_DOCNAME='achievments.json'

	if achievements!={}:
		achievements=modify_percents(achievements)
		logger.info('Achievements for {} correctly saved'.format(appid))
	else:
		logger.warning('A problem ocurred with {}'.format(appid))
	
	set_achievements(
					ACHIEVEMENT_PATH,
					appid,
					achievements
					)



#Execution
if __name__=='__main__':
	print('Steam Achievement Scrapper Manual Mode')
	appid=input('Introduce Appid: ')
	url='http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid='+appid
	response=requests.get(url)
	AchievementJson=response.json()
	AchievementDict=modify_percents(AchievementJson)
	print(AchievementDict)