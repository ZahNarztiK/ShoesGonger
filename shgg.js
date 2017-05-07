function sg_inj(sitekey,masterpid){
	var productStatusApi=`http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v16_9/products/(${masterpid})?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability,variations,prices`
	$.getJSON(productStatusApi,data=>{
		if(data.count>0){
			$.get("/on/demandware.store/Sites-adidas-GB-Site/en_GB/Search-GetProductVariations",{pid:masterpid},data1=>{
				var sg_code=getSg_code(sitekey, masterpid, data, data1)+
					"<script>"+
						"$('#sg-button').click(()=>"+
							"$.post('/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-MiniAddProduct',$('#addProductForm').serialize(),data=>{"+
								"window.location='/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-Show'"+
							"}));"+
					"</script>";
				
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

function getSg_code(sitekey,masterpid,data,data1) {
	data=data.data[0];
	var sel=/<select[.\w\W]*<\/select>/mi.exec(data1).join('').replace(/[\n\t]+/g,'');
	var c_imagesPLP=data.c_imagesPLP;
	var isRequiredCaptcha=data.c_flashProduct;
	var c_division=data.c_division;
	var name=data.name;
	var price=data.c_displayPrice;
	var isExcludedPromo=data.c_pdpCallout=="pdp-promo-nodiscount";
	var c_color=data.c_color;
	var c_maxQuantity=data.c_maxQuantity;

	var sg_code=
	`<div id="productInfo" class="container">`+
	`	<div class="col-8">`+
	`		<div class="main-image">`+
	`			<img src="http://demandware.edgesuite.net/sits_pod14-adidas/dw/image/v2/aagl_prd/on/demandware.static/-/Sites-adidas-products/default/dw05d1e707${c_imagesPLP}" width="500" height="500">`+
	`		</div>`+
	`	</div>`+
	`	<div class="col-4">`+
	`		<div id="buy-block">`+
	`			<div class="title-16 adi-medium-grey vmargin4 pdp-category">`+
	`				<span class="pdp-category-in">${c_division}</span>`+
	`			</div>`+
	`			<h1 class="title-32 vmargin8">${name}</h1>`+
	`			<div class="price-holder">`+
	`				<div class="price vmargin8">`+
	`					<div class="price-in">`+
	`						<span class="currency-sign">`+
	`							£`+
	`						</span>`+
	`						<span class="sale-price" id="salesprice-${masterpid}">`+
	`							${price}`+
	`						</span>`+
	`					</div>`+
	`				</div>`+
	`			</div>`+
				(isExcludedPromo?
		`			<div class="small-callout-container vmargin8">`+
		`				<div class="callout-bars">`+
		`					<div class="callout-bar">`+
		`						<div class="callout-bar-copy">`+
		`							<span class="callout-bar-headline">This product is excluded from all promotional discounts and offers.</span>`+
		`						</div>`+
		`					</div>`+
		`				</div>`+
		`			</div>`
				:'')+
	`			<div class="product-color para-small">`+
	`				Color ${c_color} (${masterpid})`+
	`			</div>`+
	`			<div class="add-product-block">`+
	`				<form id="addProductForm" name="addProductForm" action="/on/demandware.store/Sites-adidas-GB-Site/en_GB/Cart-MiniAddProduct">`+
	`					<input type="hidden" name="layer" value="Add To Bag overlay">`+
	`					${sel}`+
						(isRequiredCaptcha?
		`					<div class="captcha-container">`+
		`						<script src="https://www.google.com/recaptcha/api.js"></script>`+
		`						<div class="g-recaptcha" data-sitekey="${sitekey=(data.c_reCaptchaKeys!=null?JSON.parse(data.c_reCaptchaKeys).publicKey:sitekey)}"></div>`+
		`					</div>`
						:'')+
	`					<div class="addtocart rbk-shadow-block vmargin20">`+
	`						<input type="hidden" name="masterPid" value="${masterpid}">`+
	`						<div class="buttons-container-outer">`+
	`							<div class="add-to-cart-container">`+
	`								<input type="hidden" name="sessionSelectedStoreID" value="null">`+
	`								<button id="sg-button" class="add-to-cart addtocartbutton button-atb button-full-width btn btn-cart btn-lg btn-block">`+
	`									<span class="text">Add To Bag</span>`+
	`								</button>`+
	`							</div>`+
	`						</div>`+
	`					</div>`+
	`				</form>`+
	`			</div>`+
	`		</div>`+
	`	</div>`+
	`</div>`;
	return sg_code;
}