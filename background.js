var sg_info={
	tid:0,
	wid:0,
	counter:0,
	run:false,
	owrai:"kuy",
	cookiesClear:true,
	delayed:0
};
var chat,chatOpen=false;

function postCmd(cmd)
{
	if(chatOpen) chat.postMessage(cmd);
}

function inj()
{
	console.log("- Inject "+sg_info.tid+" : "+ ++sg_info.counter);
	postCmd("setCounter "+sg_info.counter);
	chrome.tabs.executeScript(sg_info.tid, {file: "jquery-1.7.2.js"},function(){
		chrome.tabs.executeScript(sg_info.tid, {file: "shgg.js"}, function(){
			chrome.tabs.executeScript(sg_info.tid, {code: "chkGong('"+sg_info.owrai+"');"});
		});
	});
}

function toggle()
{
	console.log(sg_info.run?"Stop":"Start");
	if(sg_info.run=!sg_info.run)
	{
		sg_info.counter=0;
		chrome.windows.getCurrent(function(win){
			sg_info.wid=win.id;
			console.log(win.id);
			chrome.tabs.query({active:true,windowId:sg_info.wid},function(tab){
					console.log(" TabID: ["+(sg_info.tid = tab[0].id)+"]");
					inj();
			});
		})
	}
	chrome.browserAction.setIcon({path:"icon/icon16"+ (sg_info.run?"r":"")+".png"});
	postCmd("setInfo "+JSON.stringify(sg_info));
}

chrome.tabs.onUpdated.addListener(function(tabId , info) {
	if (sg_info.run && info.status == "complete") inj();
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log("  Tab ["+sg_info.tid+"]: "+(request.daimai?"dai":"mai dai"));
		if (request.daimai)
		{
			console.log("  SV: OK!!!");
			toggle();
		}
		else
		{
			//console.log("  SV: w8 " + sg_info.delayed+" ms");
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
					}, function(){
						console.log("  SV: Re!");
						chrome.tabs.reload(sg_info.tid);
					});
		}
	});

chrome.extension.onConnect.addListener(function(room) {
	chat=room;
	chatOpen=true;
	console.log("*- Connected to "+room.name+" -*");
	room.onMessage.addListener(function(msg) {
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		console.log(cmd+"\n  ["+(tail?tail:"N/A")+"]");
		switch(cmd)
		{
			case "getInfo":
				room.postMessage("setInfo "+JSON.stringify(sg_info));
				break;
			case "setInfo":
				sg_info=JSON.parse(tail);
				break;
			case "Set&Start":
				sg_info=JSON.parse(tail);
				toggle();
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
})