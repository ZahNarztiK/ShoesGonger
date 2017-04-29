var sg_defaultInfo={
		owrai:"",
		dataClear:false,
		delayed:1000,
		focusFin:false,
		focusFinW:false,
		inverse:false,
		noredirect:false,
		noti:false,
		proxy:false,
		proxyIP:"",
		run:false
	},
	sg_defaultClearList={
		appcache: false,
		cache: false,
		cookies: false,
		downloads: false,
		fileSystems: false,
		formData: false,
		history: false,
		indexedDB: false,
		localStorage: false,
		pluginData: false,
		passwords: false,
		webSQL: false
	},
	sg_info=sg_defaultInfo,sg_clearList;

var	tid,
	wid,
	counter=0,
	reconfirm=0,
	reconfirmTime=5000,
	timeoutDefault=10000,
	runURL;

var	timerInterval,timerOut,
	timerIntervalDisabled,timeout,timeBypass;

var	soundAlert=new Audio("sfx/alert.mp3"),
	soundError=new Audio("sfx/error.mp3"),
	soundPreAlert=new Audio("sfx/prealert.mp3");

soundAlert.loop=true;

var	notiID="ShoesGongerNoti",
	notiObj={
		type:"basic",
		priority:2,
		iconUrl:"icon/icon64.png",
		title:"Shoes Gonger",
		message:"The Gonging has been finished!!"
	};

var proxNone={ mode:"direct" },
	proxUsed={
		mode:"fixed_servers",
		rules:{
			singleProxy:{ host:"" },
			bypassList:["<local>"]
		}
	},
	proxScheme=["http","https","socks4","socks5"];

var chatRoom,chatOpen=false;

var reloadPage;

function chkError(tabId,str){
	chkTid(tabId,str,()=>{
		if(sg_info.run){
			if(str!="") console.log(str);
			stopRun();
			soundError.play();
		}
	});
}

function chkFinSettings(){
	if(sg_info.focusFin){
		console.log("  SV: Focus Tab");
		chrome.tabs.get(tid,tab=>chrome.tabs.highlight({windowId:wid,tabs:tab.index},()=>{
			chkNoti(()=>{
				console.log("  SV: Set Focus Window status");
				chrome.windows.update(wid,sg_info.focusFinW?{drawAttention:true,focused:true}:{drawAttention:true});
			});
		}));
	}
	else{
		console.log("  SV: No Focus");
		chkNoti(()=>chrome.windows.update(wid,{drawAttention:true}));
	}
}

function chkIP(ip){
	var valid=/^\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?\b$/.test(ip);
	console.log("  SV: IP validation "+(valid?"passed":"failed"));
	return valid;
}

function chkTid(tabId,str,func){
	if(tabId==tid){
		if(reconfirm==4) stopAlert();
		if(func!=undefined) func();
	}
}

function chkNoti(func){
	if(sg_info.noti){
		console.log("  SV: Noti");
		chrome.notifications.create(notiID,notiObj,()=>{
			if(func!=undefined) func();
			soundAlert.play();
			chrome.browserAction.setIcon({path:"icon/icon16g.png"});
		});
	}
	else{
		console.log("  SV: No Noti");
		if(func!=undefined) func();
		soundAlert.play();
		chrome.browserAction.setIcon({path:"icon/icon16g.png"});
	}
}

function delayedReconfirm(){
	reconfirm++;
	console.log("  SV: Wait for delayed reconfirm "+reconfirmTime+" s");
	chrome.browserAction.setIcon({path:"icon/icon16y.png"});
	chrome.windows.update(wid,{drawAttention:true});
	soundPreAlert.play();
	timerOut=setTimeout(()=>{
		console.log("  SV: Delayed reconfirm");
		chrome.tabs.executeScript(tid,{code:"sg_chk();"});
	},reconfirmTime);
}

