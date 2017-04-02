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

var counter=0,
	run=false,
	confirming=false;

var room;

function postCmd(cmd) { room.postMessage(cmd); }

function sg_availKW() { return $('#sg_keyword').val().trim().length>0; }

function sg_load(){
	chrome.storage.sync.get(null,function(save){
		sg_info=sg_defaultInfo;
		for(var k in save) if(k in sg_info) sg_info[k]=save[k];
		sg_clearList=sg_defaultClearList;
		if(save.dataClearList!=undefined)
			for(var k in save.dataClearList) if(k in sg_clearList) sg_clearList[k]=save.dataClearList[k];
		postCmd("getCounter");
		postCmd("getRun");
	});
}

function sg_setCounter(n) { $('#sg_counter').html(n); }

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
	$('#sg_button').attr("class",run?"stop":(sg_availKW()?"start":""));
	$('#clear').attr("class",run?"disable":"");
	$('.dis').prop("disabled", run);
	sg_setCounter(counter);
}

function sg_toggle(){ if(run||sg_availKW()) sg_toggleRun(); }

function sg_toggleRun(){
	if(!run) {
		if(sg_info.delayed<1000) sg_confirm();
		else sg_start();
	}
	else sg_stop();
}

function sg_confirm() { $('#confirm-modal').removeClass("hidden"); }

function sg_confirm_close() { $('#confirm-modal').addClass("hidden"); }

function sg_confirm_yes() {
	sg_start();
	sg_confirm_close();
}

function sg_start() {
	postCmd("Toggle");
	run=true;
	sg_setFormAvail();
}

function sg_stop() {
	postCmd("Toggle");
	run=false;
	sg_setFormAvail();
}

$(function(){
	room = chrome.extension.connect({ name: "GongChatRoom" });
	room.onMessage.addListener(function(msg) {
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		switch(cmd){
			case "setCounter":
				sg_setCounter(counter=tail);
				break;
			case "setRun":
				run=(tail=="1");
				sg_setForm();
				break;
			case "Stop":
				run=false;
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

	$('#sg_interval').focus(function(){ $(this).attr("placeHolder",""); });

	$('#sg_interval').focusout(function(){ $(this).attr("placeHolder","0"); });

	$('#sg_interval').keydown(function(e){
		if	($.inArray(e.keyCode,[46,8,9,27,13,110,190])!==-1 ||
			(e.keyCode===65&&(e.ctrlKey===true||e.metaKey===true)) ||
			(e.keyCode>=35&&e.keyCode<=40))
				return;
		if((e.shiftKey||(e.keyCode<48||e.keyCode>57))&&(e.keyCode<96||e.keyCode>105)) e.preventDefault();
	});

	$('#sg_interval').keyup(function(e){
		chrome.storage.sync.set({
			delayed:(sg_info.delayed=((!isNaN($(this).val())&&$(this).val().length>0)?Number($(this).val()):0))
		});
		if(e.keyCode==13) sg_toggle();
	});

	$('#sg_keyword').keyup(function(e){
		$('#sg_button').attr("class",sg_availKW()?"start":"");
		chrome.storage.sync.set({owrai:(sg_info.owrai=$(this).val().trim())});
		if(e.keyCode==13) sg_toggle();
	});

	$('#sg_selectAll').change(function(){ $('.clearList').prop("checked","true"); });

	$('#sg_selectNone').change(function(){ $('.clearList').prop("checked","false");	});

	$('#sg_toggleClearList').click(function(){ $('#clearList').toggle(); });

	//document.addEventListener("contextmenu",e=>e.preventDefault());

	sg_load();
});