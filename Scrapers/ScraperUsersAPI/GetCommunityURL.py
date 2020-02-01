#Libraries
import re
import logging
import requests


#Initializing logger
logger=logging.getLogger('URLCrunchFunc')
logger.setLevel(logging.INFO)
formatter=logging.Formatter('%(name)s %(asctime)s %(levelname)s %(message)s')
file_handler=logging.FileHandler('URL_users.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



def main(profile_url,key,**kwargs):
	proxies=kwargs['proxies']
	headers=kwargs['headers']
	timeout=kwargs['timeout']
	vanity_flag=False

	COMMUNITY_MATCH=re.compile(r'https://steamcommunity.com/profiles/[0-9]{17}/')
	CUSTOM_MATCH=re.compile(r'https://steamcommunity.com/id/')

	community_flag=COMMUNITY_MATCH.match(profile_url)
	custom_flag=CUSTOM_MATCH.match(profile_url)

	if community_flag==None and custom_flag==None:
		logger.error('Unexpected url format: {}'.format(profile_url))
		profile_num=None
	elif community_flag!=None and custom_flag!=None:
		logger.error('Unexpected url format: {}'.format(profile_url))
		profile_num=None
	elif community_flag!=None:
		profile_num=profile_url.split('/')[4]
	else:
		vanity_flag=True
		steamid=profile_url.split('/')[4]
		logger.debug(steamid)
		base_url='https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/'
		key_url='key='+key
		id_url='vanityurl='+steamid
		url=base_url+'?'+key_url+'&'+id_url
		logger.debug(url)
		try:
			if proxies=='my_ip' and headers=='my_user':
				response=requests.get(url,timeout=timeout)
			elif proxies=='my_ip':
				response=requests.get(url,headers=headers,timeout=timeout)
			elif headers=='my_user':
				response=requests.get(url,proxies=proxies,timeout=timeout)
			else:
				response=requests.get(url,proxies=proxies,headers=headers,timeout=timeout)
		except:
			logger.exception('An exception ocured during request for {}'.format(steamid))
			profile_num=None
		else:
			success=response.json()['response']['success']
			if success!=1:
				logger.error('Unsuccessful request for {}'.format(steamid))
				profile_num=None
			else:
				profile_num=response.json()['response']['steamid']

	return (profile_num,vanity_flag)



if __name__=='__main__':
	profile_url=input('User community url: ')
	key='24E7A4CB6C2041D4C08EC325A5F4FFC3'
	request_dict={
					'proxies':'my_ip',
					'headers':'my_user',
					'timeout':5
					}
	print(main(profile_url,key,**request_dict))