function loadProxy(){
	console.log("  SV: Load Proxy for Testing");
	chrome.storage.sync.get("proxyIP",save=>{
		sg_info.proxyIP=save.proxyIP;
		runProxy();
	});
}

function loadSettings(func){
	stopAlert();
	stopSound(soundError);
	counter=0;
	chrome.storage.sync.get(null,save=>{
		console.log("-Load settings-\n"+JSON.stringify(save));
		sg_info=sg_defaultInfo;
		for(var k in save) if(k in sg_info) sg_info[k]=save[k];
		sg_clearList=sg_defaultClearList;
		if(save.dataClearList!=undefined)
			for(var k in save.dataClearList) if(k in sg_clearList) sg_clearList[k]=save.dataClearList[k];
		timeout=sg_info.delayed+timeoutDefault;
		console.log("-sg_info-\n"+JSON.stringify(sg_info));
		console.log("-sg_clearList-\n"+JSON.stringify(sg_clearList));
		if(func!=undefined) func();
	});
}

function postCmd(cmd) { if(chatOpen) chatRoom.postMessage(cmd); }

function reloadPageDefault(){
	console.log("- Inject "+tid+" : "+ ++counter);
	postCmd("setCounter "+counter);
	reconfirm=0;
	timeBypass=false;
	if(sg_info.dataClear&&sg_clearList!={})
		chrome.browsingData.remove({since:0},sg_clearList,()=>chrome.tabs.reload(tid));
	else chrome.tabs.reload(tid);
	console.log("  Timer: Wait timeout "+timeout+" ms");
	timerOut=setTimeout(()=>{
		if(sg_info.run){
			console.log("  Timer: Timed out, Re!");
			reloadPage();
		}
	},timeout);
}

function reloadPageTime(){
	clearTimeout(timerInterval);
	reloadPageDefault();
	timeBypass=false;
	timerIntervalDisabled=false;
	console.log("  Timer: Wait cycle "+sg_info.delayed+" ms");
	timerInterval=setTimeout(()=>{
		if(sg_info.run){
			if(timeBypass){
				console.log("  Timer: Cycled, Re!");
				reloadPage();
			}
			else timerIntervalDisabled=true;
		}
	},sg_info.delayed);
}

function runProxy(func){
	if(!chkIP(sg_info.proxyIP)){
		stopProxy(func);
		return;
	}
	chrome.storage.sync.set({proxy:(sg_info.proxy=true)});
	var ip=sg_info.proxyIP.split(':');
	proxUsed.rules.singleProxy.host=ip[0];
	if(ip.length==2) proxUsed.rules.singleProxy.port=Number(ip[1]);
	console.log("  SV: Proxy set up: "+ip[0]+(ip.length==2?":"+ip[1]:""));
	chrome.proxy.settings.set({
			value:proxUsed,
			scope:"regular"
		},	
		()=>{ if(func!=undefined) func(); });
}

function stopAlert(){
	chrome.notifications.clear(notiID);
	stopSound(soundAlert);
	chrome.browserAction.setIcon({path:"icon/icon16.png"});
}

function stopProxy(func){
	console.log("  SV: Proxy cleared");
	chrome.storage.sync.set({proxy:(sg_info.proxy=false)});
	chrome.proxy.settings.set({
			value:proxNone,
			scope:"regular"
		},	
		()=>{ if(func!=undefined) func(); });
}

function stopRun(){
	toggle();
	postCmd("Stop");
}

function stopSound(sound){
	sound.pause();
	sound.currentTime=0;
}

function toggle(){
	chrome.storage.sync.set({run:(sg_info.run=!sg_info.run)});
	console.log(sg_info.run?"Start":"Stop");
	if(sg_info.run){
		loadSettings(()=>chrome.windows.getCurrent(win=>{
			console.log(" WinID: ["+(wid=win.id)+"]");
			chrome.tabs.query({active:true,windowId:wid},tab=>{
				console.log(" TabID: ["+(tid = tab[0].id)+"]");
				runURL=tab[0].url;
				timerIntervalDisabled=true;
				(reloadPage=(sg_info.delayed>0?reloadPageTime:reloadPageDefault))();
			});
		}));
	}
	else{
		clearTimeout(timerOut);
		stopSound(soundPreAlert);
	}
	chrome.browserAction.setIcon({path:"icon/icon16"+(sg_info.run?"r":"")+".png"});
}

