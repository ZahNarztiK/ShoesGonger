var sg_defaultInfo={
		owrai:"",
		dataClear:false,
		delayed:0,
		focusFin:false,
		inverse:false,
		redirect:false,
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

var chatRoom,chatOpen=false;

var reloadPage;

function chkError(tabId,str)
{
	chkTid(tabId,str,()=>{
		if(sg_info.run){
			if(str!="") console.log(str);
			stopRun();
			soundError.play();
		}
	});
}

function chkTid(tabId,str,func){
	if(tabId==tid){
		stopAlert();
		if(func!=undefined) func();
	}
}

function delayedReconfirm()
{
	reconfirm++;
	console.log("  SV: Wait for delayed reconfirm "+reconfirmTime+" s");
	chrome.browserAction.setIcon({path:"icon/icon16y.png"});
	soundPreAlert.play();
	timerOut=setTimeout(()=>{
		console.log("  SV: Delayed reconfirm");
		chrome.tabs.executeScript(tid,{code:"sg_chk();"});
	},reconfirmTime);
}

function loadSettings(){
	stopAlert();
	stopSound(soundError);
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
	});
	counter=0;
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

function stopAlert()
{
	stopSound(soundAlert);
	chrome.browserAction.setIcon({path:"icon/icon16.png"});
}

function stopSound(sound)
{
	sound.pause();
	sound.currentTime=0;
}

function stopRun(){
	toggle();
	postCmd("Stop");
}

function toggle(){
	console.log((sg_info.run=!sg_info.run)?"Start":"Stop");
	chrome.storage.sync.set({run:sg_info.run});
	if(sg_info.run){
		loadSettings();
		chrome.windows.getCurrent(win=>{
			console.log(" WinID: ["+(wid=win.id)+"]");
			chrome.tabs.query({active:true,windowId:wid},tab=>{
				console.log(" TabID: ["+(tid = tab[0].id)+"]");
				runURL=tab[0].url;
				timerIntervalDisabled=true;
				(reloadPage=(sg_info.delayed>0?reloadPageTime:reloadPageDefault))();
			});
		});
	}
	else{
		clearTimeout(timerOut);
		stopSound(soundPreAlert);;
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
			case "Toggle":
				toggle();
				break;
			default: return;
		}
		console.log("* Do: "+cmd);
	});
	room.onDisconnect.addListener(()=>{
		chatOpen=false;
		console.log("*- Disconnected -*");
	});
});

chrome.runtime.onMessage.addListener((request,sender)=>{
	if(sender.tab.id==tid){
		if(sg_info.run&&request.daimai!=undefined){
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
				if(sg_info.focusFin)
					chrome.tabs.get(tid,tab=>chrome.tabs.highlight({windowId:wid,tabs:tab.index},()=>soundAlert.play()));
				else soundAlert.play();
				chrome.browserAction.setIcon({path:"icon/icon16g.png"});
			}
			else{
				stopSound(soundPreAlert);;
				chrome.browserAction.setIcon({path:"icon/icon16r.png"});
				if(timerIntervalDisabled){
					console.log("  SV: Extra-cycled, Re!");
					reloadPage();
				}
				else timeBypass=true;
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
		if(!sg_info.redirect&&tab.url!=runURL){
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