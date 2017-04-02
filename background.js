var sg_defaultInfo={
		owrai:"",
		dataClear:false,
		delayed:0,
		inverse:false
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
	sg_info,sg_clearList;

var	tid=null,
	wid=null,
	counter=0,
	reconfirm=0,
	reconfirmTime=5000,
	timeoutDefault=10000,
	run=false,
	timerInterval,timerOut,
	timerIntervalDisabled,timeout,timeBypass,
	soundAlert=new Audio("sfx/alert.mp3"),
	soundPreAlert=new Audio("sfx/prealert.mp3");

soundAlert.loop=true;
soundPreAlert.loop=true;

var chatRoom,chatOpen=false;

var reloadPage;

function delayedReconfirm()
{
	reconfirm++;
	console.log("  SV: Wait for delayed reconfirm "+reconfirmTime+" s");
	chrome.browserAction.setIcon({path:"icon/icon16y.png"});
	soundPreAlert.play();
	timerOut=setTimeout(function(){
		console.log("  SV: Delayed reconfirm");
		chrome.tabs.executeScript(tid,{code:"sg_chk();"});
	},reconfirmTime);
}

function loadSettings(){
	stopAlert();
	chrome.storage.sync.get(null,function(save){
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
	reconfirm=0;
}

function postCmd(cmd) { if(chatOpen) chatRoom.postMessage(cmd); }

function reloadPageDefault(){
	console.log("- Inject "+tid+" : "+ ++counter);
	postCmd("setCounter "+counter);
	reconfirm=0;
	timeBypass=false;
	if(sg_info.dataClear&&sg_clearList!={})
		chrome.browsingData.remove({since:0},sg_clearList,function(){ chrome.tabs.reload(tid); });
	else chrome.tabs.reload(tid);
	console.log("  Timer: Wait timeout "+timeout+" ms");
	timerOut=setTimeout(function(){
		if(run){
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
	timerInterval=setTimeout(function(){
		if(run){
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
	soundAlert.pause();
	soundAlert.currentTime=0;
	chrome.browserAction.setIcon({path:"icon/icon16.png"});
}

function stopPreAlert()
{
	soundPreAlert.pause();
	soundPreAlert.currentTime=0;
}

function toggle(){
	console.log(run?"Stop":"Start");
	if(run=!run){
		loadSettings();
		chrome.windows.getCurrent(function(win){
			console.log(" WinID: ["+(wid=win.id)+"]");
			chrome.tabs.query({active:true,windowId:wid},function(tab){
				console.log(" TabID: ["+(tid = tab[0].id)+"]");
				timerIntervalDisabled=true;
				(reloadPage=(sg_info.delayed>0?reloadPageTime:reloadPageDefault))();
			});
		});
	}
	else{
		clearTimeout(timerOut);
		stopPreAlert();
	}
	chrome.browserAction.setIcon({path:"icon/icon16"+ (run?"r":"")+".png"});
}

chrome.extension.onConnect.addListener(function(room){
	chatRoom=room;
	chatOpen=true;
	console.log("*- Connected to "+room.name+" -*");
	room.onMessage.addListener(function(msg){
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		console.log(cmd+"\n  ["+(tail?tail:"N/A")+"]");
		switch(cmd){
			case "getCounter":
				room.postMessage("setCounter "+counter);
				break;
			case "getRun":
				room.postMessage("setRun "+(run?1:0));
				break;
			case "Toggle":
				toggle();
				break;
			default: return;
		}
		console.log("* Do: "+cmd);
	});
	room.onDisconnect.addListener(function(msg){
		chatOpen=false;
		console.log("*- Disconnected -*");
	});
});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	if(run&&request.daimai!=undefined){
		console.log("  Tab ["+tid+"]: "+((request.daimai!=sg_info.inverse)?"dai":"mai dai"));
		clearTimeout(timerOut);
		if (request.daimai!=sg_info.inverse){
			switch(reconfirm++){
				case 0:
					console.log("  SV: Immediately reconfirm");
					chrome.tabs.executeScript(tid,{code:"sg_chk();"});
					return;
				case 1:
					chrome.tabs.get(tid,function(tab){
						if(tab.status=="complete") delayedReconfirm();
						else console.log("  SV: Wait for complete loading");
					});
					return;
				default: break;
			}
			console.log("  SV: OK!!!");
			toggle();
			postCmd("Stop");
			stopPreAlert();
			soundAlert.play();
			chrome.browserAction.setIcon({path:"icon/icon16g.png"});
		}
		else{
			stopPreAlert();
			chrome.browserAction.setIcon({path:"icon/icon16r.png"});
			if(timerIntervalDisabled){
				console.log("  SV: Extra-cycled, Re!");
				reloadPage();
			}
			else timeBypass=true;
		}
	}
	else if(request.yuudwoi!=undefined) stopAlert();
});

chrome.tabs.onActivated.addListener(function(info){ if(info.tabId==tid) stopAlert(); });

chrome.tabs.onRemoved.addListener(function(tabId,info){
	if(tabId==tid){
		stopAlert();
		if(run)
		{
			toggle();
			postCmd("Stop");
		}
	}
});

chrome.tabs.onUpdated.addListener(function(tabId,info,tab){
	if(run&&tabId==tid&&reconfirm==2){
		console.log("  Tab ["+tid+"]: Load Complete");
		delayedReconfirm();
	}
});