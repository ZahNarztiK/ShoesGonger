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
	sg_info,sg_clearList;

var counter=0;

var room;

function chkIP(ip) { return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?$/.test(ip); }

function postCmd(cmd) { room.postMessage(cmd); }

function sg_availKW() { return $('#sg_keyword').val().replace(/^\s+|\s+$/g,"")!=""; }

function sg_load(){
	chrome.storage.sync.get(null,save=>{
		sg_info=sg_defaultInfo;
		for(var k in save) if(k in sg_info) sg_info[k]=save[k];
		sg_clearList=sg_defaultClearList;
		if(save.dataClearList!=undefined)
			for(var k in save.dataClearList)
				if(k in sg_clearList) sg_clearList[k]=save.dataClearList[k];
		sg_setForm();
		postCmd("getCounter");
	});
}

function sg_saveKeyword(kw){
	$('#sg_button').attr("class",sg_availKW()?"start":"");
	chrome.storage.sync.set({owrai:(sg_info.owrai=kw.replace(/^\s+|\s+$/g,""))});
}

function sg_saveProxy(){
	chrome.storage.sync.set({
		proxyIP:(sg_info.proxyIP=/[^\d\.\:]/.test($('#sg_proxyIP').val())?
			$('#sg_proxyIP').val($('#sg_proxyIP').val().replace(/[^\d\.\:]+/g,"")):$('#sg_proxyIP').val())
	},()=>{
		var pok=chkIP(sg_info.proxyIP);
		$('#proxy').attr("class",(sg_info.proxyIP==""||pok)?"":"red");
		$('#sg_proxy').prop("disabled",!pok);
	});
}

function sg_setCounter(n) { $('#sg_counter').html(n); }

function sg_setClearList(status){
	if(sg_info.run) return;
	$('.clearList').each(function(){ $(this).prop("checked",status); });
	sg_clearList=sg_defaultClearList;
	for(var k in sg_clearList)
		sg_clearList[k]=status;
	chrome.storage.sync.set({dataClearList:sg_clearList});
}

function sg_setForm(){
	$('.chkBox').each(function(){
		$(this).prop("checked",sg_info[$(this).attr("name")]);
	});
	$('.clearList').each(function(){
		$(this).prop("checked",sg_clearList[$(this).attr("name")]);
	});
	sg_setCounter(counter);
	sg_setFormAvail();
}

function sg_setFormAvail(){
	$('#sg_keyword').val(sg_info.owrai);
	$('#sg_interval').val(sg_info.delayed==0?"":sg_info.delayed);
	$('#sg_proxyIP').val(sg_info.proxyIP);
	var pok=chkIP(sg_info.proxyIP);
	$('#proxy').attr("class",(sg_info.proxyIP==""||chkIP(sg_info.proxyIP))?"":"red");
	$('#sg_button').attr("class",sg_info.run?"stop":(sg_availKW()?"start":""));
	$('#clear').attr("class",sg_info.run?"disable":"");
	$('.dis').prop("disabled",sg_info.run);
	$('#sg_focusFinW').prop("disabled",sg_info.run?true:!sg_info.focusFin);
	$('#sg_proxy').prop("disabled",sg_info.run?true:!pok);
	$('#sg_proxyIP').prop("disabled",sg_info.proxy);
	sg_setCounter(counter);
}

function sg_setRun(status){
	postCmd("Toggle");
	sg_info.run=status;
	sg_setFormAvail();
}

function sg_toggle(){ if(sg_info.run||sg_availKW()) sg_toggleRun(); }

function sg_toggleProxy(status){
	$('#sg_proxyIP').prop("disabled",(sg_info.proxy=status));
	postCmd("Proxyosas");
}

function sg_toggleRun(){
	if(!sg_info.run) {
		if(sg_info.delayed<1000) sg_confirm();
		else sg_setRun(true);
	}
	else sg_setRun(false);
}

function sg_confirm() { $('#confirm-modal').removeClass("hidden"); }

function sg_confirm_close() { $('#confirm-modal').addClass("hidden"); }

