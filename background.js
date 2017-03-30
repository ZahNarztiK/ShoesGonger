var sg_default={
		owrai:"",
		cookiesClear:true,
		delayed:0
	},
	sg_info;

var	tid=0,
	wid=0,
	counter=0,
	run=false,
	timer,
	alertSound=new Audio("sfx/alert.mp3");

var chatRoom,chatOpen=false;

var inj,reloadPage;

function injDefault()
{
	console.log("- Inject "+tid+" : "+ ++counter);
	postCmd("setCounter "+counter);
	chrome.tabs.executeScript(tid,{code:"chkGong('"+sg_info.owrai+"');"});
}

function injTime()
{
	clearTimeout(timer);
	injDefault();
}

function loadSettings()
{
	chrome.storage.sync.get(null,function(save){
		console.log("-Load settings-\n"+JSON.stringify(save));
		sg_info=sg_default;
		for(var k in save) if(k in sg_info) sg_info[k]=save[k];
		console.log("-sg_info-\n"+JSON.stringify(sg_info));
	});
	counter=0;
}

function postCmd(cmd) { if(chatOpen) chatRoom.postMessage(cmd); }

function reloadPageDefault()
{
	if(sg_info.cookiesClear)
		chrome.browsingData.remove({
				since: 0
			}, {
				//appcache: true,
				//cache: true,
				cookies: true,
				//downloads: true,
				//fileSystems: true,
				//formData: true,
				//history: true,
				//indexedDB: true,
				//localStorage: true,
				//pluginData: true,
				//passwords: true,
				//webSQL: true
			}, function(){ chrome.tabs.reload(tid); });
	else chrome.tabs.reload(tid);
}

function reloadPageTime()
{
	reloadPageDefault();

	console.log("  Timer: Wait " + sg_info.delayed+" ms");
	timer=setTimeout(function(){
		if(run)
		{
			console.log("  Timer: Timed out, Re!");
			reloadPage();
		}
	},sg_info.delayed);
}

function toggle()
{
	console.log(run?"Stop":"Start");
	if(run=!run)
	{
		loadSettings();
		chrome.windows.getCurrent(function(win){
			console.log(" WinID: ["+(wid=win.id)+"]");
			chrome.tabs.query({active:true,windowId:wid},function(tab){
				console.log(" TabID: ["+(tid = tab[0].id)+"]");
				if(sg_info.delayed>0)
				{
					inj=injTime;
					reloadPage=reloadPageTime;
				}
				else
				{
					inj=injDefault;
					reloadPage=reloadPageDefault;
				}
				reloadPage();
			});
		});
	}
	else clearTimeout(timer);
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
	room.onDisconnect.addListener(function(msg){
		chatOpen=false;
		console.log("*- Disconnected -*");
	});
});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	if(run)
	{
		if(request.ready) inj();
		else if(request.daimai!=undefined)
		{
			console.log("  Tab ["+tid+"]: "+(request.daimai?"dai":"mai dai"));
			if (request.daimai)
			{
				console.log("  SV: OK!!!");
				postCmd("Stop");
				alertSound.pause();
				alertSound.currentTime=0;
				alertSound.play();
				toggle();
			}
			else
			{
				console.log("  SV: Re!");
				reloadPage();
			}
		}
	}
});