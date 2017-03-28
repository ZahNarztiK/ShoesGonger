var sg_info={
	tid:0,
	wid:0,
	counter:0,
	run:false,
	owrai:"",
	cookiesClear:true,
	delayed:0
};
var room;

function sg_save(t)
{
	var kw=$('#sg_keyword').val().trim();
	var de=(($('#sg_interval').val().length>0)?$('#sg_interval').val():0);
	sg_info.owrai=kw;
	sg_info.delayed=de;
	sg_info.cookiesClear=$('#sg_clear').prop("checked");
	if(t)
	{
		$('#sg_keyword').val(kw);
		$('#sg_interval').val(de);
	}
	room.postMessage("setInfo "+JSON.stringify(sg_info));
}

function sg_availKW()
{
	if($('#sg_keyword').val().trim().length>0) return true;
	return false;
}

$(function(){

	room = chrome.extension.connect({ name: "GongChatRoom" });
	room.onMessage.addListener(function(msg) {
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		switch(cmd)
		{
			case "setCounter":
				$('#sg_counter').html(sg_info.counter=tail);
				break;
			case "setInfo":
				sg_info=JSON.parse(tail);
				$('#sg_keyword').val(sg_info.owrai)
				$('#sg_interval').val(sg_info.delayed)
				$('#sg_clear').prop("checked",sg_info.cookiesClear);
				$('#sg_counter').html(sg_info.counter);
				$('#sg_button').attr("class",sg_info.run?"stop":"start");
				$('#clear').attr("class",sg_info.run?"disable":"");
				$('.dis').prop("disabled", sg_info.run);
				break;
			default: break;
		}
	});

	$('.dis').change(function(){
		sg_save(false);
	});

	$('#sg_button').click(function(){
		if(sg_info.run) room.postMessage("Toggle");
		else if (sg_availKW()) {
			sg_save(true);
			room.postMessage("Set&Start "+JSON.stringify(sg_info));
		}
	});
	
	$('#sg_keyword').keyup(function(){
		$('#sg_button').attr("class",sg_availKW()?"start":"");
	});

	$('#sg_interval').keydown(function(n){
		if ($.inArray(n.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (n.keyCode === 65 && (n.ctrlKey === true || n.metaKey === true)) || (n.keyCode >= 35 && n.keyCode <= 40)) return;
		if ((n.shiftKey || (n.keyCode < 48 || n.keyCode > 57)) && (n.keyCode < 96 || n.keyCode > 105)) n.preventDefault();
	});

	$('#sg_interval').focus(function(){
		$(this).attr("placeHolder","");
	});

	$('#sg_interval').focusout(function(){
		$(this).attr("placeHolder","0");
	});

	room.postMessage("getInfo");
});