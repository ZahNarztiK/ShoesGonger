function chkGong(txt)
{
	chrome.runtime.sendMessage({daimai: ($("*:contains("+txt+")").length==0)});
}