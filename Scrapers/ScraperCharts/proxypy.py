# -*- coding: utf-8 -*-
"""
Created on Thu Sep 26 17:35:19 2019

@author: Óscar Gómez Nonnato
"""
import re
import pandas as pd
import requests
import os
from threading import Lock
from time import sleep,time
from selenium import webdriver
from bs4 import BeautifulSoup
from requests.exceptions import HTTPError,ProxyError, ConnectTimeout, ReadTimeout
from json import JSONDecodeError
from random import choice
from user_agent import generate_user_agent
from concurrent.futures import ThreadPoolExecutor,as_completed


#Useful functions
def set_path(driver_file):
    """
    Stores a driver's absolute path into an enviromental variable
    for future use.
    
    Parameters
    ----------
    driver_file: str
        Default name of any of the drivers implemented in Selenium 
        (see https://www.seleniumhq.org/projects/webdriver/).
        
    Notes
    -----
    At the moment only chromedriver is implemented for this module
    """
    if type(driver_file).__name__!='str':
        raise TypeError('driver_file should be string not' + type(driver_file).__name__)
    driver_exe=driver_file+'.exe'
    try:
        os.environ[driver_file]
    except KeyError:
        print("Driver's path not stored")
        print("Searching file, this might take a while")
        HOMEPATH=os.environ['HOMEPATH']
        os.chdir(HOMEPATH)
        for dirpath, subdirs, files in os.walk(HOMEPATH):
            for filename in files:
                if filename==driver_exe:
                    if '.exe' in filename:
                        filename=filename.replace('.exe','')
                    driver_path=os.path.join(dirpath,filename)
                    os.environ[driver_file]=driver_path
                    print('Storing driver_path in enviromental var '+driver_path)
                    break

def activate_driver(driver_file):
    """
    Launches web driver with selenium in incognito mode if posible.
    
    Parameters
    ----------
    driver_file: str
        Default name of any of the drivers implemented in Selenium 
        (see https://www.seleniumhq.org/projects/webdriver/). Must
        habe been previously stored as an enviromental variable by 
        calling set_path.
    
    Notes
    -----
    At the moment only chromedriver is implemented for this module
    """
    if type(driver_file).__name__!='str':
        raise TypeError('driver_file should be string not' + type(driver_file).__name__)
    driver_path=os.environ[driver_file]
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--incognito")
    driver=webdriver.Chrome(driver_path,options=chrome_options)
    return driver

def get_html(url,driver,sleeptime,**kwargs):
    """
    Requests and loads html using the passed  Selenium
    driver then parses it using a BeautifulSoup object.
    
    Parameters
    ----------
    url: str
        Web adress of the html
    
    driver: selenium.webdriver.chrome.webdriver.WebDriver
        Activated selenium webdriver object previously initiaslized
        by calling activate_driver.
    
    sleeptime: int,float
        Waiting time before the html is parsed, can be used if
        the driver takes sometime to execute all javascript code
        in the requested html
    
    **kwargs:
        parser: str
            Specifies the parser that the BeautifulSoup object
            will be using, lxml is the default
    
    Notes
    -----
    AttributeError will be raised for any non-implemented kwargs
    """
    if type(url).__name__!='str':
        raise TypeError('url should be string not' + type(url))
    if type(sleeptime).__name__!='float' and type(sleeptime).__name__!='int':
        raise TypeError('sleeptime should be int or float not' + type(sleeptime).__name__)
    Accepted_keys=['parser']
    for key in list(kwargs.keys()):
        if key not in Accepted_keys:
            raise AttributeError('Unknown property: '+key)
    if 'parser' in list(kwargs.keys()):
        parser=kwargs['parser']
    else:
        parser='lxml'
    driver.get(url)
    sleep(sleeptime)
    html_soup=BeautifulSoup(driver.page_source,parser)
    return html_soup



