function sg_inj(sitekey,masterpid,size){
	var sizecode=460+20*size;
	var pid=masterpid+'_'+sizecode;

	var productStatus = `http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v16_9/products/(${masterpid})?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability,variations,prices`
	$.getJSON( productStatus, function( data ) {
		if(data.count > 0) {
			var isRequiredCaptcha = data.data[0].c_flashProduct;
			console.log("isRequiredCaptcha: "+isRequiredCaptcha);
			var sg_code=
				'<div><form method="post" name="addProductForm" action="/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-MiniAddProduct">'+
					'<input type="hidden" name="layer" value="Add To Bag overlay">'+
					`<input type="hidden" name="pid" value="${pid}">`+
					'<input type="hidden" name="Quantity" value="1">'+
					`<input type="hidden" name="masterPid" value="${masterpid}">`+
					'<input type="hidden" name="sessionSelectedStoreID" value="null">'+
					'<input type="hidden" name="ajax" value="true">'
					if(isRequiredCaptcha) {
						if(data.data[0].c_reCaptchaKeys != null) {
							sitekey = JSON.parse(data.data[0].c_reCaptchaKeys).publicKey
						}
						console.log("sitekey: "+sitekey);
						sg_code += '<script src="https://www.google.com/recaptcha/api.js"></script>'+
						`<div class="g-recaptcha" data-theme="dark" data-sitekey="${sitekey}"></div>`
					}
			sg_code += '<div><button type="button" name="add-to-cart-button" style="padding: 20px 0; text-align: center; width: 304px;">Add To Bag</button></div>'+
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
	});
}