function sg_confirm_yes() {
	sg_setRun(true);
	sg_confirm_close();
}

$(function(){
	room = chrome.extension.connect({ name:"GongChatRoom" });
	room.onMessage.addListener(msg=>{
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		switch(cmd){
			case "setCounter":
				sg_setCounter(counter=tail);
				break;
			case "Stop":
				sg_info.run=false;
				sg_setFormAvail();
				break;
			default: break;
		}
	});

	$('.chkBox').change(function(){
		var obj={};
		sg_info[$(this).attr("name")]=(obj[$(this).attr("name")]=$(this).prop("checked"));		
		chrome.storage.sync.set(obj);
	});

	$('.clearList').change(function(){
		sg_clearList[$(this).attr("name")]=$(this).prop("checked");
		chrome.storage.sync.set({dataClearList:sg_clearList});
	});

	$('#modal-no').click(sg_confirm_close);

	$('#modal-yes').click(sg_confirm_yes);

	$('#sg_button').click(sg_toggle);

	$('#sg_focusFin').change(function(){
		chrome.storage.sync.set({focusFin:(sg_info.focusFin=$(this).prop("checked"))});
		$('#sg_focusFinW').prop("disabled",!sg_info.focusFin);
	});

	$('#sg_interval,#sg_proxyIP').focus(function(){ $(this).attr("placeHolder",""); });

	$('#sg_interval').bind({
		focusout:function(){ $(this).attr("placeHolder","0"); },
		keydown:e=>{
			if($.inArray(e.keyCode,[8,9,13,27,46])!=-1 ||
				((e.ctrlKey==true||e.metaKey==true)&&(e.keyCode==65||e.keyCode==67)) ||
				(e.keyCode>=35&&e.keyCode<=40))
					return;
			if((e.keyCode<48||e.keyCode>57)&&(e.keyCode<96||e.keyCode>105)) return false;
		},
		keyup:function(e){
			chrome.storage.sync.set({
				delayed:(sg_info.delayed=((!isNaN($(this).val())&&$(this).val().length>0)?Number($(this).val()):0))
			});
			if(e.keyCode==13) sg_toggle();
		},
		paste:()=>{ return false; }
	});

	$('#sg_keyword').bind({
		change:function(){ sg_saveKeyword($(this).val()); },
		keyup:function(e){
			sg_saveKeyword($(this).val());
			if(e.keyCode==13) sg_toggle();
		}
	});

	$('#sg_proxy').change(function(){ sg_toggleProxy($(this).prop("checked")); });

	$('#sg_proxyIP').bind({
		change:function(){ sg_saveProxy(); },
		focusout:function(){ $(this).attr("placeHolder","IPv4:PORT"); },
		keydown:e=>{
			if($.inArray(e.keyCode,[8,9,13,27,46,110,190])!=-1 ||
				((e.ctrlKey==true||e.metaKey==true)&&(e.keyCode==65||e.keyCode==67||e.keyCode==86)) ||
				(e.shiftKey==true&&e.keyCode==186) ||
				(e.keyCode>=35&&e.keyCode<=40))
					return;
			if((e.keyCode<48||e.keyCode>57)&&(e.keyCode<96||e.keyCode>105)) return false;
		},
		keyup:function(e){
			sg_saveProxy();
			if(e.keyCode==13&&chkIP(sg_info.proxyIP)){
				$('#sg_proxy').prop("checked",true);
				sg_toggleProxy(true);
			}
		}
	});

	$('#sg_reset').click(()=>{
		if(!sg_info.run)
			chrome.storage.sync.clear(()=>{
				var obj=(sg_info=sg_defaultInfo);
				obj["dataClearList"]=(sg_clearList=sg_defaultClearList);
				chrome.storage.sync.set(obj,sg_setForm);
			});
	});

	$('#sg_selectAll').click(()=>sg_setClearList(true));

	$('#sg_selectNone').click(()=>sg_setClearList(false));

	$('#sg_toggleClearList').click(()=>$('#clearList').toggle());

	//$(document).contextmenu(()=>{ return false; });

	sg_load();
});