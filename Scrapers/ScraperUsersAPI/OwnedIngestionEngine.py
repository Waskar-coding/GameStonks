#Libraries
##Standard
import sys
import logging
import datetime

##Packages
import requests
import mongoengine

##Local
OBJECT_PATH = '../../Database Management/SteamDB/Objects'
sys.path.append(OBJECT_PATH)
import steam_game_db as gamedb
import steam_user_db as userdb
import steam_jackpot_db as jackpotdb



#Initializing logger
logger = logging.getLogger('OwnedCrunchFunc')
logger.setLevel(logging.INFO)
ST_FORMAT = '%(name)s %(asctime)s %(levelname)s %(message)s'
formatter = logging.Formatter(ST_FORMAT)
file_handler = logging.FileHandler('owned_games.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Ban user for having a private profile
def banUser(user: userdb.SteamUser) -> userdb.SteamUser:
	##Documentation
	"""
	This function bans any user that has a private profile,
	despite the fact that the rules of what jackpot specified.
	Sets all user GameplayRegisters to active attribute
	to false; all user's JackpotRegisters have their status
	attribute set to 'k'; a BanRegister is created, the user
	is issued a B02 type ban with two months of duration.
	Finally the user banned state is set to true and the ban
	begins.  

	Parameters
	----------
	user (steam_user_db.SteamUser):
		User register from SteamDB.
	"""

	##Cancelling all active GameplayRegisters
	for register in user.monitored:
		if register.active:
			register.active = False

	##Cancelling all active JackpotRegisters
	for jackpot in user.jackpots:
		jackpot.status = 'k'

	##Creating a new ban
	NEW_BAN = userdb.BanRegister()
	NEW_BAN.ban_start = datetime.datetime.now()
	NEW_BAN.ban_type = 'B02'
	NEW_BAN.ban_active = True
	NEW_BAN.ban_end = NEW_BAN.ban_start \
		+ datetime.timedelta(days=60)
	NEW_BAN.ban_doc = 'B02.txt'
	user.bans.append(NEW_BAN)
	user.banned = True

	return user



#Striking users who do not have the games their claim
def strikeUser(
	user: userdb.SteamUser,
	gamelist: list
	) -> userdb.SteamUser:
	##Documentation
	"""
	This function strikes users who declared possesing games
	they do not actually have. A StrikeRegister is created
	and the user is kicked from all J01 or J02class jackpots, 
	plus the GameRegisters from all the false games will have 
	their active attribute set to false. The strike count is 
	raised by 1 and checked, if the current_strikes attribute 
	is 3 strikes or more it will be set to 0 and the user will 
	be issued a class B02 ban by calling the function banUser
	from this module.

	Parameters
	----------
	user (steam_user_db.SteamUser):
		A user register from SteamDB.

	gamelist (list):
		List of the games the user lied about.
	"""

	##Cancelling all games from gamelist
	for register in user.monitored:
		if register.appid in gamelist:
			register.active = False

	##Kicking the user from all J01 or J02 jackpots
	for jackpot in user.jackpots:
		current_jackpot = jackpotdb.SteamJackpot\
			.objects(jackpot_id=jackpot.jackpot_id).first()
		if current_jackpot.jackpot_class in ['J01','J02']:
			jackpot.status = 'k'

	user.current_strikes += 1
	NEW_STRIKE = userdb.StrikeRegister()
	NEW_STRIKE.strike_date = datetime.datetime.now()
	NEW_STRIKE.strike_total = user.current_strikes
	NEW_STRIKE.strike_reason = """
		You declared in a J01 jackpot, the possesion
		of games that you did not have at the time
		"""
	user.strikes.append(NEW_STRIKE)

	##Banning users with three strikes or more
	if user.current_strikes >= 3:
		user.current_strikes = 0
		user = banUser(user)

	return user



#Public profile ingestion
def updateUser(
	user: userdb.SteamUser,
	data_json: dict
	) -> userdb.SteamUser:
	##Documentation
	"""
	Once it has been confirmed that the user has a public profile
	all his active GameplayRegisters are retrieved, this function
	will check if all games appids from the registers exist in 
	the response json (otherwise a strikeUser will be called), 
	and then add the updated information.

	Parameters
	----------
	user (steam_user_db.SteamUser):
		An user register from SteamDB.

	data_json (dict):
		The json response from SteamAPI containing information
		about the player's owned games. 
	"""

	##Finding all active registers
	games_db = []
	registers_db = []
	for register in user.monitored:
		if register.active:
			games_db.append(register.appid)
			registers_db.append(register)

	##Unpacking data_json
	if 'games' in data_json.keys():
		data_json = data_json['games']
		games_steam = [str(game['appid']) for game in data_json]
	else:
		logger.error(
			"""
			A problem has occured with {}: {}
			""".format(user.steamid,data_json)
			)
		return user

	##Checking if the user owns all the games he claimed
	if set(games_db).intersection(set(games_steam)) != set(games_db):
		print('Striking user')
		user = strikeUser(user,games_db)
		return user

	##Extracting information from selected games
	for register in user.monitored:
		if register.appid in games_db:
			today = datetime.datetime.now()
			i = games_db.index(register.appid)
			allplay = data_json[i]['playtime_forever']
			winplay = data_json[i]['playtime_windows_forever']
			macplay = data_json[i]['playtime_mac_forever']
			linplay = data_json[i]['playtime_linux_forever']
			register.total_gameplay.append([today,allplay])
			register.win_gameplay.append([today,winplay])
			register.mac_gameplay.append([today,macplay])
			register.lin_gameplay.append([today,linplay])

	return user



#Main
def main(data_dict: dict) -> None:
	
	steamid, data_json = list(data_dict.items())[0]
	user = userdb.SteamUser.objects(steamid=steamid).first()

	if data_json['response'] == {}:
		user = banUser(user)
	else:
		user = updateUser(user, data_json['response'])

	user.save()
	

#Execution
if __name__=='__main__':
	user = userdb.SteamUser.objects(name='CHADVS MAXIMVS').first()
	url='http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=24E7A4CB6C2041D4C08EC325A5F4FFC3&steamid='+steamid+'&include_played_free_games=true&format=json'
	response=requests.get(url)
	try:
		print(response.json()['response']['game_count'])
	except:
		print('Private profile')
	else:
		data_dict={steamid:response.json()}
		settings={'game_list':[440]}
		main(data_dict,**settings)