#Proxy rotation manager
class ProxyRotationManager(object):
    """
    class ProxyRotationManger(object)
    
    Creates an object that will execute a request function
    with a list of changing arguments while randommly changing
    IPs from all the provided proxies and spoofing headers using
    the user_agent library. Additionally the request function
    can accept key argumentsM a crunch function can be provided
    in order to manipulate the data obtained using the request
    function; moreover it is possible to specify a refresh 
    function that dinamically actualizes the proxy_list after
    a certain condition is met or when some time has passed.
    
    
    Class Attributes
    ----------------
    accepted_types: dict
        A dictionary which contains the accepted types for each attribute
        that might be assigned to the object.
    
    _isfrozen: bool
        Indicates when new attributes can be added to the object, when it is
        set on True adding new attributes will raise AttributeError. However
        previously assigned attributes can still be modified. By default this
        variable starts as False.
    
    
    Class Methods
    -------------
    get_accepted_types(cls):
        Returns the classes' accepted_types attribute.
    
    
    Attributes
    ----------
    proxy_list: list
        List with all the proxies that the manager can use when executing
        the request function, must provide str objects with the proxy's
        IP and port in the correct format for the requests library.
    
    status: dict
        Dictionary object created when __init__ is called, all proxy
        adresses in proxy_list are included as keys, the argument is
        a bool object that signals if the proxy is currently being used
        in for a request. The proxies' value in status is initially False
        When a request is sent to a server through a proxy its value in 
        status will be True until a response is received or an exception
        is raised. This attribute is used in the request method in order
        to avoid overwhelming a proxy with multiple requests.
    
    request_func: function
        Should be function that sends a request to a webpage host using
        the requests library. The function must accept each element of
        request_arglist as arguments, and **request_kwargdict as kwargs.
        The function should return the webpage host's response.
        Example:
        
        >>def request_details(appid,url,**kwargs):
            proxies=kwargs['proxies']
            headers=kwargs['headers']
            timeout=kwargs['timeout']
            response=requests.get(url,proxies=proxies,
                                  headers=headers,timeout=timeout)
            return response
        
        Proxies, headers and timeout are always included in request_kwargdict
        when the request method is called.
            
    request_arglist: list
        List containing all the desired args to pass to request_func, using
        the multithread_request method you can call request_func with 
        different args in order to go through all the args in this list as fast 
        as posible.
        
    request_kwargdict: dict
        Key arguments to pass to request_func, the request method will always
        add proxies, headers, and timeout as keys, each one with the values
        accepted by requests.get as kwargs. If not modified by the previous
        method, it defaults to an empty dictionary object {}.
    
    header_devices: str,list
        Key argument that will be passed to user_agent.generate_user_agent to 
        specify which devices can be passed as user_agent when spoofing headers.
        Upon calling the request method, generate_user_agent create a user
        using one of the specified devices. Default is desktop.
    
    header_os: str, list
        Key argument that will be passed to user_agent.generate_user_agent to 
        specify which OS can be passed as user_agent when spoofing headers.
        Upon calling the request method, generate_user_agent create a user
        using one of the specified OS. Default is win.
        
    timeout: int, float
    """
    
    accepted_types={'proxy_list':'list',
                    'status':'dict',
                    'request_func':'function',
                    'request_arglist':'list',
                    'request_kwargdict':'dict',
                    'header_devices':('str','list'),
                    'header_os':('str','list'),
                    'timeout':('int','float'),
                    'crunch_func':'function',
                    'crunch_kwargdict':'dict',
                    'max_workers_t':'int',
                    'max_refresh':'int',
                    'wait':('int','float'),
                    'refresh_func':'function',
                    'refresh_func_args':'list',
                    'refresh_func_kwargdict':'dict',
                    'refresh_if':'function',
                    'refresh_if_kwargdict':'dict',
                    'refresh_time':('int','float'),
                    'lost_cache':'list',
                    'passed_cache':'dict',
                    '_isded':'bool'}
    
    _isfrozen=False
    
    @classmethod
    def get_accepted_types(cls):
        return cls.accepted_types

    ##Check if type is correct
    def check_accepted_types(self,key,attribute):
        if not(type(attribute).__name__ in self.accepted_types[key]): 
            raise TypeError("""Unsupported type, check the accepted_types dictionary""")
    
    ##__init__ method
    def __init__(self,proxy_list,request_func,request_arglist,
                 myaccepted_types=accepted_types,
                 frozen=_isfrozen,**kwargs):
        self._isfrozen=frozen
        self.accepted_types=myaccepted_types
        self.crunch_func='NaN'
        self.crunch_kwargdict={}
        self.max_workers_t=None
        self.max_refresh=10
        self.wait=5
        self.header_devices='desktop'
        self.header_os='win'
        self.timeout=5
        self.refresh_func=None
        self.refresh_func_args=None
        self.refresh_func_kwargdict=None
        self.refresh_if=None
        self.refresh_if_kwargdict=None
        self.refresh_time=None
        self.proxy_list=proxy_list
        self.status={proxy:False for proxy in proxy_list}
        self.request_func=request_func
        self.request_arglist=request_arglist
        self.request_kwargdict={}
        self.lost_cache=[]
        self.passed_cache={}
        self._isded=False
        for key in list(kwargs.keys()):
            self.check_accepted_types(key,kwargs[key])
            self.__dict__.update({key:kwargs[key]})
        self._isfrozen=True
        
    ##__setattr__ method
    def __setattr__(self,name,value):
        if self._isfrozen and not(hasattr(self,name)):
            raise AttributeError('Unimplemented attribute')
        object.__setattr__(self,name,value)
    
    ##Request args setter
    def set_basic_args(self,proxy_list,request_func,
                       request_arglist,request_kwargdict):
        attrs={'proxy_list':proxy_list,
               'request_func':request_func,
               'request_arglist':request_arglist,
               'request_kwargdict':request_kwargdict}
        for key,attr in attrs.items():
            self.check_accepted_types(key,attr)
            self.__dict__.update({key:attrs[key]})
        self.status={proxy:False for proxy in proxy_list}
    
    ##Requests args getter
    def get_basic_args(self):
        return {'proxy_list':list(self.status.keys()),
                'request_func':self.request_func,
                'request_args':self.request_arglist,
                'request_kwargdict':self.request_kwargdict}
    
    ##Crunch params setter
    def set_crunch_params(self,crunch_func,crunch_kwargdict):
        attrs={'crunch_func':crunch_func,
               'crunch_kwargdict':crunch_kwargdict}
        for key,attr in attrs.items():
            self.check_accepted_types(key,attr)
            self.__dict__.update({key:attrs[key]})
    
    ##Crunch params getter
    def get_crunch_params(self):
        return {'crunch_func':self.crunch_func,
                'crunch_kwargdict':self.crunch_kwargdict}
    
    ##Multithreading params setter
    def set_threading_params(self,max_workers_t,wait,max_refresh):
        attrs={'max_workers_t':max_workers_t,
               'wait':wait,
               'max_refresh':max_refresh}
        for key,attr in attrs.items():
            self.check_accepted_types(key,attr)
            self.__dict__.update({key:attrs[key]})
    
    ##Multithreading params getter
    def get_threading_params(self):
        return {'max_workers_t':self.max_workers_t,
                'wait':self.wait,
                'max_refresh':self.max_refresh}
    
    ##Request params setter
    def set_request_params(self,request_kwargdict,
                           header_devices,header_os,timeout):
        attrs={'request_kwargdict':request_kwargdict,
               'header_devices':header_devices,
               'header_os':header_os,
               'timeout':timeout}
        for key,attr in attrs.items():
            self.check_accepted_types(key,attr)
            self.__dict__.update({key:attrs[key]})
    
    ##Request params getter
    def get_request_params(self):
        return {'request_kwargdict':self.request_kwargdict,
                'header_devices':self.header_devices,
                'header_os':self.header_os,
                'timeout':self.timeout}
    
    ##Multiprocess params setter
    def set_process_params(self):
        pass
    
    ##Multiprocess params getter
    def get_process_params(self):
        pass
    
    ##Reset params setter
    def set_refresh_params(self,refresh_func,refresh_func_args,
                           refresh_func_kwargdict,refresh_if,
                           refresh_if_kwargdict,refresh_time):
        attrs={'refresh_func':refresh_func,
               'refresh_func_args':refresh_func_args,
               'refresh_func_kwargdict':refresh_func_kwargdict,
               'refresh_if':refresh_if,
               'refresh_if_kwargdict':refresh_if_kwargdict,
               'refresh_time':refresh_time}
        for key,attr in attrs.items():
            self.check_accepted_types(key,attr)
            self.__dict__.update({key:attrs[key]})

    ##Reset params getter
    def get_refresh_params(self):
        return {'refresh_func':self.refresh_func,
                'refresh_func_args':self.refresh_func_args,
                'refresh_func_kwargdict':self.refresh_func_kwargdict,
                'refresh_if':self.refresh_if,
                'refresh_if_kwargdict':self.refresh_if_kwargdict,
                'refresh_time':self.refresh_time}

    ##Do a single request while rotating proxies & spoofing headers
    def request(self,args):
        max_count=30
        count=0
        user_agent=generate_user_agent(os=self.header_os,
                                       device_type=self.header_devices)
        headers={'User-Agent':user_agent}            
        proxy_flag=False
        proxy=choice(self.proxy_list)
        self.request_kwargdict.update({'timeout':self.timeout})
        while proxy_flag==False:
            if count>=max_count:
                proxy_flag=True
                data=None
            while self.status[proxy]==True:
                proxy=choice(self.proxy_list)
            proxies={"http" :proxy,"https":proxy}
            self.request_kwargdict.update({'proxies':proxies,
                                           'headers':headers,
                                           'timeout':self.timeout})
            try:
                self.status[proxy]=True
                if type(args).__name__=='str':
                    data=self.request_func(args,**self.request_kwargdict)
                else:
                    data=self.request_func(*args,**self.request_kwargdict)
            except (ProxyError,ConnectTimeout,
                    ReadTimeout,requests.ConnectionError,JSONDecodeError):
                count+=1
                proxy=choice(self.proxy_list)
            else:
                proxy_flag=True 
            finally:
                self.status[proxy]=False
        return data
    
    ##Do multitple requests while rotating proxies & spoofing headers
    def multithread_request(self):
        with ThreadPoolExecutor(max_workers=self.max_workers_t) as executor:
            futures={}
            start=time()
            lock=Lock()
            refresh_count=0
            for args in self.request_arglist:
                futures.update({executor.submit(self.request,args):args})
            for future in as_completed(futures):
                args=futures[future]
                data=future.result(self.wait)
                dt=time()-start
                r_time_flag=False
                r_cond_flag=False
                if self.refresh_func!=None and self.refresh_time!=None:    
                    r_time_flag=self.timed_refresh(dt)
                if self.refresh_func!=None and self.refresh_if!=None:
                    r_cond_flag=self.condition_refresh(data,
                                                       self.refresh_if_kwargdict)
                if r_time_flag==False and r_cond_flag==False:
                    self.passed_cache.update({args[0]:data})
                elif r_cond_flag==True:
                    lock.acquire()
                    self.refresh()
                    self.lost_cache.append(args[0])
                    refresh_count+=1
                    if refresh_count>=self.max_refresh:
                        self._isded=True
                        executor.shutdown(wait=False)
                        break
                    lock.release()
                elif r_time_flag==True:
                    lock.acquire()
                    self.refresh()
                    lock.release()
                    self.passed_cache.update({args[0]:data})
                    start=time()
                self.request_arglist.remove(args)
        self._isded=True
        for args in self.request_arglist:
            if not(args in self.passed_cache.keys()):
                self.lost_cache.append(args[0])
    
    ##Apply crunch function to requests responses in cache
    def crunch(self):
        lock=Lock()
        while self.passed_cache!={}:    
            if type(self.crunch_func).__name__!='function':
                raise AttributeError('The crunch function is not correctly defined')
            elif len(self.passed_cache)==0:
                pass
            else:
                lock.acquire()
                key=list(self.passed_cache.keys())[-1]
                value=list(self.passed_cache.values())[-1]
                self.passed_cache.popitem()
                lock.release()
                data={key:value}
                self.crunch_func(data,**self.crunch_kwargdict)
            self._isded=True
    
    ##Refresh the proxylist
    def refresh(self):
        proxy_list=self.refresh_func(*self.refresh_func_args,
                                   **self.refresh_func_kwargdict)
        self.proxy_list=proxy_list
        self.status={proxy:False for proxy in proxy_list}
    
    ##Refresh after some time
    def timed_refresh(self,dt):
        r_time_flag=False
        if dt>=self.refresh_time:
            r_time_flag=True
        return r_time_flag
    
    ##Refresh after a condition is met
    def condition_refresh(self,data):
        r_cond_flag=False
        if type(data)=='list':
            for d in data:
                if self.refresh_if(data,**self.refresh_if_kwargdict)==True:
                    r_cond_flag=True
        else: 
            if self.refresh_if(data,**self.refresh_if_kwargdict)==True:
                r_cond_flag=True
        return r_cond_flag


