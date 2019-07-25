function Form (form, username, productId, app) {
    var self = this;
    
    self.productId = productId;
    self.username = username;
    $(form + ' form').submit();
    
    return {
        username : self.username,
        productId : self.productId
    };  
}
$(document).ready(function () {
    var ott = new Ott();
	
	twig({ href: 'header.html', load: function(template){
		document.querySelector("header").outerHTML = template.render({ baseUrl: ott.RootUrl });
		
		if (ott.isLogged()) {
			$('.connected').show();
			$('.not-connected').remove();
		}
		else {
			$('.not-connected').show();
			$('.connected').remove();
			$('.subscription-button').addClass('');
		}
	}});
	
	twig({ href: 'footer.html', load: function(template){
		document.querySelector("footer").outerHTML = template.render({ baseUrl: ott.RootUrl });
	}});
	
	$('#modal-connection .modal-close, #modal-connection modal-overlay').click(function() {
		$('#modal-connection').removeClass('is-visible');
		$('body').removeClass('modal-show');
	});
    
    var urlParameters = window.location.href.split('?');
    //success, fail, cancel
    if (urlParameters.length > 1) {
        urlParameters = urlParameters[1].split('&');
        var status = null;
        var orderId = null;
        var productId = null;
        var extraData = {};

        for (var i = 0; i < urlParameters.length; i++) {
            if (urlParameters[i].split('=')[0] == 'status')
                status = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'order_id')
                orderId = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'product_id')
                productId = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'currency')
                extraData['currency'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'amount')
                extraData['amount'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'PM')
                extraData['PM'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'ACCEPTANCE')
                extraData['ACCEPTANCE'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'STATUS')
                extraData['STATUS'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'CARDNO')
                extraData['CARDNO'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'ED')
                extraData['ED'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'CN')
                extraData['CN'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'TRXDATE')
                extraData['TRXDATE'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'PAYID')
                extraData['PAYID'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'NCERROR')
                extraData['NCERROR'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'BRAND')
                extraData['BRAND'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'IP')
                extraData['IP'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'SHASIGN')
                extraData['SHASIGN'] = urlParameters[i].split('=')[1];
            else if (urlParameters[i].split('=')[0] == 'alias_id')
                extraData['alias_id'] = urlParameters[i].split('=')[1];
            
        }

        if (readCookie(orderId) == null) {
            ott.validateLicensePurchase(extraData, status, orderId, productId, function (status) {
                $('.statut.' + status).show();
                if(status == 'success')
					ott.setGtmTxVariables('Subscription');
                createCookie(orderId, true, 1);
            });
        }            
    }
    ott.getSlider(function (template) {
        $('#slider').html(template);
        e = $("#slider .item").length;
        t = e - 1;
        s = window.setInterval(i, n);
        r();
        u();
        a();
        slideInfinite();
        search();
    });

    ott.getLicenses(function (template) {
        $('.subs').html(template);
        $('.subscription-button').click(function () {
            if ($('.subscription.selected').length > 0) {
                var productId = $('.subscription.selected').data('id');
                
                //if user is not logged in we ask 'em to do so
                if (!ott.isLogged()) {
					window.scrollTo(0, 0);
					$('#modal-connection').toggleClass('is-visible');
					$('body').toggleClass('modal-show');
					$("#modal-connection .connect-modal").click(function(){
						sessionStorage.setItem('selectedSubscription', productId);
						sessionStorage.setItem('redirectUrl', window.location.href);
					});
					
					return;
				}

                $('#alpaca-form').html('');
                ott.purchaseLicense(productId, function (data) {
                    formData = $.extend(data['form'], {
                        'postRender': function(control) {
							$('#confirmation button[type="submit"]').click(function () {
								Form('#alpaca-form', formData['data']['EMAIL'], productId, 'app');
							});
							$('#confirmation button[type="reset"], #confirmation .modal-close').click(function () {
								$('#confirmation').removeClass('is-visible');
								$('body').removeClass('modal-show');
							});
                        }
                    });
                    $('#confirmation').toggleClass('is-visible');
                    $('body').toggleClass('modal-show');
                    window.scrollTo(0,100);		//jump up for small slide animation
                    var body = $("html, body");
					body.stop().animate({scrollTop:0}, '500', 'swing');
                    $("#alpaca-form").alpaca(formData);
                });
            }
        });

        $(".subscription:not(.acq, .disabled)").click(function() {
            $(".subscription:not(.acq, .disabled)").removeClass("selected");
            $(this).addClass("selected");
            $(".subs button, .reload button").addClass("selected");
        });
        subinfo();

        if (readCookie('cookieVerif') == null) {
            $('.cookie-verif').show();
            $('.cookie-verif button').click(function () {
                createCookie('cookieVerif', true, 99);
                $('.cookie-verif').hide();
            });
        }
                
        //if user tried to subscribe as guest then he should have product
        //selected at this point
        if( ott.isLogged() && sessionStorage.selectedSubscription ) {
			var canPurchase;
			var productId = sessionStorage.selectedSubscription;
			sessionStorage.removeItem('selectedSubscription');
			
			//we cross check if user already have selected subscription
			$('.subscription').each(function(index, elm){
				if( $(elm).data('id') == productId )
					if( !$(elm).hasClass('acq') && !$(elm).hasClass('disabled') ){
						canPurchase = true;
						$("div[data-id='"+productId+"']").addClass('selected');
						}
					else
						$('.existing').show();
			}); 
			
			$('#alpaca-form').html('');
			
			if( canPurchase ) {
				ott.purchaseLicense(productId, function (data) {
					formData = $.extend(data['form'], {
						'postRender': function(control) {
							$('#confirmation button[type="submit"]').click(function () {
								Form('#alpaca-form', formData['data']['EMAIL'], productId, 'app');
							});
							$('#confirmation button[type="reset"], #confirmation .modal-close').click(function () {
								$('#confirmation').removeClass('is-visible');
								$('body').removeClass('modal-show');
							});
						}
					});
					$('#confirmation').toggleClass('is-visible');
					$('body').toggleClass('modal-show');
                    window.scrollTo(0,100);		//jump up for small slide animation
                    var body = $("html, body");
					body.stop().animate({scrollTop:0}, '500', 'swing');
					$("#alpaca-form").alpaca(formData);
				});
			}
		}

    });  
});
