/*var sg_defaultInfo={
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
	sg_info=sg_defaultInfo,sg_clearList;*/

//var chatRoom,chatOpen=false;
/*
function loadSettings(func){
	chrome.storage.sync.get(null,save=>{
		console.log("-Load settings-\n"+JSON.stringify(save));
		sg_info=sg_defaultInfo;
		for(var k in save) if(k in sg_info) sg_info[k]=save[k];
		sg_clearList=sg_defaultClearList;
		if(save.dataClearList!=undefined)
			for(var k in save.dataClearList) if(k in sg_clearList) sg_clearList[k]=save.dataClearList[k];
		console.log("-sg_info-\n"+JSON.stringify(sg_info));
		console.log("-sg_clearList-\n"+JSON.stringify(sg_clearList));
		if(func!=undefined) func();
	});
}
*/
//function postCmd(cmd) { if(chatOpen) chatRoom.postMessage(cmd); }
/*
chrome.extension.onConnect.addListener(room=>{
	chatRoom=room;
	chatOpen=true;
	console.log("*- Connected to "+room.name+" -*");
	room.onMessage.addListener(msg=>{
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		console.log(cmd+"\n  ["+(tail?tail:"N/A")+"]");
		switch(cmd){
			case "kuy":
				room.postMessage("kuy");
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
*/
chrome.pageAction.onClicked.addListener(tab=>{
	var	sitekey='6Lf3NxoUAAAAAFdi90UqD0TaZSHCgINayoZnM69F',
		masterpid='BY3535';

	chrome.tabs.executeScript(tab.id,{file:"jquery-1.7.2.js"},()=>
		chrome.tabs.executeScript(tab.id,{file:"shgg.js"},()=>
			chrome.tabs.executeScript(tab.id,{code:`sg_inj("${sitekey}","${masterpid}")`})));
});

chrome.runtime.onInstalled.addListener(()=>
	chrome.declarativeContent.onPageChanged.removeRules(undefined,()=>
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl:{hostContains:"adidas.co"},
				})
			],
				actions:[new chrome.declarativeContent.ShowPageAction()]
			}
		])
	)
);
/*
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
*/