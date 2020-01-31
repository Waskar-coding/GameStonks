#Description
"""
This module will check for new apps in steam and query the API for
information on every new product, the data is parsed using the
crunchfunc_products_steamapi module and stored in two different json
documents depending on whetter the game has been released or not.
The ProxyRotationManager object from the proxypy module will be used
to maintain anonimity during the whole process.
"""
__author__='Óscar Gómez Nonnato'
__date__='8/10/2019'



#Libraries
##Standard
from os import chdir,remove,environ
from time import sleep,time
from json import JSONDecodeError
from requests.exceptions import ProxyError
from datetime import datetime
from random import choice
from functools import wraps
import re
import csv
import requests
import json
import logging

##Packages
import pandas as pd

##Local
import proxypy
import Crunchfunc_Products_SteamAPI



#Initializing logger
logger=logging.getLogger('StoreMainFunc')
logger.setLevel(logging.INFO)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('store_products.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Getting all new apps
##Generating request url for Steam API
def url_api(
    env: str,
    func: str,
    version:str,
    **kwargs
    ) -> str:
    url='http://api.steampowered.com'+'/'+env+'/'+func+'/'+version+'/'
    if kwargs.keys()!=[]:
        url+='?'
        for key in kwargs.keys():
            url=url+key+'='+kwargs[key]+'&'
        url=url[:-1]
    return url


##Requesting all products
def request_all(url):
    response=requests.get(url)
    all_json=response.json()
    all_json=all_json['applist']['apps']
    return all_json


##Getting list of registered IDs
def reg_ID(name_doc):
    df=pd.read_csv(name_doc,sep=';')
    ID_reg=list(df['ID'])
    return ID_reg


##Extracting list of all app IDs
def all_ID(product_json):
    ID_all=[product['appid'] for product in product_json]
    return ID_all


##Checking for new IDs
def new_ID(ID_reg,ID_all):
    ID_new=list(set(ID_all).difference(set(ID_reg)))
    return ID_new


##Retrieving new products from json
def new_app(ID_new,product_json):
    new_dict={}
    for product in product_json:
        if product['appid'] in ID_new:
            new_dict.update({product['appid']:product['name']})
    return new_dict


##Writting new products in DB
def submit_app(name_doc,new_dict):
    with open(name_doc,'a',newline='') as csv_file:
        writer=csv.writer(csv_file,delimiter=';')
        for key in new_dict.keys():
            writer.writerow([key,new_dict[key].encode('utf-8')])



#Classifiying new apps
##Generating request URL for Steamstore API
def url_store(func,**kwargs):
    url='http://store.steampowered.com/api/'+func
    if kwargs.keys()!=[]:
        url+='?'
        for key in kwargs.keys():
            url=url+key+'='+kwargs[key]+'&'
        url=url[:-1]
    return url

    
##Requesting app details
def request_details(
        appid: str,
        url: str,
        **kwargs
        ) -> dict:
    proxies=kwargs['proxies']
    headers=kwargs['headers']
    timeout=kwargs['timeout']
    try:
        response=requests.get(url,proxies=proxies,
                              headers=headers,timeout=timeout)
        app_json=response.json()
        success=app_json[appid]['success']
        if success==True:
            app_json=app_json[appid]['data']
            logger.info('Successful request of {}'.format(appid))
        else:
            raise ProxyError
    except:
        try:
            response=requests.get(url)
            sleep(1)
            app_json=response.json()
            
            if response.status_code == 200:
                app_json=app_json[appid]['data']
                logger.info('Successful request of {}'.format(appid))
            else:
                raise ProxyError
        except:
            logger.warning('Unsuccessful request of {}'.format(appid))

    return app_json



#Additional functions    
##Dividing request arglist in chunks
def divide_chunks(list_,chunksize):
    divided_list=[]
    while len(list_)>chunksize:
        divided_list.append(list_[:chunksize])
        for i in range(chunksize):
            list_.pop(0)
    divided_list.append(list_)
    return divided_list



#Main
def main():
    ##All products: URL params
    env='ISteamApps'
    func='GetAppList'
    version='v0002'
    all_keywords={'format':'json'}
    
    ##All products: DB path
    name_doc='SteamAPI_product.csv'

    ##All prdocuts: URL genetarion and request processing
    url=url_api(env,func,version,**all_keywords)
    all_json=request_all(url)
    
    ##All products: Finding new apps
    ID_reg=reg_ID(name_doc)
    ID_all=all_ID(all_json)
    ID_new=new_ID(ID_reg,ID_all)
    new_dict=new_app(ID_new,all_json)
    
    ##All products: Submiting new apps
    submit_app(name_doc,new_dict)
    logger.info(
                """
                New products: {}
                """.format(ID_new))
    
    ##Steamstore: loading non released products
    with open('steam_soon.json','r') as json_file:
        soon_json=json.load(json_file)
        soon_list=list(soon_json['products'].keys())
    ID_new.extend(soon_list)

    ##Steamstore: request function args and params
    chunksize=10
    func='appdetails'
    store_urls=[url_store(func,appids=str(ID)) for ID in ID_new]
    request_func=request_details
    request_arglist=[[str(appid),url] for appid,url in zip(ID_new,store_urls)]
    divided_request_arglist=divide_chunks(request_arglist,chunksize)
    header_os=['win','mac','linux']
    
    ##Steamstore: crunch function params
    crunch_func=Crunchfunc_Products_SteamAPI.main
    
    ##Steamstore: refresh function params
    environ['chromedriver']=r'C:\Users\mcnon\OneDrive\Escritorio\chromedriver_win32\chromedriver'
    refresh_func=proxypy.pool_spyone
    refresh_arglist=['chromedriver','DE','AT','UK','FR']
    refresh_kwargdict={'Anonymity':['HIA','ANM'],'Uptime':70}
    refresh_time=60*5
    
    ##Steamstore: initial proxy list
    proxy_list=proxypy.pool_spyone(*refresh_arglist,**refresh_kwargdict)
    
    ##Steamstore: starting ProxyRotationManager
    store_manager=proxypy.ProxyRotationManager(
        proxy_list,
        request_func,
        request_arglist,
        header_os=header_os,
        crunch_func=crunch_func,
        refresh_func=refresh_func,
        refresh_func_args=refresh_arglist,
        refresh_func_kwargdict=refresh_kwargdict,
        refresh_time=refresh_time)
    
    ##Steamstore: the manager does its work for every chunk
    for chunk in divided_request_arglist:
        store_manager.request_arglist=chunk
        store_manager.multithread_request()
        store_manager.crunch()

    ##Deleting launched products from steam_soon.json
    with open('steam_products.json','r') as json_file:
        products_json=json.load(json_file)
        products_list=list(products_json['products'].keys())
    launched_list=list(set(products_list).intersection(set(soon_list)))
    logger.info('Launched products : {}'.format(launched_list))
    for appid in launched_list:
        del soon_json['products'][appid]
    with open('steam_soon.json','w') as json_file:
        json.dump(soon_json,json_file,indent=2)



#Execution
if __name__=='__main__':
    start=time()
    main()
    print(time()-start)