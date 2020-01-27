#Description
"""
Automatically downloads all timetables in steamdb website for the
selected games. The data is picked from the downloads folder and
properly ordered according to game id and the type of timetable
"""
__author__='Óscar Gómez Nonnato'
__date__='20/06/2019'



#Libraries
##Standard
import os
import re
import csv
import sys
import random
import logging
from shutil import copyfile
from time import sleep,time

##Packages
from bs4 import BeautifulSoup
from user_agent import generate_user_agent
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException,TimeoutException        
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.proxy import Proxy,ProxyType

##Local
PROXY_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
    r'\Proyecto Owners\Scrapers'
sys.path.append(PROXY_PATH)
import proxypy



#Initializing logger
logger=logging.getLogger('DBmainfunc')
logger.setLevel(logging.INFO)
st_format='%(name)s %(asctime)s %(levelname)s %(message)s'
formatter=logging.Formatter(st_format)
file_handler=logging.FileHandler('steamDB_products.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



#Get downloads path
def get_download_path() -> None:
    ##Documentation
    """
    Returns the default downloads path for linux or windows
    """

    ##Finding download dir path
    if os.name == 'nt':
        import winreg
        sub_key = r'SOFTWARE\Microsoft\Windows'\
            r'\CurrentVersion\Explorer\Shell Folders'
        downloads_guid = '{374DE290-123F-4565-9164-39C4925E467B}'
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, sub_key) as key:
            location = winreg.QueryValueEx(key, downloads_guid)[0]
        return location
    else:
        return os.path.join(os.path.expanduser('~'), 'downloads')



#Downloading the price evolution charts
def download_prices(
        appid: str,
        driver: webdriver.Chrome
        ) -> None:
    ##Documentation
    """
    Enters in the web directory of steamdb for an app's price, if the
    app is not free the price timetable is downloaded.

    Parameters
    ----------
    appid: str
        Steam's id for the app.
    
    driver: selenium.webdriver.Chrome
        A webdriver object from the Selenium library, could be any
        type of webdriver, but webdriver.Chrome is set as default.
    """

    ##Accessing webpage and waiting until download button appears
    url='https://steamdb.info/app/'+appid+'/prices/'
    driver.get(url)
    driver.execute_script("return document.documentElement.outerHTML")
    WebDriverWait(driver, 20)\
        .until(EC.presence_of_element_located(
            (
                By.CLASS_NAME, 
                "highcharts-button-symbol"
                )
            )
        )

    ##Finding and pressing download button
    d_button=driver.find_element_by_class_name('highcharts-button-symbol')
    d_button.click()
    d_form=driver\
        .find_element_by_xpath("//*[contains(text(), 'Download CSV')]")
    d_form.click()



#Downloading the players per day chart
def download_players(
        appid: str,
        driver: webdriver.Chrome,
        period: str
        ):
    ##Documentation
    """
    Enters steamdb's web directory for the app's concurrent players
    timetable. Downloads the number of players timetable.
    
    Parameters
    ----------
    appid: str
        Steam's aplication id

    driver: selenium.webdriver.Chrome
        A webdriver object from the Selenium library, could be any
        type of webdriver, but webdriver.Chrome is set as default.

    period: str
        Timeperiod format in which the timetable is downloaded.
        
        Examples:
            js-chart-year    
        
    """

    ##Accessing webpage and waiting until download button appears
    url='https://steamdb.info/app/'+appid+'/graphs/'
    driver.get(url)
    driver.execute_script("return document.documentElement.outerHTML")
    WebDriverWait(driver, 20)\
        .until(EC.presence_of_element_located((By.ID, period)))
    
    ##Finding and pressing download button
    year_chart=driver.find_element_by_id(period)
    download_button=year_chart\
        .find_element_by_class_name("highcharts-button-symbol")
    download_button.click()
    download_form=driver\
        .find_element_by_xpath("//*[contains(text(), 'Download CSV')]")
    download_form.click()
     
    ##Checking downloads directory and changing file's name
    path_download=get_download_path()
    path_name=os.path.normpath('chart.csv')
    path_comp=os.path.normpath(appid+'_Players.csv')
    path_file=os.path.join(path_download,path_name)
    path_repeated=os.path.join(path_download,path_comp)
    os.chdir(path_download)
    check_file=os.path.isfile(path_file)
    start_time=time()
    while check_file==False:
        check_file=os.path.isfile(path_file)
        dt=time()-start_time
        if dt>30:
            raise Exception('Download timelimit exceeded')
    if os.path.isfile(path_repeated)==True:
        os.remove(path_repeated)
    sleep(2)
    os.rename('chart.csv',appid+'_Players.csv')

    ##Writting down app as downloaded
    with open('Downloaded.csv','a') as csv_downloaded:
        csv_downloaded.write(appid+'\n')

    

#Getting product's rating
def get_rating(
        appid: str,
        driver: webdriver.Chrome
        ):
    #Documentation
    """
    Gets the good and bad rating for a Steam app acording to steamdb
    and writes them in downloaded.csv

    Parameters
    ----------
    appid: str
        Steam's aplication id

    driver: selenium.webdriver.Chrome
        A webdriver object from the Selenium library, could be any
        type of webdriver, but webdriver.Chrome is set as default.
    """
    
    ##Getting rates
    good_ratings=driver\
        .find_elements_by_class_name('header-thing-good')[1].text
    bad_ratings=driver\
        .find_element_by_class_name('header-thing-poor').text
    good_ratings=good_ratings.replace(',','')
    bad_ratings=bad_ratings.replace(',','')
    
    ##Writting down in downloaded.csv
    with open('downloaded.csv','a',newline='') as downloaded_csv:
        writer=csv.writer(downloaded_csv,delimiter=';')
        writer.writerow([appid,good_ratings,bad_ratings])


        
