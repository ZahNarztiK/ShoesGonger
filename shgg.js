function sg_chk(){
	chrome.storage.sync.get("owrai",function(kw){
		chrome.runtime.sendMessage({daimai:($("*:contains("+kw.owrai+")").length==0)});
	});
}
sg_chk();