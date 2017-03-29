var sg_default={
		owrai:"",
		cookiesClear:true,
		delayed:0
	},
	sg_info;

var	tid=0,
	wid=0,
	counter=0,
	run=false;

var chatRoom,chatOpen=false;

function inj()
{
	console.log("- Inject "+tid+" : "+ ++counter);
	postCmd("setCounter "+counter);
	chrome.tabs.executeScript(tid, {code: "chkGong('"+sg_info.owrai+"');"});
}

function loadSettings()
{
	chrome.storage.sync.get(null,function(save){
		console.log("-Load settings-\n"+JSON.stringify(save));
		sg_info=sg_default;
		for(var k in save) if(k in sg_info) sg_info[k] = save[k];
		console.log("-sg_info-\n"+JSON.stringify(sg_info));
	});
}

function postCmd(cmd) { if(chatOpen) chatRoom.postMessage(cmd); }

function toggle()
{
	console.log(run?"Stop":"Start");
	if(run=!run)
	{
		loadSettings();
		counter=0;
		chrome.windows.getCurrent(function(win){
			wid=win.id;
			console.log(win.id);
			chrome.tabs.query({active:true,windowId:wid},function(tab){
				console.log(" TabID: ["+(tid = tab[0].id)+"]");
				chrome.tabs.reload(tid);
			});
		});
	}
	chrome.browserAction.setIcon({path:"icon/icon16"+ (run?"r":"")+".png"});
}

chrome.extension.onConnect.addListener(function(room) {
	chatRoom=room;
	chatOpen=true;
	console.log("*- Connected to "+room.name+" -*");
	room.onMessage.addListener(function(msg) {
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		console.log(cmd+"\n  ["+(tail?tail:"N/A")+"]");
		switch(cmd)
		{
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
	room.onDisconnect.addListener(function(msg) {
		chatOpen=false;
		console.log("*- Disconnected -*");
	});
});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	if(request.ready && run) inj();
	else if(request.daimai!=undefined)
	{
		console.log("  Tab ["+tid+"]: "+(request.daimai?"dai":"mai dai"));
		if (request.daimai)
		{
			console.log("  SV: OK!!!");
			postCmd("Stop");
			toggle();
		}
		else
		{
			//console.log("  SV: w8 " + sg_info.delayed+" ms");
			console.log("  SV: Re!");
			if(sg_info.cookiesClear)
				chrome.browsingData.remove({
						"since": 0
					}, {
						//"appcache": true,
						//"cache": true,
						"cookies": true,
						//"downloads": true,
						//"fileSystems": true,
						//"formData": true,
						//"history": true,
						//"indexedDB": true,
						//"localStorage": true,
						//"pluginData": true,
						//"passwords": true,
						//"webSQL": true
					}, function(){ chrome.tabs.reload(tid); });
			else chrome.tabs.reload(tid);
		}
	}
});