#Spyone
##Downloading proxy table from spyone
def spyone_page(driver,Country,Page,is_new,**kwargs):
    ####Downloading
    url='http://spys.one/free-proxy-list/'+Country+'/'+Page+'/'
    if 'sleeptime' in list(kwargs.keys()):
        sleeptime=kwargs['sleeptime']
    else:
        sleeptime=2
    if 'parser' in list(kwargs.keys()):
        parser=kwargs['parser']
        html_soup=get_html(url,driver,sleeptime,parser=parser)
    else:
        html_soup=get_html(url,driver,sleeptime)
    df=pd.read_html(str(html_soup))[2]
    ###Initial formatting
    df=df.drop(df.index[[0,1]])
    df=df.reset_index(drop=True)
    new_header=list(df.iloc[0])
    df=df.drop(df.index[[0]])
    df.columns=new_header
    df=df.dropna(axis=0,subset=['Proxy address:port'])
    df=df.dropna(axis=1)
    df=df.reset_index(drop=True)
    df=df.drop(df.index[[-1]])
    df=df.rename(columns={'Anonymity*':'Anonymity','Latency**':'Latency'})
    ###Proxy address:port formatting
    proxies_raw=(list(df['Proxy address:port']))
    proxies_filtered=[]
    for element in proxies_raw:
        element=re.sub(r'\([^)]*\)', '', element)
        element=re.sub(r'[^0-9.:]+','',element)
        IP=element.split(':')[0][:-1]
        Port=element.split(':')[1]
        element=IP+':'+Port
        proxies_filtered.append(element)
    df['Proxy address:port']=proxies_filtered
    ###Proxy type formatting
    del_company=lambda my_str: my_str.split(' ')[0]
    df['Proxy type']=df['Proxy type'].map(del_company)
    ###Uptime formatting
    del_count=lambda my_str: my_str.split('%')[0]
    format_new=lambda my_str: '100' if 'new' in my_str else my_str
    df['Uptime']=df['Uptime'].map(del_count)
    df['Uptime']=df['Uptime'].map(format_new)
    ###Adding Speed
    get_width=lambda my_soup: my_soup['width']
    speed_list=list(map(get_width,html_soup.find_all('table',{'height':'8'})))
    df['Speed']=speed_list
    ##Eliminating useless columns
    useless_columns=[
            'Country (city/region)',
            'Hostname/ORG',
            'Check date (GMT+03)'
            ]
    df=df.drop(columns=useless_columns)
    ###Saving csv
    DESKTOP_PATH=os.path.join(os.environ['HOMEPATH'],"Desktop")
    os.chdir(DESKTOP_PATH)
    if is_new==True:
        mode='w'
    else:
        mode='a'
    df.to_csv('spyone.csv',sep=';',index=False,mode=mode,header=is_new)
        
