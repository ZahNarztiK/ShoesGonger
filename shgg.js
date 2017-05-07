function sg_inj(sitekey,masterpid){
	var productStatusApi=`http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v16_9/products/(${masterpid})?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability,variations,prices`
	$.getJSON(productStatusApi,data=>{
		if(data.count>0){
			$.get("/on/demandware.store/Sites-adidas-GB-Site/en_GB/Search-GetProductVariations",{pid:masterpid},dt=>{
				var	sel=/<select[.\w\W]*<\/select>/mi.exec(dt).join('').replace(/[\n\t]+/g,''),
					isRequiredCaptcha=data.data[0].c_flashProduct,
					maxQ=data.data[0].c_maxQuantity;

				console.log("isRequiredCaptcha: "+isRequiredCaptcha);

				var sg_code=
					'<div><form id="addProductForm" name="addProductForm" action="/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-MiniAddProduct">'+
						'<input type="hidden" name="layer" value="Add To Bag overlay">'+
						sel+
						'<input type="hidden" name="Quantity" value="1">'+
						`<input type="hidden" name="masterPid" value="${masterpid}">`+
						'<input type="hidden" name="sessionSelectedStoreID" value="null">'+
						'<input type="hidden" name="ajax" value="true">'+
						(isRequiredCaptcha?
							'<script src="https://www.google.com/recaptcha/api.js"></script>'+
							`<div class="g-recaptcha" data-theme="dark" data-sitekey="${sitekey=(data.data[0].c_reCaptchaKeys!=null?JSON.parse(data.data[0].c_reCaptchaKeys).publicKey:sitekey)}"></div>`
							:'')+
					'</form>'+
					'<div><button id="sg-button" style="padding: 20px 0; text-align: center; width: 304px;">Add To Bag</button></div></div>'+

					"<script>"+
						"$('#sg-button').click(()=>"+
							"$.post('/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-MiniAddProduct',$('#addProductForm').serialize(),data=>{"+
								"window.location='/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-Show'"+
							"}));"+
					"</script>";
				
				console.log("sitekey: "+sitekey);

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
			});
		}
	});
}