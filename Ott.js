
function Ott() {
    var templates = {};
    var self = this;
    var rootUrl = window.location.origin + '/ott';
    var isLocal = false;
    var isLogged = false;
    var regex = new RegExp("<[^>]*>", 'g');
    var temp;
    var adminEmail = 'softrovetest2@gmail.com';
    this.episodeData = {};

    if (!window.location.origin)
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');

    temp = window.location.href.split('/');
    rootUrl = "";

    for (var i = 0; i < temp.length - 1; i++) {
        if (temp[i] != 'connection')
            rootUrl += temp[i] + '/';
    }

    if (readCookie('username') != null)
        isLogged = true;
    else {
        //eraseCookie('userId');
        eraseCookie('usid');
    }

	//geolocation test
    
	new BxApi().call('GET', '/api/server/geolocation')
	.done(function(json){
	if( json.server && json.server.geoBlocked == true ){	
		self.getTemplate('geoblocked', function(template){
	    	$('body').append( template.render( json.server ) );
	    	if(navigator.userAgent.match(/BM-NATIVE-APP/i)){
	        	$('.small-block').show();
	        }
	    	else 
	    	{
	    		$('.big-block').show();
	    	}
	    	$("body").css("overflow", "hidden");
	    });
		}		
	});
	
    /*
    *   Returns a boolean indicating if the user is logged or not
    */
    Ott.prototype.isLogged = function() { return isLogged; };

    /*
    *   Returns the rootUrl in which the website can be found on the server
    */
    Ott.prototype.RootUrl = function () { return rootUrl }; 
    /*
     * Returns whether application is running on Apps or not. 
     */
    Ott.prototype.isNative = function (){
    	var isNative = false;
    	if(navigator.userAgent.match(/BM-NATIVE-APP/i)){           	
        	return isNative = true;           	
        }
        else{
        	return isNative = false;
        }
    };
    /*
    *   Returns the adminEmail
    */
    Ott.prototype.AdminEmail = function () { return adminEmail };
     
    /*
    *   Returns information about an episode such as its title or its description
    */
    Ott.prototype.getEpisodeMetadata = function (episodeId) { return this.episodeData[episodeId]; };

    /*
    *   Register an user on the Boox API
    */
    Ott.prototype.register = function(email, password, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/guest/login', {}).done(function(data) {
            bxApi.call('POST', '/api/user', {
                email: email,
                password: password,
                YII_CSRF_TOKEN: data.form.data.csrf,
                'ver': webui_v,
                'device_id': md5(BrowserDetect.OS + ":" + BrowserDetect.browser + ":" + BrowserDetect.version),
                'platform': BrowserDetect.browser,
                'os_ver': BrowserDetect.version
            }).done(function() {
                callback(null);
            }).fail(function(err) {
                callback(err);
            });
        });
    };

    /*
    *   Login an user on the Boox API  
    */
    Ott.prototype.login = function(email, password, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/guest/login', {}).done(function(data) {
            bxApi.login(email, password, data.form.data.csrf).done(function(data) {
                createCookie('username', user.email);
                callback(null);
            }).fail(function(err) {
                callback(err);
            });
        });
    };

    /*
    *   Perform Boox social login
    */
    Ott.prototype.socialLogin = function(user, keepMeLogged, callback) {
        var bxApi = new BxApi();

        bxApi.call('POST', '/api/social/login', {
            data:   JSON.stringify({ 
                        "UIDSignature": user.UIDSignature,
                        "isSiteUID": user.isSiteUID,
                        "siteUID": user.siteUID,
                        "signatureTimestamp": user.signatureTimestamp,
                        "UID": user.UID
                    }),
            userProfile: user.userProfile,
            email: user.email
        }).done(function(data) {
            if (keepMeLogged == true)
                createCookie('username', user.email, usernameCookieDurationRemember);
            else
                createCookie('username', user.email, usernameCookieDurationNormal);
            callback(null);
        }).fail(function(err) {
            callback(err);
        });
    };

    /*
    *   Logout an user from the frontend by cleaning his cookies  
    */
    Ott.prototype.logout = function() {
        var bxApi = new BxApi();

        bxApi.logout().done(function(data) {
            bxApi.username = 'guest';
            bxApi.password = '';
            eraseCookie('userId');
            eraseCookie('username');
            eraseCookie('usid');
            window.location.assign(rootUrl);
        });
    };
    
    /*
     * Post Allo Code for Minutes
     */
    Ott.prototype.AddMinutes = function (code, callback){
    	var bxApi = new BxApi();

        bxApi.call('POST', '/api/user/'+bxApi.username+'/useralias', {
        	alias_id: code
        }).done(function(data) {
        	
            callback(null, data);
        })
        .fail(function(err) {
            if (err[2] == 'Bad Request')
                callback({ code: err[0]['responseJSON']['error']['code'] }, null);           
        });
    	
    };
    
    /*
     * Listing Services 
     */
   
    Ott.prototype.getServices = function (callback){
    	var bxApi = new BxApi();
    	
        bxApi.call('GET', '/api/user/'+bxApi.username+'/service', {
        	
        }).done(function(data) {
        	if(data.service != null){
        	var serviceName = data.service.serviceName;
        	if(serviceName.toUpperCase() == 'ALLO RTL')
        		userAllo = true
        		
        	if(serviceName.toUpperCase() == 'ALLO RTL PREMIUM')
        		userRop = true;
        	
        	if(serviceName.toUpperCase() == 'BASE PREMIUM')
        		userBase = true;
        	
            callback(data);
        	}
        }).fail(function(err) {
        	if(err[2] == "Bad Request"){
        		$('.no-package').show();
				 	$('.modal-close').click(function(){
           			$('.no-package').hide();
           		});
        	}
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    	
    }; 
    
    /*
     * Allo-Service Info
     */
   
    Ott.prototype.getServiceInfo = function (id, callback){
    	var bxApi = new BxApi();
    	var serviceId = id;
    	
        bxApi.call('GET', '/api/user/'+bxApi.username+'/service/'+serviceId, {
        	
        }).done(function(data) {
        	var allo = {};
        	
        	allo['packageStatus'] = data['services'][0]['user']['status'];     	 	 
        	allo['packageMinutes'] = data['services'][0]['packages'][0]['minutes'];
        	allo['usedMinutes'] = data['services'][0]['packages'][0]['user']['minutesConsumed'];
        	allo['expiryDate'] = data['services'][0]['packages'][0]['user']['expiryDate'];
        	
            callback(allo);
        }).fail(function(err) {
        	if(err[2] == "Bad Request"){
        		$('.no-package').show();
				 	$('.modal-close').click(function(){
           			$('.no-package').hide();
           		});
        	}
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    	
    }; 
    /*
     * Get Minutes Package Details
     */
    Ott.prototype.getPackageDetails = function (id, callback){
    	var bxApi = new BxApi();
    	var serviceId = id;
    	
        bxApi.call('GET', '/api/user/'+bxApi.username+'/service/'+serviceId+'/package/minutes', {
        	
        }).done(function(data) {
        	var reMinutes = data['remainingMinutes'];
        	
            callback(reMinutes);
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    	
    }; 
    
    
    /*
     * Channel Listing
     */
    Ott.prototype.getChannels = function (callback){
    	var bxApi = new BxApi();
    	
    	
        bxApi.call('GET', '/api/user/'+bxApi.username+'/channel', {
        	include: 'epg,liveservice'
        }).done(function(data) {
        	
        	var channels = data['channelList']['channels'];
        		channels = channels.reverse();        	
        	var strmL	= null;
        	for(channelId in channels){
        		epgName = channels[channelId]['epg'][0]['title'];
        		        	
        	}

        	Ott.prototype.getTemplate('listchannels', function (template) {
                callback(template.render({ channels: channels, epgName:epgName }), channels);
            });   
           
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    	
    }; 

    /*
    *   Get any twig template from the template directory
    */
    Ott.prototype.getTemplate = function (templateName, callback) {
        if (templates[templateName] == null) {
            var template = twig({
                href: rootUrl + "/assets/templates/" + templateName + ".twig",
                load: function(template) {
                    templates[templateName] = template;
                    callback(template);
                }
            });
        }
        else
            callback(templates[templateName]);
    };

    /*
    *   Get the slider data from the Boox API
    */
    Ott.prototype.getSlider = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/server/image', {
            type: 'banner',
            isForeground: true
        }).done(function(data) {
            var templateData = {};
            for (var i = 0; i < data['imageList']['images'].length; i++) {
                var splitUrl = window.location.href.split('/');
                var linkUrl = '';

                for (var j = 0; j < (splitUrl.length - 1); j++) {
                    linkUrl += splitUrl[j] + '/';
                }

                templateData[i] = {};
                templateData[i]['pictureUrl'] = 'http://rtlalinfini.be' + data['imageList']['images'][i]['sizes']['1200'];
                templateData[i]['linkUrl'] = /*linkUrl + 'details.html?season=' + */data['imageList']['images'][i]['linkUrl'];
            }

            var template = Ott.prototype.getTemplate('slider', function (template) {
                callback(template.render({ slides: templateData }));
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get the categories from the Boox API  
    */
    Ott.prototype.getCategories = function (typeId, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/product', {
            type: 'SEASON_GROUP',
            output: 'full',
            include: 'vod__thumbnails',
            sort: 'tagrank__asc',
            tag: typeId.toLowerCase()
        }).done(function(data) {
            var template = Ott.prototype.getTemplate('categories', function (template) {
                callback(template.render({ products: data['productList']['products'] }));
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };
    /*
    *   Get an user favorite seasons from the Boox API  
    */
    Ott.prototype.getFavorite = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/season', {
            favorite: true,
            output: 'full',
            include: 'thumbnails'
        }).done(function(data) {
            if (data['season']['seasonListing']['vodSeasons'].length > 0) {
                var template = Ott.prototype.getTemplate('favorite', function (template) {
                    callback(template.render({ seasons: data['season']['seasonListing']['vodSeasons'] }));
                });
            }
            else
                callback('');
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get season data from the Boox API and create the tooltip content  
    */
    Ott.prototype.getTooltip = function (seasonId, callback) {
        var self = this;
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/season/' + seasonId, {
            output: 'full',
            include: 'episodes,categories,thumbnails,series,episodes__streams__products,episodes__licensingWindows'
        }).done(function(data) {
            var templateData = {};

            templateData['title'] = self.getTitle(data['vodSeason']['series'][0]['titles']);
            templateData['name'] = self.getTitle(data['vodSeason']['titles']);
            templateData['description'] = self.getDescription(data['vodSeason']['descriptions']).replace(regex, '');
            templateData['rating'] = data['vodSeason']['rating'];
            templateData['peg'] = Math.min.apply(Math, data['vodSeason']['advisoryRatings']);
            templateData['language'] = '';
            templateData['favorite'] = data['vodSeason']['favorite'];
            templateData['episodes'] = data['vodSeason']['episodes'];
            templateData['selection'] = 0;
            templateData['seriePass'] = 0;
            templateData['HD'] = false;
            templateData['isVisible'] = false;
            
            var totalepisodes = templateData['episodes']['length'];
            for (episodeId in data['vodSeason']['episodes']) {
                var episode = data['vodSeason']['episodes'][episodeId];
                var licenses = self.getLicenseAvailability(episode.licensingWindows);
                for (streamId in episode.streams) {
                    var stream = episode.streams[streamId];
                    if (stream.lang && stream.lang.length > 0)
                        templateData['language'] = stream.lang;
                    if (stream.quality.toUpperCase() == 'HD')
                        templateData['HD'] = true;
                    for (productId in stream.products) {
                        var product = stream.products[productId];

                        for (epiID in data['vodSeason']['episodes']){                       	
                            templateData['isVisible'] = self.isAvailable(data['vodSeason']['episodes'][epiID]['visibilityStartTime']);                                                                                  
                        }                                             
                    if (product.type.toUpperCase() == 'SVOD') {
                            	if (product.title == 'SeriesPass' && templateData['isVisible'] == true)
                                    templateData['seriePass']++;                           	
                                else if (product.title == 'Selection' && templateData['isVisible'] == true)
                                    templateData['selection']++;
                            } 
                    }
                }
            }

            var template = Ott.prototype.getTemplate('tooltip', function (template) {
                callback(template.render({ show: templateData, seasonId: seasonId, isLogged: isLogged, epi: totalepisodes }));
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Add a season using its ID to an user favorites  
    */
    Ott.prototype.addToFavorite = function (seasonId, favorite, callback) {
        var bxApi = new BxApi();

        bxApi.call('PUT', '/api/user/' + bxApi.username + '/season/' + seasonId + '/tag', {
            favorite: favorite
        }).done(function(data) {
            callback();
        }).fail(function(err) {
            bxApi.username = 'guest';
            bxApi.password = '';
            eraseCookie('userId');
            eraseCookie('username');
            eraseCookie('usid');
            window.location.assign(rootUrl);
        });
    }

    /*
    *   Find a season using its title
    */
    Ott.prototype.search = function (title, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/vod/', {
            include: 'seasons__thumbnails',
            type: 'series',
            title: title,
            strict_search: false
        }).done(function(data) {
            var templateData = [];

            for (vodId in data['vod']['vodProgramList']['vodPrograms']) {
                var vod = data['vod']['vodProgramList']['vodPrograms'][vodId];
                for (seasonId in vod.seasons) {
                    var season = vod.seasons[seasonId];
                    templateData.push(season);
                }
            }

            Ott.prototype.getTemplate('search', function (template) {
                callback(template.render({ seasons: templateData, baseUrl: rootUrl }));
            });
        }).fail(function(err) {
            bxApi.username = 'guest';
            bxApi.password = '';
            eraseCookie('userId');
            eraseCookie('username');
            eraseCookie('usid');
            window.location.assign(rootUrl);
        });
    }
    /*
     * Wallet Recharge Details
     */
    Ott.prototype.getWalletHistory = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet', {})
        .done(function(data) {
        	var walletId = data['wallets'][0]['id'];
        	bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet/'+walletId+'/transaction', {})
            .done(function(data) {
            	var rechargeList = data['transactions'];
            	
            Ott.prototype.getTemplate('wallet-refill', function (template) {
                callback(template.render({ rechargeList: rechargeList }));
            });
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get an user financial data (Credits, WalletId)  
    */
    Ott.prototype.getUserData = function (userToken, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet', {})
        .done(function(data) {
            var templateData = {};

            templateData['email'] = bxApi.username;
            templateData['credits'] = data['wallets'][0]['amount'];
            Ott.prototype.getTemplate('user-info', function (template) {
                callback(template.render({ user: templateData }), data['wallets'][0]['amount'],  data['wallets'][0]['id']);
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get a list of all the credit packs available  
    */
    Ott.prototype.getChargeOptions = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet/charge', {
            output: 'full',
            include: 'products'
        })
        .done(function(data) {
            for (var i = 0; i < data['options'].length; i++) {
                if (data['options'][i]['type'] == 'cc')
                    break;
            }

            Ott.prototype.getTemplate('charge-wallet', function (template) {
                callback(template.render({ chargeOptions: data['options'][i]['products'] }));
            });
        })
        .fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get the Alpaca Form that redirects the user to ogone to buy credits  
    */
    Ott.prototype.purchaseCredits = function (productId, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet', {})
        .done(function(data) {
            bxApi.call('POST', '/api/user/' + bxApi.username + '/wallet/' + data['wallets'][0]['id'] + '/transaction', {
                optionId: 1,
                data: JSON.stringify({ 'productId': productId }),
                successUrl: window.location.href,
                failedUrl: window.location.href,
                cancelledUrl: window.location.href
            })
            .done(function(data) {
            	console.log(data);
                callback(data['form']);
            })
            .fail(function(err) {
                console.log(err);
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Validate a voucher and display the result of the operation  
    */
    Ott.prototype.redeemCredits = function (code, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet', {})
        .done(function(data) {
            bxApi.call('POST', '/api/user/' + bxApi.username + '/wallet/' + data['wallets'][0]['id'] + '/transaction', {
                optionId: 2,
                data: JSON.stringify({ 'code': code }),
            })
            .done(function(data) {
                callback(null, data);
            })
            .fail(function(err) {
                if (err[2] == 'Bad Request' && err[0]['responseJSON']['error']['code'] == 1808)
                    callback({ code: err[0]['responseJSON']['error']['code'] }, null);
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get the Alpaca Form that redirects to Ogone to buy licenses  
    */
    Ott.prototype.purchaseLicense = function (licenseId, callback) {
        var bxApi = new BxApi();
        var optionId = 1;
        bxApi.call('POST', '/api/user/' + bxApi.username + '/product/' + licenseId + '/buy/option/' + optionId, {
            optionData: JSON.stringify({ 'card': 'new' }),
            successUrl: location.href.replace( location.search, '' ),
            failureUrl: location.href.replace( location.search, '' ),
            cancelUrl: location.href.replace( location.search, '' )
        })
        .done(function(data) {
            callback(data);
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Once ogone has sent us confirmation that the payment has gone through, validate the license token with the Boox API  
    */
    Ott.prototype.validateLicensePurchase = function (extra, status, orderId, productId, callback) {
        var bxApi = new BxApi();
        var optionId = 3;

        bxApi.call('GET', '/api/user/' + bxApi.username + '/license/ccverify', {
            status: status,
            order_id: orderId.toString(),
            product_id: productId.toString(),
            extraData: extra
        }).done(function(data) {
            var status = 'failure';

            if (data['form']['data']['buyStatus'] == 1 && data['form']['data']['isLicenseAdded'] == true)
                status = 'success';

            callback(status);
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Purchase a TVOD  
    */
    Ott.prototype.purchaseVOD = function (vodId, walletId, callback) {
        var bxApi = new BxApi();
        var optionId = 3;

        bxApi.call('POST', '/api/user/' + bxApi.username + '/wallet/product/' + vodId + '/buy/option/' + optionId, {
            data: JSON.stringify({ "wallet": walletId })
        }).done(function(data) {
            callback(data);
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get the latest products bought by a user using his wallet (credits)
    */
    Ott.prototype.getUserTransactions = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/license', {
            payment_method: 'all'
        })
        .done(function(data) {
        	
        	var trans = data['license']['licenseList']['licenses'];
        	var transactRev = trans.reverse();
            Ott.prototype.getTemplate('user-transactions', function (template) {
                callback(template.render({ transactions: transactRev }));
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get the latest subscription payments for a given user
    */
    Ott.prototype.getUserPaymentHistory = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/license', {
            payment_method: 'credit_card'
        })
        .done(function(data) {
            var nextPayment = { date: null, price: 0 };
            var trans = data['license']['licenseList']['licenses'];
        	var transactRev = trans.reverse();
            for (licenseId in data['license']['licenseList']['licenses']) {
                var license = data['license']['licenseList']['licenses'][licenseId];

                if (license && license.product.type.toUpperCase() == 'SVOD' && license.status.toUpperCase() == 'ACTIVE' && license.recurring == true) {
                    nextPayment.date = license.stopDate;
                    nextPayment.price = license.product.price;
                }
            }

            Ott.prototype.getTemplate('user-payment-history', function (template) {
                callback(template.render({ transactions: transactRev }), nextPayment);
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get a list of the subscriptions available for purchase
    */
    Ott.prototype.getLicenses = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/product', {
            type: 'SVOD'
        })
        .done(function(data) {
            var licenses = {};

            for (licenseId in data['productList']['products']) {
                var license = data['productList']['products'][licenseId];
                if( !licenses[license.title] || licenses[license.title].isUserAuthorized == false )
					licenses[license.title] = { id: license.id, isUserAuthorized: license.isUserAuthorized, price: license.price, disabled: false }
            }

            if (licenses['ROP'].isUserAuthorized == true) {
                licenses['ROP'].disabled = true;
            }

            var template = Ott.prototype.getTemplate('licenses', function (template) {
                callback(template.render({ licenses: licenses }));
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get a list of the subscriptions owned by the user
    */
    Ott.prototype.getUserLicenses = function (callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/license', {
            payment_method: 'all',
            status: 'active'
        })
        .done(function(data) {
            ret = [];

            for (licenseId in data['license']['licenseList']['licenses']) {
                var license = data['license']['licenseList']['licenses'][licenseId];
                var sublicenses = data['license']['licenseList']['licenses'];
                var flag = false;
                
                $.each( sublicenses, function( index, value ){
                	if(value.recurring){
                		flag = true;
                	}
                });
                
                var todayD = new Date(); 
                var buyDate = new Date(license.purchaseDate);
                var old = Math.floor((todayD - buyDate) / 1000 / 60 / 60 / 24);                
                if(old == 0)
                	ret['newBuy']= true;
                else
                	ret['newBuy']= false;
                
                if (license && license.product.type.toUpperCase() == 'SVOD') {
                    if (!ret[license.product.title]) {
                        var a = new Date(); // Now
                        var b = new Date(license.stopDate);
                        ret[license.product.title] = Math.floor((b - a) / 1000 / 60 / 60 / 24);                       
                        if(flag)
                        	ret['recurring']= true;
                        else
                        	ret['recurring']= false;

                        //ret['expiryDate'] = b.toDateString();
                        var year = b.getFullYear() - 2000;
                        var month = (b.getMonth()+1);
                        if(month < 10)
                        { month = '0' + month; }
                        ret['expiryDate'] = b.getDate() + '/' + month + '/' + year;
                        ret['productId'] = license.product.id;
                        ret['licenseId'] = license.id;
                        ret['licenseMethod'] = license.paymentMethod;
                        ret['licenseRecurring'] = license.recurring;
                    }
                }                              
            }
            
            callback(ret);
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
     * Cancel Subscription License
     */
    	 
    Ott.prototype.cancelLicense = function (licenseId, callback) {
        var bxApi = new BxApi();
        bxApi.call('PUT', '/api/user/' + bxApi.username + '/license/' + licenseId, {
        	recurring: false
        })
        .done(function(data) {
            callback(data);
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };
    
    /*
    *   Get the license informations for a given product
    */
    Ott.prototype.getProductLicenseInfo = function (productId, callback) {
        var bxApi = new BxApi();
        bxApi.call('GET', '/api/user/' + bxApi.username + '/license', {
            pid: productId
        })
        .done(function(data) {
            var expiryDate = null;

            for (licenseId in data['license']['licenseList']['licenses']) {
                var license = data['license']['licenseList']['licenses'][licenseId];
                if (license.product.type.toUpperCase() == 'TVOD') {
                    var a = new moment();
                    var b = new moment(license.stopDate);
                    expiryDate = Math.floor((b - a) / 1000 / 60 / 60);
                    break;
                }
            }
            callback(expiryDate);
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get the data for a given show
    */
    
    Ott.prototype.getShow = function (seasonId, callback) {
		var seasonGroup = sessionStorage.getItem('seasonGroup') ? sessionStorage.getItem('seasonGroup') : 'n/a';
		var videoCat = (sessionStorage.getItem('videoCategory') && sessionStorage.getItem('seasonGroup')) ? sessionStorage.getItem('videoCategory') : '';
        var self = this;
        var bxApi = new BxApi();
        var includeList = 'episodes,categories,thumbnails,series,episodes__thumbnails,episodes__streams__products,episodes__licensingWindows';
		
		if( !videoCat || videoCat=='' || videoCat=='Home' ) {
			includeList = 'purchaseOptions,episodes,categories,thumbnails,series,episodes__thumbnails,episodes__streams__products,episodes__licensingWindows';
			videoCat = '';
			sessionStorage.setItem('videoCategory' , '');
		}
		
        bxApi.call('GET', '/api/user/' + bxApi.username + '/season/' + seasonId, {
            output: 'full',
            include: includeList,
            future: 'episodes__true'
        }).done(function(data) {
        	self.seasonPass = {id: self.userLicenceProductId , title: " "};
            var templateData = {};
            var showId = data['vodSeason']['series'][0]['id'];
            templateData['isVisible'] = false;
            templateData['userRating'] = 0;
            templateData['HD'] = false;
            templateData['id'] = data['vodSeason']['id'];
            templateData['showName'] = self.getTitle(data['vodSeason']['series'][0]['titles']);
            templateData['name'] = self.getTitle(data['vodSeason']['titles']);
            templateData['description'] = self.getDescription(data['vodSeason']['descriptions']).replace(regex, '');
            templateData['rating'] = data['vodSeason']['rating'];
            templateData['userRating'] = data['vodSeason']['userRating'];
            templateData['raterCount'] = data['vodSeason']['raterCount'];
            templateData['peg'] = Math.min.apply(Math, data['vodSeason']['advisoryRatings']);
            templateData['language'] = '';
            templateData['selection'] = 0;
            templateData['seriePass'] = 0;
            templateData['lastWatched'] = false;
            templateData['allapp'] = false;
            templateData['des'] = false;
            templateData['favorite'] = data['vodSeason']['favorite'];            
            var logoData = data['vodSeason']['thumbnails']['images'];
            for(logoId in logoData)
            	{
                	if(logoData[logoId].type == 'tvlogo')
                	{
                		var logoURL = data['vodSeason']['thumbnails']['images'][logoId]['url'];
                		if(logoURL.match(/^http([s]?):\/\/.*/))
                		templateData['logoUrl'] = logoURL;
                		else templateData['logoUrl'] = data['vodSeason']['thumbnails']['baseUrl'] + '' + data['vodSeason']['thumbnails']['images'][logoId]['url'];
                	}	
                }	
            for (episodeId in data['vodSeason']['episodes']) {
                var episode = data['vodSeason']['episodes'][episodeId];
                var licenses = self.getLicenseAvailability(episode.licensingWindows);
                for (streamId in episode.streams) {
                    var stream = episode.streams[streamId];
                    if (stream.lang && stream.lang.length > 0)
                        templateData['language'] = stream.lang;
                    if (stream.quality.toUpperCase() == 'SD')
                        playUrl = stream.url;
                    else if (stream.quality.toUpperCase() == 'HD')
                        templateData['HD'] = true;
                    for (productId in stream.products) {
                        var product = stream.products[productId];

                        for (epiID in data['vodSeason']['episodes']){                       	
                            templateData['isVisible'] = self.isAvailable(data['vodSeason']['episodes'][epiID]['visibilityStartTime']);                                                      
                        }                                             
                    if (product.type.toUpperCase() == 'SVOD') {
                            	if (product.title == 'SeriesPass' && templateData['isVisible'] == true) {
                                    templateData['seriePass']++;
                                    if(templateData['seriePass']>0)
                                    	self.seasonPass = {id: product.id , title: product.title};
                            	}
                                else if (product.title == 'Selection' && templateData['isVisible'] == true) {
                                    templateData['selection']++;
                                    if(templateData['selection']>0 && templateData['seriePass']==0)
                                    	self.seasonPass = {id: product.id , title: product.title};
                                }
                            } 
                         }
                      }                    
                 }
            var posterData = data['vodSeason']['thumbnails']['images'];
            for(thumbId in posterData)
            	{
            	if(posterData[thumbId].type == 'poster')
            	  templateData['seasonPoster'] = data['vodSeason']['thumbnails']['baseUrl'] + '' + data['vodSeason']['thumbnails']['images'][thumbId]['url'];
            	}
            
            var lastWatched = self.getLastWatched(data['vodSeason']['episodes']);
            var epicheck = data['vodSeason']['episodes'];
            var totalepisodes = epicheck['length'];
            if (lastWatched != null) {
                templateData['lastWatched'] = true;
                templateData['lastWatchedId'] = lastWatched.id;
                templateData['lastWatchedTitle'] = self.getTitle(lastWatched.titles);
                for (var x = 0; x < lastWatched['thumbnails']['images'].length; x++) {
                    if (lastWatched['thumbnails']['images'][x]['type'] == 'thumbnail')
                        templateData['lastWatchedThumbnail'] = lastWatched['thumbnails']['baseUrl'] + lastWatched['thumbnails']['images'][x]['url'];
                }
            }           
            if(navigator.userAgent.match(/BM-NATIVE-APP/i)){           	
            	templateData['allapp'] = true;           	
            }
            else{
            	 templateData['des'] = true;
            }

            var template = Ott.prototype.getTemplate('show', function (template) {
                callback(showId, templateData['name'], templateData['showName'], template.render({ show: templateData, isLogged: isLogged, epi: totalepisodes }));       
           });
           
           if(data.vodSeason.purchaseOptions && data.vodSeason.purchaseOptions.length) {
			   $.each( data.vodSeason.purchaseOptions , function(index, obj) {
				   if(obj.products && obj.products.length) {
					   $.each(obj.products , function(indexP, objP) {
						   if (objP.tags && objP.tags.length) {
							   $.each(objP.tags , function(indexT, objT) {
								   if(objT == 'series' || objT == 'famille' || objT == 'emission') {
									   if(objT == 'emission')
										videoCat = 'emissions';
									   else
										videoCat = objT;
									   videoCat = videoCat[0].toUpperCase() + videoCat.substr(1);
									   sessionStorage.setItem('videoCategory' , videoCat);
									   return false;
								   }
							   });
							   if( videoCat != '' )
								return false;
						   }
					   });
					   if( videoCat != '' )
						return false;
				   }
			   });
		   }
           var pageUrl = window.location.pathname + window.location.hash + window.location.search;
           dataLayer.push({'event':'virtualPageView', 'pageUrl':pageUrl, 'pageTitle':document.title, 'videoCategory':videoCat, 'videoProduct':templateData['showName'], 'season':templateData['name'], 'seasonGroup':seasonGroup});
           
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                var pageUrl = window.location.pathname + window.location.hash + window.location.search;
                dataLayer.push({'event':'virtualPageView', 'pageUrl':pageUrl, 'pageTitle':document.title, 'videoCategory':videoCat, 'videoProduct':'n/a', 'season':'n/a', 'seasonGroup':seasonGroup});
                window.location.assign(rootUrl);
            }
        });
        
    };

    /*
    *   Rate a season identified by it's seasonId
    */
    Ott.prototype.rateSeason = function (seasonId, rating, callback) {
        var bxApi = new BxApi();

        if (bxApi.username != 'guest') {
            bxApi.call('PUT', '/api/user/' + bxApi.username + '/season/' + seasonId + '/tag', {
                rating: Math.ceil(rating * 20)
            }).done(function(data) {
                callback();
            }).fail(function(err) {
                if (err[2] == 'Unauthorized') {
                    bxApi.username = 'guest';
                    bxApi.password = '';
                    eraseCookie('userId');
                    eraseCookie('username');
                    eraseCookie('usid');
                    window.location.assign(rootUrl);
                }
            });
        }
    }

    /*
    *   Get a list of seasons and episodes for a given serie/show
    */
    Ott.prototype.getSeasons = function (showId, seasonId, callback) {
        var self = this;
        var bxApi = new BxApi();
        bxApi.call('GET', '/api/user/' + bxApi.username + '/season/', {
            output: 'full',
            include: 'episodes,episodes__thumbnails,episodes__licensingWindows,episodes__streams__products',
            series_id: showId,
            future: 'true,episodes__true'
        }).done(function(data) {
            var templateData = {};
            
            for (var i = 0; i < data['season']['seasonListing']['vodSeasons'].length; i++) {
                templateData[i] = {};
                templateData[i]['id'] = data['season']['seasonListing']['vodSeasons'][i]['id'];
                templateData[i]['epiCount'] = data['season']['seasonListing']['vodSeasons'][i]['episodeCount'];
                templateData[i]['name'] = self.getTitle(data['season']['seasonListing']['vodSeasons'][i]['titles']);
                templateData[i]['episodes'] = {};
                
                for (var j = 0; j < data['season']['seasonListing']['vodSeasons'][i]['episodes'].length; j++) {
                    templateData[i]['episodes'][j] = {};
                    templateData[i]['episodes'][j]['episodeNo'] = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['episodeNumber'];
                    templateData[i]['episodes'][j]['id'] = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['id'];
                    templateData[i]['episodes'][j]['name'] = self.getTitle(data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['titles']);
                    templateData[i]['episodes'][j]['description'] = self.getDescription(data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['descriptions']).replace(regex, '');
                    templateData[i]['episodes'][j]['peg'] = Math.min.apply(Math, data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['advisoryRatings']);
                    templateData[i]['episodes'][j]['duration'] = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['duration'];
                    templateData[i]['episodes'][j]['progress'] = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['playbackDuration'];
                    templateData[i]['episodes'][j]['progressPercent'] = (data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['playbackDuration'] * 100) / data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['duration'];
                    templateData[i]['episodes'][j]['availability'] = self.getAvailability(self.seasonPass.id, data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['licensingWindows']);
                    templateData[i]['episodes'][j]['available'] = self.isAvailable(templateData[i]['episodes'][j]['availability']);
                    templateData[i]['episodes'][j]['isVisible'] = self.isAvailable(data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['visibilityStartTime']);
                    templateData[i]['episodes'][j]['visibilityStartTime'] = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['visibilityStartTime'];
                    templateData[i]['episodes'][j]['visibilityEndTime'] = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['visibilityEndTime'];
                    templateData[i]['episodes'][j]['advisoryRating'] = null;

                    for (var x = 0; x < data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['thumbnails']['images'].length; x++) {
                        if (data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['thumbnails']['images'][x]['type'] == 'thumbnail')
                            templateData[i]['episodes'][j]['thumbnails'] = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['thumbnails']['baseUrl'] + data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['thumbnails']['images'][x]['url'];
                    }

                    for (advisoryId in data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['advisoryRatings']) {
                        var advisoryRating = data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['advisoryRatings'][advisoryId];

                        if (templateData[i]['episodes'][j]['advisoryRating'] == null || parseInt(advisoryRating) > parseInt(templateData[i]['episodes'][j]['advisoryRating']))
                            templateData[i]['episodes'][j]['advisoryRating'] = advisoryRating;
                    }
                    
                    var licenses = self.getLicenseAvailability(data['season']['seasonListing']['vodSeasons'][i]['episodes'][j]['licensingWindows']);

                    if (licenses[self.seasonPass.id]===false){
                    	if(self.seasonPass.title=='SeriesPass')
                    		templateData[i]['episodes'][j]['subscriptionType'] = 'SERIES PASS';
                    	else if(self.seasonPass.title=='Selection')
                    		templateData[i]['episodes'][j]['subscriptionType'] = 'SELECTION';
                    }                    
                }
            }
            
            var template = Ott.prototype.getTemplate('episodes-container', function (template) {
                callback(template.render({ seasons: templateData, seasonId: seasonId, isLogged: isLogged }));
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    Ott.prototype.getRelatedSeasons = function (seasonId, callback) {
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/season/' + seasonId + '/recommend', {
            output: 'full',
            include: 'season'
        }).done(function(data) {
            if (data['recommendations']) {
                var relatedSeasons = data['recommendations']['season']['alsoWatched'].concat(data['recommendations']['season']['similarProfiles']);
                
                if (relatedSeasons.length > 0) {
                    Ott.prototype.getTemplate('related-seasons', function (template) {
                        callback(template.render({ relatedSeasons: relatedSeasons }));
                    });
                }
                else
                    callback('');
            }
            else
                callback('');
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get episodes for a given season
    */
    Ott.prototype.getEpisodes = function (seasonId, callback) {
        var self = this;
        var bxApi = new BxApi();
        bxApi.call('GET', '/api/user/' + bxApi.username + '/season/' + seasonId, {
            output: 'full',
            include: 'categories,episodes,thumbnails,episodes__thumbnails,episodes__licensingWindows,episodes__streams__products',
            future: 'episodes__true'
        }).done(function(data) {
           var templateData = {};
            templateData['name'] = self.getTitle(data['vodSeason']['titles']);
            templateData['description'] = self.getDescription(data['vodSeason']['descriptions']).replace(regex, '');
            templateData['episodes'] = {};
           
            for (var i = 0; i < data['vodSeason']['episodes'].length; i++) {
                templateData['episodes'][i] = {};
                templateData['episodes'][i]['episodeNo'] = data['vodSeason']['episodes'][i]['episodeNumber'];
                templateData['episodes'][i]['id'] = data['vodSeason']['episodes'][i]['id'];
                templateData['episodes'][i]['name'] = self.getTitle(data['vodSeason']['episodes'][i]['titles']);
                templateData['episodes'][i]['description'] = self.getDescription(data['vodSeason']['episodes'][i]['descriptions']).replace(regex, '');
                templateData['episodes'][i]['peg'] = Math.min.apply(Math, data['vodSeason']['episodes'][i]['advisoryRatings']);
                templateData['episodes'][i]['duration'] = data['vodSeason']['episodes'][i]['duration'];
                templateData['episodes'][i]['progress'] = data['vodSeason']['episodes'][i]['playbackDuration'];
                templateData['episodes'][i]['progressPercent'] = (data['vodSeason']['episodes'][i]['playbackDuration'] * 100) / data['vodSeason']['episodes'][i]['duration'];
                templateData['episodes'][i]['availability'] = self.getAvailability(self.seasonPass.id, data['vodSeason']['episodes'][i]['licensingWindows']);
                templateData['episodes'][i]['available'] = self.isAvailable(templateData['episodes'][i]['availability']);
                templateData['episodes'][i]['isVisible'] = self.isAvailable(data['vodSeason']['episodes'][i]['visibilityStartTime']);
				templateData['episodes'][i]['visibilityStartTime'] = data['vodSeason']['episodes'][i]['visibilityStartTime'];
				templateData['episodes'][i]['visibilityEndTime'] = data['vodSeason']['episodes'][i]['visibilityEndTime'];

                for (var x = 0; x < data['vodSeason']['episodes'][i]['thumbnails']['images'].length; x++) {
                    if (data['vodSeason']['episodes'][i]['thumbnails']['images'][x]['type'] == 'thumbnail')
                       templateData['episodes'][i]['thumbnails'] = data['vodSeason']['episodes'][i]['thumbnails']['baseUrl'] + data['vodSeason']['episodes'][i]['thumbnails']['images'][x]['url'];
                }

                for (advisoryId in data['vodSeason']['episodes'][i]['advisoryRatings']) {
                    var advisoryRating = data['vodSeason']['episodes'][i]['advisoryRatings'][advisoryId];

                    if (templateData['episodes'][i]['advisoryRating'] == null || parseInt(advisoryRating) > parseInt(templateData['episodes'][i]['advisoryRating']))
                        templateData['episodes'][i]['advisoryRating'] = advisoryRating;
                }
                var licenses = self.getLicenseAvailability(data['vodSeason']['episodes'][i]['licensingWindows']);

                if (licenses[self.seasonPass.id]===false){
                	if(self.seasonPass.title=='SeriesPass')
                		templateData['episodes'][i]['subscriptionType'] = 'SERIES PASS';
                	else if(self.seasonPass.title=='Selection')
                		templateData['episodes'][i]['subscriptionType'] = 'SELECTION';
                }
            }
         var template = Ott.prototype.getTemplate('episodes', function (template) {
               callback(template.render({ season: templateData, isLogged: isLogged })); 
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    /*
    *   Get all the informations about a single episode identified by its id
    */
    Ott.prototype.getEpisodeProductInfo = function (episodeId, callback) {
        var self = this;
        var bxApi = new BxApi();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/vod/' + episodeId, {
            output: 'full',
            include: 'streams__products,categories,thumbnails,licensingWindows'
        }).done(function(data) {
            var templateData = {};
            var thumbnailId = data['vodProgram']['thumbnails']['images'].map(function(x) {return x.type; }).indexOf('thumbnail');
            var playUrl = null;

            self.episodeData[episodeId] = {
                id: episodeId,
                title: self.getTitle(data['vodProgram']['titles']),
                description: self.getDescription(data['vodProgram']['descriptions']),
                duration: data['vodProgram']['duration'],
                playbackDuration: data['vodProgram']['playbackDuration'],
                thumbnail: thumbnailId != -1 ? data['vodProgram']['thumbnails']['baseUrl'] + '' + data['vodProgram']['thumbnails']['images'][thumbnailId]['url'] : ''
            };
            

            templateData['epName'] = self.getTitle(data['vodProgram']['titles']);
            templateData['epiNumber'] = data['vodProgram']['episodeNumber'];
            templateData['epiduration'] = data['vodProgram']['duration'];
            templateData['tooltip'] = false;
            templateData['price'] = -1;
            templateData['isFree'] = false;
            templateData['available'] = false;
            templateData['availability'] = null;
            templateData['loaned'] = false;
            templateData['seriePass'] = false;
            templateData['selection'] = false;
            templateData['isUserAuthorized'] = false;
            templateData['tvodProductId'] = null;
            templateData['duration'] = data['vodProgram']['duration'];
            templateData['availability'] = self.getAvailability(self.userLicenceProductId, data['vodProgram']['licensingWindows']);
            templateData['available'] = self.isAvailable(templateData['availability']);
            templateData['isVisible'] = self.isAvailable(data['vodProgram']['visibilityStartTime']);
            templateData['visibilityStartTime'] = self.isAvailable(data['vodProgram']['visibilityStartTime']);
            templateData['visibilityEndTime'] = self.isAvailable(data['vodProgram']['visibilityEndTime']);

            var licenses = self.getLicenseAvailability(data['vodProgram']['licensingWindows']);

            for (streamId in data['vodProgram']['streams']) {
                var stream = data['vodProgram']['streams'][streamId];
                if (stream.isUserAuthorized == true) {
                    playUrl = stream.url;
                    templateData['isUserAuthorized'] = true;
                }

                for (productId in stream.products) {
                    var product = stream.products[productId];
                    if (product.isPremium == false)
                        templateData['isFree'] = true;
                    if (product.type.toUpperCase() == 'SVOD') {
                        if (product.title == 'SeriesPass' && licenses[product.id] == true) {
                            templateData['seriePass'] = true;
                            templateData['seriePassPrice'] = product.price;
                        }
                        else if (product.title == 'Selection' && licenses[product.id] == true) {
                            templateData['selection'] = true;
                            templateData['selectionPrice'] = product.price;
                        }
                    }
                    else if (product.type.toUpperCase() == 'TVOD' && licenses[product.id] == true) {
                        templateData['price'] = product.price;
                        templateData['availability'] = self.getAvailability(product.id, data['vodProgram']['licensingWindows']);
                        templateData['available'] = self.isAvailable(templateData['availability']);
                        
                        templateData['tvodProductId'] = product.id;
                        if (product.isUserAuthorized && product.isPremium == true)
                            {
                        	templateData['loaned'] = true;
                        	}
                    }
                }
            }
            
            if(navigator.userAgent.match(/BM-NATIVE-APP/i)){           	
            	templateData['tooltip'] = false;           	
            }
            else{
            	 templateData['tooltip'] = true;
            }

            Ott.prototype.getTemplate('episode-product-info', function (template) {
                callback(template.render({ episode: templateData }), templateData, playUrl);
            });
        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
        });
    };

    Ott.prototype.setEpisodePlayback = function (episodeId, action, playbackDuration, callback, type) {
    	var appType = 'webui';
    	
    	if (navigator.userAgent.match(/BM-NATIVE-APP Android/i))
    		appType = 'Android';
    	
    	else if(navigator.platform.toUpperCase() == 'IPHONE' || navigator.platform.toUpperCase() == 'IPAD')
    		appType = 'iOS';
    	
        if (isLogged == true) {
            var bxApi = new BxApi();
            type = type || 'vod';
            
            bxApi.call('POST', '/api/user/' + bxApi.username + '/'+ type +'/' + episodeId + '/playback', {
                action: action,
                app: appType,
                ver: webui_v,
                platform: BrowserDetect.browser,
                os_ver: BrowserDetect.version,
                playback_duration: playbackDuration
            }).done(function() {
                callback();
            }).fail(function(err) {
                if (err[2] == 'Unauthorized') {
                    bxApi.username = 'guest';
                    bxApi.password = '';
                    eraseCookie('userId');
                    eraseCookie('username');
                    eraseCookie('usid');
                    window.location.assign(rootUrl);
                }
            });
        }
    };

    Ott.prototype.getTitle = function (titles) {
        var title = '';
        var titleType = null;

        for (titleId in titles) {
            if (titles[titleId].value.length > 0 && titleType != 'TitleLong') {
                title = titles[titleId].value;
                titleType = titles[titleId].type;
            }
        }

        return title;
    };

    Ott.prototype.getDescription = function (descriptions) {
        var description = "";
        var descriptionType = null;

        for (descriptionId in descriptions) {
            if (descriptions[descriptionId].value.length > 0 && descriptionType != "SummaryLong") {
                description = descriptions[descriptionId].value;
                descriptionType = descriptions[descriptionId].type;
            }
        }

        return description;
    };

    Ott.prototype.getAvailability = function (productId, licensingWindows) {
        var availability = null;
		
        for (licensingWindowsId in licensingWindows) {
            var licensingWindow = licensingWindows[licensingWindowsId];
            
            if( productId != undefined && licensingWindow.productId == productId ) {
				availability = licensingWindow['licensingStartTime'];
				break;
			}
            
            if( licensingWindow['licensingStartTime'] == "" )
				licensingWindow['licensingStartTime'] = "1970-01-01 00:00:00";
            if( licensingWindow['licensingEndTime'] == "" )
				licensingWindow['licensingEndTime'] = "2038-01-01 00:00:00";
			
            var end = new moment(licensingWindow['licensingEndTime']);
            var now = new moment();

            if ((end - now) > 0) {
                if (availability == null)
                    availability = licensingWindow['licensingStartTime'];
                else {
                    var availabilityDate = new moment(availability);
                    var start = new moment(licensingWindow['licensingStartTime']);

                    if ((start - availabilityDate) < 0)
                        availability = licensingWindow['licensingStartTime'];
                }
            }
        }

        return availability;
    };

    Ott.prototype.isAvailable = function (availability) {
        var available = false;

        var now = new moment();
        var start = new moment(availability);

        if (availability != null && (start - now) < 0)
            available = true;

        return available;
    };

    Ott.prototype.getLicenseAvailability = function (licensingWindows) {
        var licenses = {};

        for (licensingWindowsId in licensingWindows) {
            var licensingWindow = licensingWindows[licensingWindowsId];
            var availability = false;
            var now = new moment();
            var start = new moment(licensingWindow['licensingStartTime']);
            var end = new moment(licensingWindow['licensingEndTime']);

            if ((start - now) < 0 && (end - now) > 0)
                availability = true;

            licenses[licensingWindow.productId] = availability;
        }

        return licenses;
    };

    Ott.prototype.getLastWatched = function (episodes) {
        var self = this;
        var lastWatched = null;
        var lastWatchedDate = null;
        var isUserAuthorized;

        for (episodeId in episodes) {
            var episode = episodes[episodeId];
            isUserAuthorized = false;
            if (episode.lastWatched.length > 0) {
            	for(streamId in episode.streams)
            		{            	
            			if(episode.streams[streamId].isUserAuthorized == true){
            				isUserAuthorized = episode.streams[streamId].isUserAuthorized;
            			}
            		} 
                if (isUserAuthorized == true) {
                    if (lastWatched == null) {
                        lastWatched = episode;
                        lastWatchedDate = episode.lastWatched;
                    }
                    else {
                        var a = new moment(lastWatchedDate);
                        var b = new moment(episode.lastWatched);

                        if ((b - a) > 0) {
                            lastWatched = episode;
                            lastWatchedDate = episode.lastWatched;
                        }
                    }
                }
            }
        }

        return lastWatched;
    };

    Ott.prototype.getUserEmail = function (callback)
    {
        var bxApi = new BxApi();
        callback(bxApi.username);
    };

    Ott.prototype.sendCancelEmailToUser = function () {
        
        var bxApi = new BxApi();

        message = "Votre abonnement a été annulé avec succès.";
        
        self.sendEmail(bxApi.username, 'Résiliation de votre formule d’abonnement', message, function (res) {
            //console.log(res);
        });
    };

    Ott.prototype.sendCancelEmailToAdmin = function () {

        var bxApi = new BxApi();

        message = "Demande d'annulation de l'utilisateur.\n Email: " + bxApi.username + "";
        
        self.sendEmail(adminEmail, 'Demande d\'annulation', message, function (res) {
            //console.log(res);
        });

    };

    Ott.prototype.minutesPiChart = function drawPieChart( element, total, fill, chart, width, height ) {
    	
    	
    	if( fill >= total )
    		fill = total-1;			//-1 is required to show the pie filled completely. otherwise pie chart hides
    		
    	
    	//we need to show fill area inside the total and not as separate segment
    	//hence we need to remove fill segment part from the total
    	//this fixes our playback duration ratio in pie chart
    	total -= fill;
    	
    	//Get context with jQuery - using jQuery's .get() method.
    	var ctx = $(element).get(0).getContext("2d");
    	ctx.scale(1, 1);
    	
    	if (width)
    		$(element).attr('width', width);
    	if (height)
    		$(element).attr('height', height);
    	
    	if( chart == undefined )
    		chart = new Chart(ctx);
    		
    	//This will get the first returned node in the jQuery collection.
    	chart.Pie([
    		{ value: fill, color: '#D2181E' },	//fill to be shown as highlighted area
    		{ value: total, color: 'white' }		//total length of the program to be shown as grey area
    	], {segmentShowStroke:false, animation:false});
    	
    	return chart;
    };
    
    Ott.prototype.sendEmail = function (sendTo, subject, message, callback) {
        var self = this;
        var bxApi = new BxApi();

        bxApi.call('POST', '/api/server/email', {
            to: sendTo,
            subject: subject,
            body: message
        }).done(function(data) {

            callback('success');

        }).fail(function(err) {
            if (err[2] == 'Unauthorized') {
                bxApi.username = 'guest';
                bxApi.password = '';
                eraseCookie('userId');
                eraseCookie('username');
                eraseCookie('usid');
                window.location.assign(rootUrl);
            }
            callback(err);
        });
    }

	Ott.prototype.isBrowserCompatible = function() {
		var compatible = true;
		
		//we perform browser compatibility checks here with ticket ref #2453
		switch( BrowserDetect.OS ) {
			case 'Linux':
			case 'Mac':
				if( BrowserDetect.browser != 'Chrome' ) {
					
					$("#modal-install-chrome").toggleClass('is-visible');
			        $('body').toggleClass('modal-show');
					$("#modal-install-chrome .modal-close").click(function(){
						$("#modal-install-chrome").removeClass('is-visible');
						$('body').removeClass('modal-show');	
					});
					window.scrollTo(0, 0);
					compatible = false;
				}
				break;
				
			 case 'Windows':	
	                if( navigator.userAgent.indexOf("Windows NT 6.1") != -1 ) {    //Win7
	                    if( BrowserDetect.browser != 'Chrome' ) {
                       $("#modal-install-chrome").toggleClass('is-visible');		
	                        $('body').toggleClass('modal-show');		
	                        $("#modal-install-chrome .modal-close").click(function(){
	                            $("#modal-install-chrome").removeClass('is-visible');
	                            $('body').removeClass('modal-show');	                            
	                        });
	                        window.scrollTo(0, 0);
	                        compatible = false;
	                    }
	                }
	                if( navigator.userAgent.indexOf("Windows NT 6.3") != -1  ) {    //Win8.1		
	                    if( BrowserDetect.browser != 'Chrome' && BrowserDetect.browser != 'IE11' ) {	
	                        $("#modal-install-chrome-ie").toggleClass('is-visible');
	                        $('body').toggleClass('modal-show');
	                        $("#modal-install-chrome-ie .modal-close").click(function(){
	                            $("#modal-install-chrome-ie").removeClass('is-visible');
	                            $('body').removeClass('modal-show');
	                        });
	                        window.scrollTo(0, 0);
	                        compatible = false;
	                    }
	                }
		
	                break;
			case 'iPhone/iPod':
			case 'iPad':
			case 'Android':
				if (!navigator.userAgent.match(/BM-NATIVE-APP/i)) {	
					$("#modal-download-app").toggleClass('is-visible');
			        $('body').toggleClass('modal-show');
					$("#modal-download-app .modal-close").click(function(){
						$("#modal-download-app").removeClass('is-visible');
						$('body').removeClass('modal-show');
					});
					window.scrollTo(0, 0);
					compatible = false;
				}
				
				break;
				
			default: 
				compatible = true;
				break;
			
		}
		
		return compatible;
	}
	
	Ott.prototype.setGtmUserVariables = function(event , UID ,birthYear, zip, callback) {
		var credit = '';
		var bxApi = new BxApi();
        bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet', {})
        .done(function(data) {
			credit = data['wallets'][0]['amount'];
			dataLayer.push({'event': event , 'memberId': UID , 'birthYear': birthYear, 'zipCode':zip, 'remainingEwalletCredit': parseFloat(credit) , 'subscriptionDuration' : 'monthly'});
			callback();
		})
		.fail(function(){
			dataLayer.push({'event': event , 'memberId': UID ,  'birthYear': birthYear, 'zipCode':zip, 'remainingEwalletCredit': parseFloat(credit) , 'subscriptionDuration' : 'monthly'});
			callback();
		});
	}
	
	Ott.prototype.setGtmTxVariables = function(category) {
		var url = purl( location.href );
		var event = 'ecommerce';
		if (category == 'Subscription')
		{ 
		   if(url.param('product_id')=='56')
				var name = 'RTL Series Pass';
		   else if(url.param('product_id')=='57')
				var name = 'RTL Selection';
		   else if(url.param('product_id')=='58')
				var name = 'RTL Bundle';
		   else var name = '';
		   window.dataLayer = window.dataLayer || [] ;
		   dataLayer.push({
			   'event': event,
			   'transactionId': url.param('order_id') ? url.param('order_id') : '',
			   'transactionTotal': url.param('amount') ? parseFloat(url.param('amount')) : '',
			   'transactionCurrency': url.param('currency') ? url.param('currency') : '',
			   'transactionCoupon': '',
			   'transactionCouponValue': '',
			   'subscriptionDuration': 'monthly',
			   'transactionProducts': [{
					'name': name,
					'sku': url.param('product_id') ? url.param('product_id') : '',
					'category': category,
					'price': url.param('amount') ? parseFloat(url.param('amount')) : '',
					'quantity': 1
				}]
		   });
		}
		else if (category == 'E-wallet')
		{
			var price ='';
			var currency = '';
			var credit = '';
			var name = '';
			function setDataLayer(){
				window.dataLayer = window.dataLayer || [] ;
				dataLayer.push({
			   'event': event,
			   'transactionId': url.param('transaction_id') ? url.param('transaction_id') : '',
			   'transactionTotal': parseFloat(price),
			   'transactionCurrency': currency,
			   'transactionCoupon': '',
			   'transactionCouponValue': '',
			   'remainingEwalletCredit': credit,
			   'transactionProducts': [{
					'name': name,
					'sku': url.param('product_id') ? url.param('product_id') : '',
					'category': category,
					'price': parseFloat(price),
					'quantity': 1
				}]
				});
			}
			var bxApi = new BxApi();
			bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet/' + url.param('wallet_id') + '/transaction/' + url.param('transaction_id'), {})
			.done(function(data1){
				name = data1.transaction.amount + ' credits';
				var txObj = JSON.parse(data1.transaction.data);
				price = txObj.amount;
				currency = txObj.currency;
				bxApi.call('GET', '/api/user/' + bxApi.username + '/wallet', {})
				.done(function(data2){
					credit = data2['wallets'][0]['amount'];
					setDataLayer();
				});
			})
			.fail(function(){
				setDataLayer();
			});	
		}
	}

    Ott.prototype.checkAlloService = function(id) {
        var bxApi = new BxApi();
        var serviceId = id;
        return bxApi.call('GET', '/api/user/'+bxApi.username+'/service/'+serviceId)
        .done(function(data){
        	if(data.service != null){
            	var serviceName = data.service.serviceName;
            	if(serviceName.toUpperCase() == 'ALLO RTL')
            		userAllo = true
            		
            	else if(serviceName.toUpperCase() == 'ALLO RTL PREMIUM')
            		userRop = true;
            	
            	else if(serviceName.toUpperCase() == 'BASE PREMIUM')
            		userBase = true;

            	}
        });
    }

    Ott.prototype.hasLiveTvPromotionalLicense = function() {
        var bxApi = new BxApi();
        var serviceId = '1';
        var dfd = $.Deferred();

        bxApi.call('GET', '/api/user/' + bxApi.username + '/license', {
            payment_method: 'all',
            status: 'active'
        })
        .fail(function(xhr, status, errorThrown){
            dfd.reject(false);
        })
        .done(function(data){
            $.each( data.license.licenseList.licenses, function(index, value){
                if( value.product.type == "PROMOTIONAL" && value.product.title == "3 Live Channels" ) {
                    dfd.resolve(true);
                }
            })
        });

        return dfd.promise();
    }

	if( self.isLogged() && self.isNative() ) {
		self.getServices(function (service){
			var Id = service.service.serviceId;
		self.checkAlloService(Id)
        .done(function(allo){
			$(".live-channel-link").show();
			});
		});
	}
};


if (navigator.userAgent.match(/BM-NATIVE-APP/i)) {
	createCookie('cookieVerif', true, 99);
}


function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}