##Going through all pages for each country
def spyone_country(driver,country,is_new,**kwargs):
    Page=0
    while Page<2:
        try:
            spyone_page(driver,country,str(Page),is_new,**kwargs)
        except requests.exceptions.HTTPError:
            raise HTTPError('Failed to download proxies from '+country)
        Page+=1

##Filtering values from dataset
def spyone_filter(df,**kwargs):
    Accepted=[
            'Proxy type',
            'Anonymity',
            'Latency',
            'Uptime',
            'Speed',
            'sleeptime',
            'parser']
    for key in kwargs.keys():
        if key not in Accepted:
            raise AttributeError('Unknown property '+key)    
        elif key=='Proxy type' or key=='Anonymity':
            if type(kwargs[key])==str:
                df=df.loc[df[key]==kwargs[key]]    
            elif type(kwargs[key])==list:
                df=df.loc[df[key].isin(kwargs[key])]    
            else:
                raise TypeError('Type must be str or list')    
        elif key=='Uptime' or key=='Speed':
            df=df.loc[df[key]>=kwargs[key]]    
        elif key=='Latency': 
            df=df.loc[df[key]<=kwargs[key]]    
        else:
            pass    
    return df

##Main function
def pool_spyone(*args,**kwargs):
    """
    Selects proxies from http://spys.one/free-proxy-list/ with the
    specified characteristics.
    
    Parameters
    ----------
    *args:
        args[0]: str
            The first position in the arglist is always the name of the
            driver to use for scraping the page.
        
        args[1:]: str
            Abreviated names of the countries from which you wish to retrieve
            free proxies
    
    **kwargs:
        Proxy type: list
            Filter by server protocol (example: [HTTP],[HTTPS,SOCKS5],...)
        
        Anonymity: list
            Filter by anonimity level (example: [HIA],[NOA],...)
        
        Latency: int,float
            Filter by proxy latency
        
        Uptime: int,float
            Filter by proxy uptime percentage
        
        Speed: int,float
            Filter by proxy speed
        
        sleeptime: int,float
            Specifies the seconds the driver must wait before parsing
            the requested html content with BeautifulSoup. Default is
            2 seconds
        
        parser: str
            Specifies the parser that the BeautifulSoup object
            will be using, lxml is the default
        
    Returns
    -------
    A list object with the all the proxies that meet the specifications,
    all ready to pass as a kwarg in python's requests library
        
    """
    driver=activate_driver(args[0])
    is_new=True
    for country in args[1:]:
        if type(country)==str:
            spyone_country(driver,country,is_new,**kwargs)
        else:
            raise TypeError('Type must be str not '+type(country).__name__)    
        is_new=False
    driver.quit()
    DESKTOP_PATH=os.path.join(os.environ['HOMEPATH'],"Desktop")
    os.chdir(DESKTOP_PATH)
    df=pd.read_csv('spyone.csv',delimiter=';')
    df=spyone_filter(df,**kwargs)
    col_A='Proxy address:port'
    col_B='Proxy type'
    df.loc[df[col_B]=='SOCKS5',col_A]='socks5://'+df[col_A]
    df.loc[df[col_B]=='HTTP',col_A]='http://'+df[col_A]
    df.loc[df[col_B]=='HTTPS',col_A]='https://'+df[col_A]
    pool=list(df[col_A])
    return pool