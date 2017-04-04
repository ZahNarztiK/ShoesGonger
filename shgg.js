$(document).click(function(){ chrome.runtime.sendMessage({yuudwoi:true}); });
function sg_chk(){
	chrome.storage.sync.get("owrai",function(kw){
		chrome.runtime.sendMessage({daimai:($('html').html().indexOf(kw.owrai)==-1)});
		//chrome.runtime.sendMessage({daimai:($("*:contains("+kw.owrai+")").length==0)});
	});
}
sg_chk();