chrome.extension.onConnect.addListener(room=>{
	chatRoom=room;
	chatOpen=true;
	console.log("*- Connected to "+room.name+" -*");
	room.onMessage.addListener(msg=>{
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		console.log(cmd+"\n  ["+(tail?tail:"N/A")+"]");
		switch(cmd){
			case "getCounter":
				room.postMessage("setCounter "+counter);
				break;
			case "Proxyosas":
				(sg_info.proxy=tail)==1?loadProxy():stopProxy();
				break;
			case "Toggle":
				toggle();
				break;
			default: return;
		}
		console.log("* Done: "+cmd);
	});
	room.onDisconnect.addListener(()=>{
		chatOpen=false;
		console.log("*- Disconnected -*");
	});
});

chrome.notifications.onClicked.addListener(nid=>{
	if(nid==notiID)
		chrome.windows.update(wid,{focused:true},()=>
			chrome.tabs.get(tid,tab=>chrome.tabs.highlight({windowId:wid,tabs:tab.index},()=>{
				chrome.notifications.clear(nid);
				stopAlert();
		})));
});

chrome.notifications.onClosed.addListener((nid,byUser)=>{ if(nid==notiID&&byUser) stopAlert(); });

chrome.runtime.onMessage.addListener((request,sender)=>{
	if(sender.tab.id==tid){
		if(sg_info.run){
			if(request.daimai!=undefined){
				console.log("  Tab["+tid+"]: "+(request.daimai!=sg_info.inverse?"dai":"mai dai"));
				clearTimeout(timerOut);
				if (request.daimai!=sg_info.inverse){
					switch(reconfirm++){
						case 0:
							console.log("  SV: Immediately reconfirm");
							chrome.tabs.executeScript(tid,{code:"sg_chk();"});
							return;
						case 1:
							chrome.tabs.get(tid,tab=>{
								if(tab.status=="complete") delayedReconfirm();
								else console.log("  SV: Wait for complete loading");
							});
							return;
						default: break;
					}
					console.log("  SV: OK!!!");
					stopRun();
					chkFinSettings();
				}
				else{
					chrome.windows.update(wid,{drawAttention:false});
					stopSound(soundPreAlert);;
					chrome.browserAction.setIcon({path:"icon/icon16r.png"});
					if(timerIntervalDisabled){
						console.log("  SV: Extra-cycled, Re!");
						reloadPage();
					}
					else timeBypass=true;
				}
			}
		}
		else if(request.yuudwoi!=undefined) stopAlert();
	}
});

chrome.tabs.onActivated.addListener(info=>chkTid(info.tabId,""));

chrome.tabs.onRemoved.addListener(tabId=>chkError(tabId,"  SV: Tab["+tid+"] was closed, Stop!"));

chrome.tabs.onReplaced.addListener((addedTabId,removedTabId)=>
	chkError(removedTabId,"  SV: Tab["+removedTabId+"] was replaced w/ Tab["+addedTabId+"], Stop!")
);

chrome.tabs.onUpdated.addListener((tabId,info,tab)=>{
	if(sg_info.run&&tabId==tid){
		if(sg_info.noredirect&&tab.url!=runURL){
			console.log("  SV: URL was changed, Stop!");
			stopRun();
			soundError.play();
		}
		else if(reconfirm==2){
			console.log("  Tab ["+tid+"]: Load Complete");
			delayedReconfirm();
		}
	}
});

chrome.storage.sync.set({run:false});
chrome.storage.sync.get("proxy",status=>(sg_info.proxy=status)==?loadProxy():stopProxy());