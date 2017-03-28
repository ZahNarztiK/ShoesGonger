var sg_default={
		owrai:"",
		cookiesClear:true,
		delayed:0
	},
	sg_info,

var counter=0,
	run=false;

var room;

function postCmd(cmd) { room.postMessage(cmd); }

function sg_availKW() { return $('#sg_keyword').val().trim().length>0; }

function sg_load()
{
	chrome.storage.sync.get(null,function(save){
		sg_info=sg_default;
		for(var k in save) if(k in sg_info) sg_info[k] = save[k];
		postCmd("getCounter");
		postCmd("getRun");
	});
}

function sg_setCounter(n) { $('#sg_counter').html(n); }

function sg_setForm()
{
	$('#sg_keyword').val(sg_info.owrai);
	$('#sg_interval').val(sg_info.delayed);
	$('#sg_clear').prop("checked",sg_info.cookiesClear);
	$('#sg_button').attr("class",run?"stop":"start");
	$('#clear').attr("class",run?"disable":"");
	$('.dis').prop("disabled", run);
	sg_setCounter(counter);
}

function sg_toggle()
{
	sg_toggleRun();
	postCmd("Toggle");
}

function sg_toggleRun()
{
	run=!run;
	sg_setForm();
}

$(function(){
	room = chrome.extension.connect({ name: "GongChatRoom" });
	room.onMessage.addListener(function(msg) {
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		switch(cmd)
		{
			case "setCounter":
				sg_setCounter(counter=tail);
				break;
			case "setRun":
				run=(tail=="1");
				sg_setForm();
				break;
			case "Stop":
				sg_toggleRun();
				break;
			default: break;
		}
	});

	$('#sg_button').click(function(){ if(run||sg_availKW()) sg_toggle(); });

	$('#sg_clear').change(function(){
		chrome.storage.sync.set({cookiesClear:(sg_info.cookiesClear=$('#sg_clear').prop("checked"))});
	});

	$('#sg_interval').focus(function(){ $(this).attr("placeHolder","");	});

	$('#sg_interval').focusout(function(){ $(this).attr("placeHolder","0");	});

	$('#sg_interval').keydown(function(n){
		if ($.inArray(n.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (n.keyCode === 65 && (n.ctrlKey === true || n.metaKey === true)) || (n.keyCode >= 35 && n.keyCode <= 40)) return;
		if ((n.shiftKey || (n.keyCode < 48 || n.keyCode > 57)) && (n.keyCode < 96 || n.keyCode > 105)) n.preventDefault();
	});

	$('#sg_interval').keyup(function(){
		chrome.storage.sync.set({delayed:(sg_info.delayed=(($('#sg_interval').val().length>0)?Number($('#sg_interval').val()):0))});
	});

	$('#sg_keyword').keyup(function(){
		$('#sg_button').attr("class",sg_availKW()?"start":"");
		chrome.storage.sync.set({owrai:(sg_info.owrai=$('#sg_keyword').val().trim())});
	});

	sg_load();
});