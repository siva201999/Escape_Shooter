
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");Components.utils.import("resource://gre/modules/Services.jsm");var CI=Components.interfaces;var CC=Components.classes;var observerService=CC['@mozilla.org/observer-service;1'].getService(CI.nsIObserverService);var loader=CC["@mozilla.org/moz/jssubscript-loader;1"].getService(CI.mozIJSSubScriptLoader);loader.loadSubScript("chrome://ytoolbar/content/utils.js");loader.loadSubScript("chrome://ytoolbar/content/logger.js");const daysToMilliSecFactor=24*60*60*1000;const notifyEventName="yahoo-show-eventtip";const computeTimeInterval=1*daysToMilliSecFactor;const lastTipTimestampConfigKey="etp.lasttiptimestamp";const __INFINITE__=999999;function WrapperClass(object){this.wrappedJSObject=this;this.object=object;}
WrapperClass.prototype={QueryInterface:function(iid){if(!iid.equals(Components.interfaces.nsISupports)){throw Components.results.NS_ERROR_NO_INTERFACE;}
return this;}};var eTriggerTypes={ET_INVALID:0,ET_MESSENGER_EXTERNAL_SIGNIN:1,ET_NAVCOMPLETE_REGEX:2,ET_USER_HIGHLIGHT_RIGHTCLK:3,ET_BUTTON_SHOWN:4,ET_ADD_FAVORITES:5,ET_TOOLBAR_INACTIVE:6,ET_BUTTON_FIRST_CLICK:7,ET_GROUP_BUTTON_OPENED:8,ET_ELAPSED_SINCE_INSTALL:9,ET_OVERFLOWING:10,ET_METRO_SYNC:11,ET_FEED_PARAM:12,ET_BUTTON_STATE:13,ET_SEARCH_PROVIDER:15};var eAcceptTypes={AT_IGNORE:0,AT_TRUE:1,AT_FALSE:2};var eEventTypes={ET_INVALID:-1,ET_URL_NAV:0,ET_BTN_CLICK:1,ET_LAYOUT:2,ET_TIMEOUT:3,ET_METRO_SYNC:4,ET_MORE_MENU:5,ET_SEARCH:6};function CommonObjects(){this.urlProbe=CC["@yahoo.com/urlprobe;1"].getService(CI.nsIYahooUrlProbe);this.localstorage=CC["@yahoo.com/localstorage;1"].getService(CI.nsIYahooLocalStorage);this.confMgr=CC["@yahoo.com/configmanager;1"].getService(CI.nsIYahooConfigManager);this.fileIO=CC["@yahoo.com/fileio;1"].getService(CI.nsIYahooFileIO2);this.toolbarManager=null;this.daysSinceLastTip=-1;this.daysSinceInstall=-1;this.daysTBIsInactive=-1;this.tbUpgraded=false;this.tipsEnabled=true;}
function tipUIData(){this.buttonId="grp_fav";this.tipUrl="";this.autoClose=0;this.tipRoll=[];}
function EventTip(dataObj){var _dataObj=dataObj;var _self=this;var _eventType=eEventTypes.ET_INVALID;var _stateData={};_stateData.triggerCondHit=0;_stateData.tipShown=false;_stateData.clicked=eAcceptTypes.AT_FALSE;_stateData.tipDate=0;this.triggerType=eTriggerTypes.ET_INVALID;this.tipId="";this.tipRoll=[];this.position="grp_fav";this.regex="";this.messengerStatus=0;this.btnId="";this.btnAvail=0;this.btnClicked=0;this.installSilencePeriod=0;this.lastTipSilencePeriod=0;this.autoClosePeriod=0;this.triggerConditionHitCnt=3;this.trigDaysSinceInstall=1;this.toolbarUsed=0;this.ignoreSilentPeriod=0;this.inactivityPeriod=0;this.customized=0;this.toolbarUpgraded=0;this.installType=0;this.loginStatus=0;this.portability=0;this.metroSync=0;this.showAlways=0;this.ignoreUserPref=0;this.feedParamName="";this.tipUrlParam=null;this.trigDaysForYes=7;this.trigDaysForNo=30;function _checkExceptionConditions(){var bRetVal=false,recentWin=CC['@mozilla.org/appshell/window-mediator;1'].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser");try{bRetVal=_dataObj.tipsEnabled;if(_self.ignoreUserPref===eAcceptTypes.AT_TRUE){bRetVal=true;}
if(bRetVal&&_self.btnAvail!==eAcceptTypes.AT_IGNORE){var btnPresent=eAcceptTypes.AT_FALSE;if(_self.btnId.indexOf(';')>0){btnIds=_self.btnId.split(';');for(var i=0;i<btnIds.length;i++){btnPresent=btnPresent=recentWin.document.getElementById("yahoo-toolbar-"+btnIds[i])?eAcceptTypes.AT_TRUE:eAcceptTypes.AT_FALSE;}}else{btnPresent=recentWin.document.getElementById("yahoo-toolbar-"+_self.btnId)?eAcceptTypes.AT_TRUE:eAcceptTypes.AT_FALSE;}
bRetVal=(btnPresent==_self.btnAvail)?true:false;}
if(bRetVal&&_self.btnClicked!==eAcceptTypes.AT_IGNORE){bRetVal=(_stateData.clicked==_self.btnClicked)?true:false;}
if(bRetVal&&_self.optionToggle!==''){var opArray=_self.optionToggle.split(','),key=opArray[0]||'',val=opArray[1]||'';if(key!=''){key='button.'+key;}
if(val==''){bRetVal=!_dataObj.confMgr.isKeyPresent(key);}
else{var sval=_dataObj.confMgr.getBoolValue(key);bRetVal=(sval==val);}}
if(bRetVal&&_self.customized!==eAcceptTypes.AT_IGNORE){var never_cust=(_dataObj.confMgr.getCharValue("toolbar.lastcust"))?eAcceptTypes.AT_FALSE:eAcceptTypes.AT_TRUE;bRetVal=(never_cust==_self.customized)?true:false;}
if(bRetVal&&_self.toolbarUsed!==eAcceptTypes.AT_IGNORE){var tbUsed=(_dataObj.confMgr.getCharValue("toolbar.lastuse"))?eAcceptTypes.AT_TRUE:eAcceptTypes.AT_FALSE;bRetVal=(tbUsed==_self.toolbarUsed)?true:false;}
if(bRetVal&&_self.toolbarUpgraded!==eAcceptTypes.AT_IGNORE){bRetVal=(_dataObj.tbUpgraded==_self.toolbarUpgraded)?true:false;}
if(bRetVal&&_self.loginStatus!==eAcceptTypes.AT_IGNORE){var currentLoginStatus=_dataObj.toolbarManager.isGuestMode()===true?eAcceptTypes.AT_FALSE:eAcceptTypes.AT_TRUE;bRetVal=(currentLoginStatus==_self.loginStatus)?true:false;}
if(bRetVal&&_self.portability!==eAcceptTypes.AT_IGNORE){var portSet=_dataObj.localstorage.getString("port")==="-1"?eAcceptTypes.AT_FALSE:eAcceptTypes.AT_TRUE;bRetVal=(portSet==_self.portability)?true:false;}
if(bRetVal&&_self.metroSync!==eAcceptTypes.AT_IGNORE){var metroSyncSet=_dataObj.localstorage.getString("metroexp")==="-1"?eAcceptTypes.AT_FALSE:eAcceptTypes.AT_TRUE;bRetVal=(metroSyncSet==_self.metroSync)?true:false;}
if(bRetVal&&_self.triggerType===eTriggerTypes.ET_BUTTON_STATE){var el=recentWin.document.getElementById("yahoo-toolbar-"+_self.btnId);if(el){var bs=_self.buttonState,ov=el.getAttribute('ovText');if((bs=='')&&(ov=='')){bs='1';}
if(typeof(el.getState=='function')&&(bs!='')){if(bs=='nz'){bRetVal=(el.getState()>0);}
else{bRetVal=(bs==el.getState());}}}}}catch(e){yahooError(e.message);bRetVal=false;}
return bRetVal;}
function _serializeJSON(){try{var jsonFilePath=_dataObj.toolbarManager.isGuestMode()?_dataObj.fileIO.getCacheDir():_dataObj.fileIO.getUserCacheDir();jsonFilePath.appendRelativePath("etp-"+_self.tipId+".json");var json=yahooUtils.JSON.stringify(_stateData);_dataObj.fileIO.writeFile(jsonFilePath,json);}catch(e){yahooError(e.message);}}
function _deserializeJSON(){try{var jsonFilePath=_dataObj.toolbarManager.isGuestMode()?_dataObj.fileIO.getCacheDir():_dataObj.fileIO.getUserCacheDir();jsonFilePath.appendRelativePath("etp-"+_self.tipId+".json");var json=_dataObj.fileIO.readFile(jsonFilePath);_stateData=json?yahooUtils.JSON.parse(json):_stateData;}catch(e){yahooError(e.message);}}
this.init=function(){try{switch(_self.triggerType){case eTriggerTypes.ET_NAVCOMPLETE_REGEX:_eventType=eEventTypes.ET_URL_NAV;_dataObj.urlProbe.addUrlNotifier(_self.regex);break;case eTriggerTypes.ET_BUTTON_SHOWN:case eTriggerTypes.ET_FEED_PARAM:case eTriggerTypes.ET_BUTTON_STATE:_eventType=eEventTypes.ET_LAYOUT;break;case eTriggerTypes.ET_BUTTON_FIRST_CLICK:case eTriggerTypes.ET_GROUP_BUTTON_OPENED:_eventType=eEventTypes.ET_BTN_CLICK;break;case eTriggerTypes.ET_ELAPSED_SINCE_INSTALL:case eTriggerTypes.ET_TOOLBAR_INACTIVE:_eventType=eEventTypes.ET_TIMEOUT;break;case eTriggerTypes.ET_OVERFLOWING:_eventType=eEventTypes.ET_MORE_MENU;break;case eTriggerTypes.ET_METRO_SYNC:_eventType=eEventTypes.ET_METRO_SYNC;break;case eTriggerTypes.ET_SEARCH_PROVIDER:_eventType=eEventTypes.ET_SEARCH;break;}
_deserializeJSON();}catch(e){yahooError(e.message);}};this.getState=function(){return _stateData;};this.saveState=function(){return _serializeJSON();};this.do_triggerTip=function(occurredEventType,data){var bRetVal=false,oState=_stateData;if(occurredEventType===eEventTypes.ET_BTN_CLICK){if(_self.btnId!=""&&data===("yahoo-toolbar-"+_self.btnId)){_stateData.clicked=eAcceptTypes.AT_TRUE;}}
if((_eventType===occurredEventType)&&((_stateData.tipShown===false)||(this.showAlways==eAcceptTypes.AT_TRUE))){if(_stateData.tipDate&&(_stateData.tipDate!=0))
{var now=new Date(),then=new Date(_stateData.tipDate);if((now.getTime()-then.getTime())<daysToMilliSecFactor)
{return false;}}
switch(_eventType){case eEventTypes.ET_BTN_CLICK:_stateData.clicked=eAcceptTypes.AT_TRUE;break;case eEventTypes.ET_URL_NAV:if(data.match(_self.regex)){if(++_stateData.triggerCondHit>=_self.triggerConditionHitCnt){bRetVal=true;}}
break;case eEventTypes.ET_LAYOUT:var topWin=CC['@mozilla.org/appshell/window-mediator;1'].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser");if(_self.triggerType===eTriggerTypes.ET_BUTTON_SHOWN&&topWin.document.getElementById("yahoo-toolbar-"+_self.btnId)){bRetVal=true;}else if(_self.triggerType===eTriggerTypes.ET_FEED_PARAM&&_dataObj.localstorage.getString(_self.feedParamName)){bRetVal=true;}else if(_self.triggerType===eTriggerTypes.ET_BUTTON_STATE){bRetVal=true;}
break;case eEventTypes.ET_TIMEOUT:if(_self.triggerType===eTriggerTypes.ET_ELAPSED_SINCE_INSTALL&&_dataObj.daysSinceInstall>=_self.trigDaysSinceInstall){bRetVal=true;}else if(_self.triggerType===eTriggerTypes.ET_TOOLBAR_INACTIVE&&_dataObj.daysTBIsInactive>=_self.inactivityPeriod){bRetVal=true;}
break;case eEventTypes.ET_MORE_MENU:var recentTopWindow=CC['@mozilla.org/appshell/window-mediator;1'].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser");if(recentTopWindow.document.getElementById('yahoo-toolbar').getAttribute("collapsed")!="true"){var moreMenu=recentTopWindow.document.getElementById('yahoo-toolbar-moremenu');if(moreMenu&&moreMenu.getAttribute("hidden")=="false"&&_dataObj.confMgr.getCharValue("general.showtextonfavs")=="true"){bRetVal=true;}
else{bRetVal=false;}}
break;case eEventTypes.ET_SEARCH:if(_self.triggerType===eTriggerTypes.ET_SEARCH_PROVIDER)
{bRetVal=true;if(oState.tipDate!==0)
{if(_dataObj.confMgr.getIntValue('toolbar.tipintervalsp')>Math.round(((new Date())-new Date(oState.tipDate))/daysToMilliSecFactor))
{bRetVal=false;}}}
break;}
if(!bRetVal){return;}
if(_self.ignoreSilentPeriod!==eAcceptTypes.AT_TRUE){bRetVal=((_self.installSilencePeriod>=_dataObj.daysSinceInstall)||(_self.lastTipSilencePeriod>=_dataObj.daysSinceLastTip)?false:bRetVal);}
bRetVal=bRetVal?_checkExceptionConditions():bRetVal;if(bRetVal){_stateData.tipShown=true;_stateData.tipDate=(new Date()).toUTCString();_dataObj.confMgr.setCharValue(lastTipTimestampConfigKey,_stateData.tipDate,true);}}
if((oState.tipShown!==_stateData.tipShown)||(oState.tipDate!==_stateData.tipDate)||(oState.clicked!==_stateData.clicked)||(oState.triggerCondHit!==_stateData.triggerCondHit)||bRetVal){_serializeJSON();}
return bRetVal;};}
function yEventTipManager(){var _self=this;var _dataObj=new CommonObjects();var _trigTimerEval=true;var _timer=CC['@mozilla.org/timer;1'].createInstance(CI.nsITimer);var _lastCheck=[];var eventTipsCollection=[];_notifyShowTip=function(tip){try{var data=new tipUIData();data.buttonId=tip.position?tip.position:"grp_fav";data.autoClose=tip.autoClosePeriod;var protocol="https://";if(_dataObj.confMgr.isKeyPresent("disablehttps")&&_dataObj.confMgr.getBoolValue("disablehttps")){protocol="http://";}
var server_base=_dataObj.localstorage.getString("yahoo.ytff.dataserver.url");_dataObj.confMgr.isYahooKey=false;var debug_url=_dataObj.confMgr.getCharValue("yahoo.debug.slideoutUrl");if(debug_url){server_base=debug_url;}
data.tipUrl=protocol+server_base+"/bh/v8/tip/etp?.etp="+tip.tipId+"&.cv="+_dataObj.confMgr.getCharValue("installer.version.simple")+"&.intl="+_dataObj.confMgr.getCharValue("installer.language")+"&.pc="+_dataObj.confMgr.getCharValue("toolbar.pc");if(tip.tipUrlParam){var param=tip.tipUrlParam;var paramPos=param.indexOf("$PARAM_");var feedParam=_dataObj.localstorage.getString(param.substr(paramPos+7));param=param.substring(0,paramPos-1);data.tipUrl+="&"+param+feedParam;}
data.tipRoll=tip.tipRoll.slice();var recentTopWindow=CC['@mozilla.org/appshell/window-mediator;1'].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser");if(recentTopWindow.document.getElementById('yahoo-toolbar').getAttribute("collapsed")!="true")
{_dataObj.localstorage.putObject("yahoo-eventtip-"+tip.tipId,new WrapperClass(data));observerService.notifyObservers(null,notifyEventName,"yahoo-eventtip-"+tip.tipId);}
if(tip.tipId==="ett_spyahoo")
{_dataObj.confMgr.setIntValue('toolbar.tipintervalsp',tip.trigDaysForNo,true);}}catch(e){yahooError(e.message);}};this.showTipByID=function(id){for(var i=0;i<eventTipsCollection.length;i++){if(id==('yahoo-toolbar-etp-'+eventTipsCollection[i].evtId)){_notifyShowTip(eventTipsCollection[i]);}}};this.getTipDate=function(id,def){try{for(var i=0;i<eventTipsCollection.length;i++){if(id==eventTipsCollection[i].evtId){var sd=eventTipsCollection[i].getState();if(sd.tipDate){return sd.tipDate;}
break;}}}
catch(e){yahooError(e.message);}
return def;};this.setTipDate=function(id,date){try{for(var i=0;i<eventTipsCollection.length;i++){if(id==eventTipsCollection[i].evtId){var sd=eventTipsCollection[i].getState();if(sd){sd.tipShown=(date==null)?false:true;sd.tipDate=date;eventTipsCollection[i].saveState();}
break;}}}
catch(e){yahooError(e.message);}
return def;};this.addEventTip=function(tipNode){try{var yhash=yahooUtils.JSON.parse(tipNode.hash);var installSilencePeriod=parseInt(yhash.silw?yhash.silw:1,10);var lastTipSilencePeriod=parseInt(yhash.silt?yhash.silt:5,10);var signedMode=_dataObj.toolbarManager.isGuestMode()?"0":"1";var createTip=yhash.sign?false:true;createTip=(yhash.sign&&yhash.sign!==signedMode)?false:true;if(createTip){for(var i=0;i<tipNode.childSize;i++){var etp=tipNode.getChild(i);var hash=yahooUtils.JSON.parse(etp.hash);var params=etp.funcUrl.split(",");createTip=hash.sign?false:true;createTip=(hash.sign&&hash.sign!==signedMode)?false:true;if(createTip){var evtTip=new EventTip(_dataObj);evtTip.evtId=hash.id;evtTip.triggerType=parseInt(params[0],10);evtTip.btnId=params[1];evtTip.tipId=params[2];if(evtTip.tipId==="wlp"){continue;}
if(params[3]){var j=i;do{var child=tipNode.getChild(++j);var chash=yahooUtils.JSON.parse(child.hash);var cparams=child.funcUrl.split(",");if(parseInt(cparams[0],10)===eTriggerTypes.ET_INVALID){var data=new tipUIData();data.buttonId=chash.pos?chash.pos:data.buttonId;var protocol="https://";if(_dataObj.confMgr.isKeyPresent("disablehttps")&&_dataObj.confMgr.getBoolValue("disablehttps")){protocol="http://";}
var server_base=_dataObj.localstorage.getString("yahoo.ytff.dataserver.url");_dataObj.confMgr.isYahooKey=false;var debug_url=_dataObj.confMgr.getCharValue("yahoo.debug.slideoutUrl");if(debug_url){server_base=debug_url;}
data.tipUrl=protocol+server_base+"/bh/v8/tip/etp?.etp="+cparams[2]+"&.cv="+_dataObj.confMgr.getCharValue("installer.version.simple")+"&.intl="+_dataObj.confMgr.getCharValue("installer.language")+"&.pc="+_dataObj.confMgr.getCharValue("toolbar.pc");data.autoClose=parseInt(chash.to?chash.to:data.autoClose,10);evtTip.tipRoll.unshift(data);i=j;}}while(parseInt(cparams[0],10)===eTriggerTypes.ET_INVALID);}
evtTip.position=(hash.pos?hash.pos:evtTip.position);evtTip.regex=unescape(hash.rgx?hash.rgx.replace(/\/\//g,"\\/\\/"):evtTip.regex);evtTip.regex.replace(/__Domain_Prefix__/g,_dataObj.confMgr.getCharValue("installer.language"));evtTip.messengerStatus=parseInt(hash.msgr?hash.msgr:evtTip.messengerStatus,10);evtTip.btnAvail=parseInt(hash.avail?hash.avail:evtTip.btnAvail,10);evtTip.btnClicked=parseInt(hash.rep?hash.rep:evtTip.btnClicked,10);evtTip.installSilencePeriod=parseInt(hash.silw?hash.silw:installSilencePeriod,10);evtTip.lastTipSilencePeriod=parseInt(hash.silt?hash.silt:lastTipSilencePeriod,10)+parseInt(hash.silnt?hash.silnt:0,10);evtTip.autoClosePeriod=parseInt(hash.to?hash.to:evtTip.autoClosePeriod,10);evtTip.triggerConditionHitCnt=parseInt(hash.rghc?hash.rghc:evtTip.triggerConditionHitCnt,10);evtTip.trigDaysSinceInstall=parseInt(hash.elad?hash.elad:evtTip.trigDaysSinceInstall,10);evtTip.toolbarUsed=parseInt(hash.nu?hash.nu:evtTip.toolbarUsed,10);evtTip.ignoreSilentPeriod=parseInt(hash.igns?hash.igns:evtTip.ignoreSilentPeriod,10);evtTip.inactivityPeriod=parseInt(hash.inad?hash.inad:evtTip.inactivityPeriod,10);evtTip.customized=parseInt(hash.nc?hash.nc:evtTip.customized,10);evtTip.toolbarUpgraded=parseInt(hash.etup?hash.etup:evtTip.toolbarUpgraded,10);evtTip.installType=parseInt(hash.etbndl?hash.etbndl:evtTip.installType,10);evtTip.loginStatus=parseInt(hash.etsign?hash.etsign:evtTip.loginStatus,10);evtTip.portability=parseInt(hash.etportset?hash.etportset:evtTip.portability,10);evtTip.metroSync=parseInt(hash.metroexp?hash.metroexp:evtTip.metroSync,10);evtTip.showAlways=parseInt(hash.alshow?hash.alshow:evtTip.showAlways,10);evtTip.ignoreUserPref=parseInt(hash.etignoro?hash.etignoro:evtTip.ignoreUserPref,10);evtTip.feedParamName=(hash.etfeedpm?hash.etfeedpm:evtTip.feedParamName);evtTip.buttonState=(hash.etbs?hash.etbs:'');evtTip.optionToggle=(hash.etopt?hash.etopt:'');evtTip.tipUrlParam=unescape(hash.etparam?hash.etparam:evtTip.tipUrlParam);evtTip.trigDaysForYes=parseInt(hash.ydays?hash.ydays:evtTip.trigDaysForYes,10);evtTip.trigDaysForNo=parseInt(hash.ndays?hash.ndays:evtTip.trigDaysForNo,10);if(evtTip.tipId==="ett_spyahoo")
{_dataObj.confMgr.setIntValue('toolbar.triggerdaysforyes.'+evtTip.tipId,evtTip.trigDaysForYes,true);}
evtTip.init();eventTipsCollection.push(evtTip);}}}}catch(e){yahooError(e.message);}};this.clear=function(){eventTipsCollection.splice(0,eventTipsCollection.length);};this.observe=function(aSubject,aTopic,aData){var trigType=eEventTypes.ET_INVALID;if((aTopic==="yahoo-feed-updated")||(aTopic==="yahoo-feed-alerts-updated")||(aTopic==="yahoo-layout-changed"))
{trigType=[eEventTypes.ET_LAYOUT,eEventTypes.ET_MORE_MENU];}
else if(aTopic==="yahoo-probe-url")
{trigType=[eEventTypes.ET_URL_NAV];}
else if(aTopic==="yahoo-probe-click")
{trigType=[eEventTypes.ET_BTN_CLICK];}
else if(aTopic==="timer-callback")
{trigType=[eEventTypes.ET_TIMEOUT];}
else if(aTopic==="nsPref:changed")
{_dataObj.tipsEnabled=_dataObj.confMgr.getBoolValue("general.eventtips");return;}
else if(aTopic==="search-provider-not-yahoo")
{trigType=[eEventTypes.ET_SEARCH];}
if(trigType!=eEventTypes.ET_INVALID)
{var lastCheck,checkTime=new Date();_dataObj.daysSinceLastTip=Math.round(((checkTime)-(new Date(_dataObj.confMgr.getCharValue("etp.lasttiptimestamp"))))/daysToMilliSecFactor);for(var t=0;t<trigType.length;t++){lastCheck=_lastCheck[trigType[t]]||0;if((checkTime-lastCheck)<1000){continue;}
_lastCheck[trigType[t]]=checkTime;for(var i=0;i<eventTipsCollection.length;i++){if(eventTipsCollection[i].do_triggerTip(trigType[t],aData)){_notifyShowTip(eventTipsCollection[i]);break;}}}
if(_trigTimerEval&&(eventTipsCollection.length!=0)){_trigTimerEval=false;_self.observe(_timer,"timer-callback",null);var bIsYahooDefaultSP=_self.isYahooDefaultSP();if(!bIsYahooDefaultSP)
{var bIsYahooHidden=_self.isYahooSearchHidden();if(!bIsYahooHidden)
{_self.observe(_timer,"search-provider-not-yahoo",null);}}}}};this.isYahooSearchHidden=function(){var newEngine=Services.search.getEngines();for(var i=0;i<newEngine.length;++i){var regex=new RegExp("Yahoo");if(regex.test(newEngine[i].name))
{return newEngine[i].hidden;break;}}
return true;};this.isYahooDefaultSP=function(){_dataObj.confMgr.isYahooKey=false;var profDir=Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD",Components.interfaces.nsIFile).path,FILE_SEPARATOR=((profDir.search(/\\/)!=-1)?"\\":"/");searchMetaPath=(profDir+FILE_SEPARATOR+"search-metadata.json"),metaFile=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile),fileIO=Components.classes["@yahoo.com/fileio;1"].getService(Components.interfaces.nsIYahooFileIO2),prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),defaultEngineName=_dataObj.confMgr.getCharValue('browser.search.defaultenginename');try
{metaFile.initWithPath(searchMetaPath);var content=fileIO.readUnicodeFile(metaFile);if(content)
{var obj=yahooUtils.JSON.parse(content);if(obj['[global]'])
{defaultEngineName=obj['[global]']['current'];if(!defaultEngineName||(defaultEngineName.length==0))
{if(!prefs.prefHasUserValue("browser.search.defaultenginename"))
defaultEngineName="Yahoo";}}}}
catch(e)
{if(!prefs.prefHasUserValue("browser.search.defaultenginename"))
defaultEngineName="Yahoo";}
var engine=Services.search.getEngineByName(defaultEngineName);if(engine)
{var regex=new RegExp(".yahoo.com/");return regex.test(engine.searchForm);}
return false;};this.init=function(tb_manager){observerService.addObserver(_self,"yahoo-layout-changed",false);observerService.addObserver(_self,"yahoo-feed-alerts-updated",false);observerService.addObserver(_self,"yahoo-feed-updated",false);observerService.addObserver(_self,"yahoo-probe-url",false);observerService.addObserver(_self,"yahoo-probe-click",false);observerService.addObserver(_self,"yahoo-metro-sync",false);_dataObj.confMgr.addOnChangeListener("general.eventtips",_self);_timer.init(_self,computeTimeInterval,CI.nsITimer.TYPE_REPEATING_SLACK);_dataObj.toolbarManager=tb_manager;_dataObj.daysSinceInstall=Math.round(((new Date())-new Date(_dataObj.confMgr.getCharValue("installer.installdate")))/daysToMilliSecFactor);_dataObj.daysSinceLastTip=Math.round(((new Date())-new Date(_dataObj.confMgr.getCharValue("etp.lasttiptimestamp")))/daysToMilliSecFactor);_dataObj.daysTBIsInactive=Math.round(((new Date())-new Date(_dataObj.confMgr.getCharValue("toolbar.lastuse")))/daysToMilliSecFactor);_dataObj.daysSinceLastTip=isNaN(_dataObj.daysSinceLastTip)?__INFINITE__:_dataObj.daysSinceLastTip;_dataObj.daysTBIsInactive=isNaN(_dataObj.daysTBIsInactive)?_dataObj.daysSinceInstall:_dataObj.daysTBIsInactive;_dataObj.tbUpgraded=_dataObj.confMgr.getBoolValue("toolbar.upgraded")?eAcceptTypes.AT_TRUE:eAcceptTypes.AT_FALSE;_dataObj.tipsEnabled=_dataObj.confMgr.getBoolValue("general.eventtips");};};yEventTipManager.prototype={classID:Components.ID("{F753E8BB-EB63-4487-BA4D-1DB514C7C1E3}"),contractID:"@yahoo.com/eventtipmanager;1",QueryInterface:XPCOMUtils.generateQI([Components.interfaces.nsIObserver,Components.interfaces.nsIYahooEventTipManager])}
if(XPCOMUtils.generateNSGetFactory){var NSGetFactory=XPCOMUtils.generateNSGetFactory([yEventTipManager]);}else{var NSGetModule=XPCOMUtils.generateNSGetModule([yEventTipManager]);}