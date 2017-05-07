function sg_inj(sitekey,masterpid,size){
	var sizecode=460+20*size;
	var pid=masterpid+'_'+sizecode;

	var sg_code=
		'<div><form name="addProductForm" action="/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-MiniAddProduct">'+
			'<input type="hidden" name="layer" value="Add To Bag overlay">'+
			`<input type="hidden" name="pid" value="${pid}">`+
			'<input type="hidden" name="Quantity" value="1">'+
			`<input type="hidden" name="masterPid" value="${masterpid}">`+
			'<input type="hidden" name="sessionSelectedStoreID" value="null">'+
			'<input type="hidden" name="ajax" value="true">'+
			'<script src="https://www.google.com/recaptcha/api.js"></script>'+
			`<div class="g-recaptcha" data-theme="dark" data-sitekey="${sitekey}"></div>`+
			'<div><button name="add-to-cart-button" style="padding: 20px 0; text-align: center; width: 304px;">Add To Bag</button></div>'+
		'</form></div>';

	var sg_css = {
		"margin-top":"100px",
		"display":"flex",
		"justify-content":"center"
	};

	$("body").css("height","auto");
	$("body>*,#container>*,.QSISlider").css("display","none");
	$("#container.header-sticky-wrapper").css("display","block");
	$("#container").css(sg_css);
	$("#container").prepend(sg_code);
}