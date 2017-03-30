chrome.storage.sync.get(null,function(kw){
	chrome.runtime.sendMessage({daimai:($("*:contains("+kw.owrai+")").length==0)});
});
