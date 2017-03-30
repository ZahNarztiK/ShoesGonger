//function chkGong(txt){chrome.runtime.sendMessage({daimai:($("*:contains("+txt+")").length==0)});}
//chrome.runtime.sendMessage({ready:true});
chrome.storage.sync.get(null,function(kw){
	chrome.runtime.sendMessage({daimai:($("*:contains("+kw.owrai+")").length==0)});
});