#Classifiying downloaded files according to pattern_func
def classify_file(
        classified_path: str,
        pattern_func: 'function',
        **kwargs
        ) -> None:
    ##Documentation
    """
    Searches a given pattern within the names of the download directory,
    all matches all removed from the current directory and saved in a
    new one.

    Parameters
    ----------
    classified_path: str
        Destination path for files that match the pattern

    pattern_func: function
        Function that takes an arbitrary number of arguments and
        searches a pattern within them. Must return a bool object. 
    """

    ##Accessing download path
    download_path=get_download_path()
    os.chdir(download_path)
    
    ##Matching with pattern_func and copying in other dir
    name_list=os.listdir()
    for name in name_list:
        if pattern_func(name,**kwargs):
            download_abspath=os.path.join(download_path,name)
            classified_abspath=os.path.join(classified_path,name)
            copyfile(download_abspath,classified_abspath)
            os.remove(name)



#Pattern for prices files
def prices_pattern(filename: str) -> bool:
    ##Documentation
    """
    Matches the filename with the pattern for price timetables,
    returns True if the pattern is matched and False otherwise.

    Parameters
    ----------
    filename: str
        Name of the file
    """

    ##Matching pattern for filename
    file_flag=filename.split('-')[0]
    match=re.search(r'\bprice',file_flag)
    if match!=None:
        return True
    else:
        return False



#Pattern for players files
def players_pattern(filename: str) -> bool:
    ##Documentation
    """
    Matches the filename with the pattern for concurrent players
    timetables, returns True if the pattern is matched and False
    otherwise.

    Parameters
    ----------
    filename: str
        Name of the file
    """

    ##Matching pattern for filename
    split_filename=filename.split('_')
    if len(split_filename)!=2:
        return False
    else:
        file_flag=split_filename[1]
        match=re.search(r'\bPlayers.csv',file_flag)
        if match!=None:
            return True
        else:   
            return False



#Downloading product's: players and prices
def download_product(
        appid: str,
        is_free: bool,
        proxy: str
        ):
    ##Documentation
    """
    Initializes the driver and sets its parameters; applies the
    functions download_prices, download_players and get_ratings 
    of this module and classifies the resulting download products.

    Parameters
    ----------
    appid: str
       App's steam id 
    
    is_free: bool
        Indicates if the game is free
    
    proxy: str
        IP direction of the proxy followed by port
    """

    ##Paths for driver and players & prizes destination dirs 
    DRIVER_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
        r'\chromedriver_win32\chromedriver'
    PRICE_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
        r'\Proyecto Owners\Scrapers\ScraperDB\Prices'
    PLAYER_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
        r'\Proyecto Owners\Scrapers\ScraperDB\Players'

    ##Assigning parameters to the driver
    os_list=['win','mac','linux']
    device_list=['desktop']
    user_agent=generate_user_agent(os=os_list,device_type=device_list)
    capabilities = dict(DesiredCapabilities.CHROME)
    capabilities['proxy'] = {
        'proxyType': 'MANUAL',
        'httpProxy': proxy,
        'ftpProxy': proxy,
        'sslProxy': proxy,
        'noProxy': '',
        'class': "org.openqa.selenium.Proxy",
        'autodetect': False
        }
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--incognito")
    chrome_options.add_argument("user-agent="+str(user_agent))
    chrome_options.add_argument("--proxy-server="+proxy)
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--ignore-ssl-errors")
    driver=webdriver.Chrome(
        DRIVER_PATH,
        options=chrome_options,
        desired_capabilities=capabilities
        )
    
    ##Appliying download function to the driver
    try:
        if is_free==False:
            download_prices(appid,driver)
        download_players(appid,driver,'js-chart-year')
        get_rating(driver,appid)
    except:
        logger.exception(
            """
            Exception while downloading {} 
            while using {}
            """.format(appid,proxy)
            )
    else:
        logger.info("{} correctly downloaded".format(appid))
    finally:
        driver.quit()

    ##Classifying resulting files
    classify_file(PRICE_PATH,prices_pattern)
    classify_file(PLAYER_PATH,players_pattern)



#Main
def main():
    ##Documentation
    """
    Module's main function. Gets a list of steam apps, downloads
    and classifies their availble time tables from steamdb.
    """

    ##Driver path
    DRIVER_PATH=r'C:\Users\mcnon\OneDrive\Escritorio'\
        r'\chromedriver_win32\chromedriver'
    os.environ['chromedriver']=DRIVER_PATH

    ##Getting steam apps to download
    with open('to_download.csv','r',newline='') as download_csv:
        reader=csv.reader(download_csv,delimiter=';')
        product_dict={}
        for row in reader:
            product_dict.update({row[0]:row[1]})
    
    ##Getting proxy list
    p_arglist=['chromedriver','US','NL']
    p_kwargdict={'Anonymity':['HIA'],'Uptime':70}
    proxy_list=proxypy.pool_spyone(*p_arglist,**p_kwargdict)

    ##Checking if aplication is free
    for key in product_dict.keys():
        appid=key
        if product_dict[key]=='0':
            is_free=True
        elif product_dict[key]=='1':
            is_free=False
        else:
            raise AttributeError(
                """
                Unsupported command {}
                """.format(product_dict[key]))
        proxy=random.choice(proxy_list)
        download_product(appid,is_free,proxy)



#Execution
if __name__=='__main__':
    main()