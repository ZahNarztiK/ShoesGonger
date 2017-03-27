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

function sg_save()
{
	sg_info.owrai=$('#sg_keyword').val();
	sg_info.delayed=$('#sg_interval').val();
	sg_info.cookiesClear=$('#sg_clear').prop("checked");
	sg_info.counter=0;
}

$(function(){

	$('#sg_keyword').keyup(function(){
		if ($(this).val().length > 0) $('#sg_button').attr("class","start");
		else $('#sg_button').removeClass();
	});

	$('#sg_interval').keydown(function(n){
		if ($.inArray(n.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (n.keyCode === 65 && (n.ctrlKey === true || n.metaKey === true)) || (n.keyCode >= 35 && n.keyCode <= 40)) return;
		if ((n.shiftKey || (n.keyCode < 48 || n.keyCode > 57)) && (n.keyCode < 96 || n.keyCode > 105)) n.preventDefault();
	});

	room = chrome.extension.connect({ name: "GongChatRoom" });
	room.onMessage.addListener(function(msg) {
		var cmd=msg.split(" ",1)[0];
		var tail=msg.substr(cmd.length+1);
		switch(cmd)
		{
			case "setInfo":
				sg_info=JSON.parse(tail);
				$('#sg_keyword').val(sg_info.owrai)
				$('#sg_interval').val(sg_info.delayed)
				$('#sg_clear').prop("checked",sg_info.cookiesClear);
				$('#sg_counter').html(sg_info.counter);
				if ($('#sg_keyword').val().length > 0) $('#sg_button').attr("class",sg_info.run?"stop":"start");
				$('.dis').prop("disabled", sg_info.run);
				break;
			default: break;
		}
	});
	$('#sg_button').click(function(){
		if ($('#sg_keyword').val().length > 0) {
			sg_save();
			room.postMessage("Set&Start "+JSON.stringify(sg_info));
		}
	});
	$('#sg_interval').focus(function(){
		$(this).attr("placeHolder","");
	});
	$('#sg_interval').focusout(function(){
		$(this).attr("placeHolder","0");
	});
	room.postMessage("getInfo");
});