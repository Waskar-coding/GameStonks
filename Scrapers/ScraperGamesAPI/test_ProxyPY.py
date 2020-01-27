# -*- coding: utf-8 -*-
"""
Created on Fri Oct 11 19:43:48 2019

@author: mcnon
"""

import unittest
from random import randint
from time import sleep
from ProxyPy import ProxyRotationManager,pool_spyone

class TestRotationManager(unittest.TestCase):    
    def setUp(self):
        proxy_list=['https://80.32.122.118:60971',
                    'https://185.198.184.14:48122',
                    'https://212.230.24.186:49201',
                    'https://185.44.26.170:49133',
                    'http://62.99.53.95:32654',
                    'socks5://213.98.44.44:1080',
                    'socks5://47.91.88.100:1080',
                    'http://45.133.8.2:8888',
                    'https://176.9.195.49:8080', 
                    'socks5://176.9.40.163:999',
                    'socks5://88.198.35.181:701',
                    'socks5://95.179.201.114:30725',
                    'https://5.152.198.45:8118',
                    'https://51.38.71.101:8080',
                    'socks5://138.68.161.14:1080',
                    'socks5://138.68.173.29:1080',
                    'socks5://139.59.169.246:1080',
                    'socks5://138.68.165.154:1080',
                    'https://109.169.14.168:80',
                    'socks5://212.111.43.246:1080']
        
        def my_request(ID,**kwargs):
            sleep(5)
            my_num=randint(0,5)
            print('This be request')
            return my_num
    
        request_arglist=['216938','660010','660130','468510',
                         '468520','468530','468540']
        request_kwargdict={'proxies':'lel','headers':'lol'}
        
        crunch_kwargdict=dict({'a':2,'b':3})
        def crunch_func(data,**kwargs):
            print(data)
        
        header_devices='desktop'
        header_os=['win','mac']
        timeout=5
        
        max_workers_t=10
        wait=5
        max_refresh=1
        
        def refresh_if_func(data,**kwargs):
            if data==0:
                print(data)
                print('Meet refresh if')
                refresh_flag=True
            else:
                refresh_flag=False
            return refresh_flag
        
        def mock_refresh():
            print('This be refresh')
            return proxy_list
        
        refresh_func_args=[]
        refresh_func_kwargdict={}
        refresh_if=refresh_if_func
        refresh_if_kwargdict={}
        refresh_time=2
        
        self.manager_1=ProxyRotationManager(proxy_list,my_request,
                                            request_arglist)
        self.manager_2=ProxyRotationManager(proxy_list,my_request,
                                            request_arglist,
                                            request_kwargdict=request_kwargdict,
                                            crunch_func=crunch_func,
                                            crunch_kwargdict=crunch_kwargdict,
                                            header_devices=header_devices,
                                            header_os=header_os,
                                            timeout=timeout,
                                            max_workers_t=max_workers_t,
                                            wait=wait,
                                            max_refresh=max_refresh,
                                            refresh_func=mock_refresh,
                                            refresh_func_args=refresh_func_args,
                                            refresh_func_kwargdict=refresh_func_kwargdict,
                                            refresh_if=refresh_if,
                                            refresh_if_kwargdict=refresh_if_kwargdict,
                                            refresh_time=refresh_time)  

    @unittest.skip     
    def test_getset(self):
        crunch_kwargdict={'a':2,'b':3}
        def crunch_func(data,**kwargs):
            print(data)
            print(kwargs['a'])
            print(kwargs['b'])
            return data
        
        header_devices='desktop'
        header_os=['win','mac']
        timeout=5
        request_kwargdict={'proxies':'lel','headers':'lol'}
        
        max_workers_t=5
        wait=5
        max_refresh=10
        
        def refresh_if_func(data,**kwargs):
            if 'dingus' in kwargs.values():
                refresh_flag=True
            else:
                refresh_flag=False
            return refresh_flag
        
        refresh_func=pool_spyone
        refresh_func_args=['ES','DE']
        refresh_func_kwargdict={'Anonymity':['HIA']}
        refresh_if=refresh_if_func
        refresh_if_kwargdict={'big':'dingus'}
        refresh_time=2
        
        print('manager_1 crunch')
        self.manager_1.set_crunch_params(crunch_func,crunch_kwargdict)
        self.assertEqual(self.manager_1.get_crunch_params(),{'crunch_func':crunch_func,'crunch_kwargdict':crunch_kwargdict})
        
        print('manager_2 crunch')        
        print(crunch_func.__name__)
        print(self.manager_2.crunch_func.__name__)
        print(crunch_kwargdict)
        print(self.manager_2.crunch_kwargdict)
        
        print('manager_1 request params')
        self.manager_1.set_request_params(request_kwargdict,header_devices,header_os,timeout)
        self.assertEqual(self.manager_1.get_request_params(),{'request_kwargdict':request_kwargdict,'header_devices':header_devices,'header_os':header_os,'timeout':timeout})
        
        print('manager_2 request params')
        self.assertEqual(self.manager_2.get_request_params(),{'request_kwargdict':request_kwargdict,'header_devices':header_devices,'header_os':header_os,'timeout':timeout})
        
        print('manager_1 threading params')
        self.manager_1.set_threading_params(max_workers_t,wait,max_refresh)
        self.assertEqual(self.manager_1.get_threading_params(),{'max_workers_t':max_workers_t,'wait':wait,'max_refresh':max_refresh})
        
        print('manager_2 threading params')
        self.assertEqual(self.manager_2.get_threading_params(),{'max_workers_t':max_workers_t,'wait':wait,'max_refresh':max_refresh})
        
        print('manager_1 refresh params')
        self.manager_1.set_refresh_params(refresh_func,refresh_func_args,refresh_func_kwargdict,refresh_if,refresh_if_kwargdict,refresh_time)
        self.assertEqual(self.manager_1.get_refresh_params(),{'refresh_func':refresh_func,'refresh_func_args':refresh_func_args,'refresh_func_kwargdict':refresh_func_kwargdict,'refresh_if':refresh_if,'refresh_if_kwargdict':refresh_if_kwargdict,'refresh_time':refresh_time})
        
        print('manager_2 refresh params')
        self.assertEqual(self.manager_1.get_refresh_params(),{'refresh_func':refresh_func,'refresh_func_args':refresh_func_args,'refresh_func_kwargdict':refresh_func_kwargdict,'refresh_if':refresh_if,'refresh_if_kwargdict':refresh_if_kwargdict,'refresh_time':refresh_time})
        
        print('testing private attributes')
        self.assertEqual(self.manager_1._isded,False)
        self.assertEqual(self.manager_2._isfrozen,True)
        
        print('Testing TypeError raise when not in accepted_types')
        self.assertRaises(TypeError,self.manager_2.set_request_params,1,'desktop',2)
        self.assertRaises(TypeError,self.manager_2.set_request_params,{'proxy':'a'},4,2)
        

    def test_request(self):
        self.manager_2.do_your_shit()
        print(self.manager_2.lost_cache)
        print(self.manager_2.passed_cache)

        

    
if __name__=='__main__':
    unittest.main()