function sg_chk(){chrome.storage.sync.get("owrai",kw=>chrome.runtime.sendMessage({daimai:(document.documentElement.innerHTML.indexOf(kw.owrai)==-1)}))}
sg_chk();
document.addEventListener("click",()=>chrome.runtime.sendMessage({yuudwoi:true}));