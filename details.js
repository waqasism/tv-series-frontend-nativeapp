var ott;
var tabuId;
var seasonTitle;
var videoCategory;
var episodeTitle;
var episodeNumber;
var showTitle;
var episodeDuration;

$(document).ready(function () {
    ott = new Ott();
    var seasonId = window.location.href.split('?')[1].split('=')[1];

	twig({ href: 'connection/header.html', load: function(template){
		document.querySelector("header").outerHTML = template.render({ baseUrl: ott.RootUrl });
		
		if (ott.isLogged()) {
			$('.connected').show();
			$('.not-connected').remove();
		}
		else {
			$('.not-connected').show();
			$('.connected').remove();
		}
		
        slideInfinite();
        search();
        
	}});
	
	twig({ href: 'connection/footer.html', load: function(template){
		document.querySelector("footer").outerHTML = template.render({ baseUrl: ott.RootUrl, isNative: ott.isNative });
	}});
	
    $(document).mouseup(function (e)
    {
        var container = $("#tabs-container .custom-select");

        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            container.hide();
        }
    });

    ott.getShow(seasonId, function (showId, name, showName, template) {
        $('#show .saison-content').html(template);
        rat();
        $('.saison-rating img').click(function(){
        	dataLayer.push({'event': 'vote', 'seasonTitle': showName+" "+name});
    	});
        $('.add-liste').click(function () {
            var self = this;
            var favorite = $(self).data('favorite');

            ott.addToFavorite($(self).data('id'), favorite, function () {
                if (favorite == true) {
                	dataLayer.push({'event':'addToList', 'seasonTitle': showName+" "+name});
                    $(self).html('Retirer de ma liste');
                    $(self).data('favorite', false);
                }  
                else {
                    $(self).html('Ajouter à ma liste');
                    $(self).data('favorite', true);
                }
            });
        });

        showTitle =  showName; 
        seasonTitle = name;
        //$('.last-watched-play').click(playEpisode);
        //$('.survey-play').click(playEpisode);
		
		if( ott.isLogged() )
			ott.getUserLicenses(function(data){
				ott.userLicenceProductId = data['productId'];
				loadSeasons(showId, seasonId);
			});
		else
			loadSeasons(showId, seasonId);
    });
});

$(window).resize(function() {
    moveProgressBar();
});

function loadSeasons(showId, seasonId) {
    ott.getSeasons(showId, seasonId, function (template) {
        $('#tabs-container').html(template);
        ott.getRelatedSeasons(seasonId, function (template) {
            $('#related-seasons').html(template);
        });
        $('#tabs-container .episode-liste .episode-box').each(loadEpisodeData);
        openBox();
        readMore();

        $('#tabs-container .selected-season').click(function () {
            $(".episode-box").each(function () {
                $(".episode-box>.details-more").slideUp('fast');
                $(".episode-box >.episode-details >.episode-number").removeClass("active");
            });
            $('#tabs-container .custom-select').fadeIn();
        });


        $('#tabs-container .custom-select li').click(loadSeason);
    });
}

function loadSeason() {
    var tabId = $(this).data('season');
    tabuId = tabId;
    $('#tabs-container .custom-select .selected').removeClass('selected');
    $(this).addClass('selected');
    $('#tabs-container .selected-season').text($(this).text());
    $('#tabs-container .custom-select').fadeOut();

    ott.getShow(tabId, function (showId, name, showName, template) {
        $('#show .saison-content').html(template);
        rat();
        $('.add-liste').click(function () {
            var self = this;
            var favorite = $(self).data('favorite');

            ott.addToFavorite($(self).data('id'), favorite, function () {
                if (favorite == true) {
                    $(self).html('Retirer de ma liste');
                    $(self).data('favorite', false);
                }  
                else {
                    $(self).html('Ajouter à ma liste');
                    $(self).data('favorite', true);
                }
            });
        });

        //$('.last-watched-play').click(playEpisode);
        //$('.survey-play').click(playEpisode);
    });

    ott.getEpisodes(tabId, function (template) {
        $('#tabs-container #main_content').html(template);
        ott.getRelatedSeasons(tabId, function (template) {
            $('#related-seasons').html(template);
        });
        $('#tabs-container .episode-liste .episode-box').each(loadEpisodeData);
        openBox();
        readMore();
    });
}

function loadEpisodeData() {
    var episodeId = $(this).data('id');
    ott.getEpisodeProductInfo(episodeId, function (template, data, playUrl) {
        var episode = $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]');
        $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .episode-statut').html(template);
        $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('available', data['available']);
        episode.data('price', data['price']);
        episode.data('name', data['epName']);
        episode.data('epiNumber', data['epiNumber']);
        episode.data('epiduration', data['epiduration']);
        moveProgressBar();

        if (data['available'] == true) {
            if (data['seriePass'] == true) {
                $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .details-more .episode-avai.rsp').show();
                $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('seriePass', true);
                $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('subscription-price', data['seriePassPrice']);
            }
            else if (data['selection'] == true){
                $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .details-more .episode-avai.slc').show();
                $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('selection', true);
                $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('subscription-price', data['selectionPrice']);
            }

            if (data['loaned']) {
                ott.getProductLicenseInfo(data['tvodProductId'], function (expiry) {
                	if(expiry != null)
                	{
                		if(expiry > 0){
                		$('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .details-more .episode-avai.war').html('Il vous reste ' + expiry + ' heures pour visionner cette vidéo');
                		$('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .details-more .episode-avai.war').show();
                		}
                		else $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .details-more .episode-avai.war').hide();               	
                	}
                });
                
            }
        }
		$('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('isUserAuthorized', data['isUserAuthorized']);
		$('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('tvodProductId', data['tvodProductId']);      
        
        $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .details-more .episode-min .survey-play').unbind("click").click(playEpisode);
        $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .episode-details .episode-play').unbind("click").click(playEpisode);
        $('.survey > .survey-play[data-id="'+ episodeId +'"]').click(playEpisode).show();
        $('.last-watched-play[data-id="'+ episodeId +'"]').click(playEpisode).show();

        if (data['isUserAuthorized'] == true) {
            var pictureUrl = $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .details-more .episode-min img').attr('src');

            $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('video', playUrl);
            $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"]').data('thumbnail', pictureUrl);
        }
    });
}

function playEpisode(e) {
	videoCategory = sessionStorage.getItem('videoCategory');
	
    var self = this;
    var episode = $('.episode-box[data-id="' +  $(self).data('id') + '"]');

    episodeTitle = episode.data('name');
    episodeNumber = episode.data('epiNumber');
    episodeDuration = episode.data('epiduration');
    e.preventDefault();
	
    window.epiId = $(self).data('id');
    //we perform browser compatibility checks here with ticket ref #2453
    if( !ott.isBrowserCompatible() )
		return;
	
    if (ott.isLogged() && episode.data('isUserAuthorized') == true) {
        window.scrollTo(0, 0);

        $(".episode-play").removeClass("active");
        $(self).addClass("active")

        $.get(episode.data('video'), function (data) {
            if (navigator.userAgent.match(/BM-NATIVE-APP/i)){
            	if(userAllo == true || userRop == true){
            		ott.getServices(function (service){
                    	var serviceId = service.service.serviceId;
                    		ott.getPackageDetails(serviceId, function(reMinutes){
                    			data.remainingMinutes = reMinutes;
                    			dataLayer.push({'event':'video', 'action':'launch', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': 'n/a', 'videoDuration': episodeDuration});
                    			loadNativePlayer($(self).data('id'), data);           		
            			});
            		});
            	}
            	else{       		
            		data.remainingMinutes = 50000;
            		dataLayer.push({'event':'video', 'action':'launch', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': 'n/a', 'videoDuration': episodeDuration});
            		loadNativePlayer($(self).data('id'), data);
            	}
            }
            else
                loadPlayer($(self).data('id'), data);
        });
    }
    else if (ott.isLogged() && episode.data('isUserAuthorized') == false)
        episodeModal(episode);
    else {
		window.scrollTo(0,100);
        $('#modal-connection').toggleClass('is-visible');
        $('body').toggleClass('modal-show');
        $('#modal-connection .modal-close, #modal-connection modal-overlay').click(function() {
            $('#modal-connection').removeClass('is-visible');
            $('body').removeClass('modal-show');
        });
		var body = $("html, body");
		body.stop().animate({scrollTop:0}, '500', 'swing');
    }
}

function moveProgressBar() {
    $('.progress-wrap').each(function() {
        var getPercent = ($(this).data('progress-percent') / 100);
        var getProgressWrapWidth = $(this).width();
        var progressTotal = getPercent * getProgressWrapWidth;
        var animationLength = 1500;
        $('>.progress-bar',this).stop().animate({
            left: progressTotal
        }, animationLength);
    });
}
	

function openBox() {
    var episode = $(".episode-box");
    $('.episode-play ,.episode-min ,.readMore').click(function (e) {
        e.stopPropagation();
    });
    $(episode).click(function() {
        $(">.details-more",this ).slideToggle();
        $(">.episode-details >.episode-number",this ).toggleClass("active");
    });

}

function episodeModal(episode) {
	
	$('.modal-box.subscription .big-link').click(function(){
		dataLayer.push({'event': 'clickToBuy', 'seasonTitle': seasonTitle, 'episodeTitle':episode.data('name'), 'linkTarget':'Click to subscription'});
	});
	$('.modal-box.location .big-link').click(function(){
		dataLayer.push({'event': 'clickToBuy', 'seasonTitle': seasonTitle, 'episodeTitle':episode.data('name'), 'linkTarget':'Click to recharge e-wallet'});
	});
	
    var price = episode.data('price');
    var tvodProductId = episode.data('tvodProductId');
    var seriePass = episode.data('seriePass');
    var selection = episode.data('selection');
    var subscriptionPrice = episode.data('subscription-price');

    window.scrollTo(0, 0);

    $('#modal-tvod .modal-box.location').hide();
    $('#modal-tvod .modal-box.subscription').hide();
    $('#modal-tvod .modal-box.subscription .rtl-selection-modal').hide();
    $('#modal-tvod .modal-box.subscription .rtl-pass-modal').hide();
    if(navigator.userAgent.match(/BM-NATIVE-APP/i)){
    	$('.small-link').show();
    }
    else{
    	$('.big-link').show();
    }
    if (selection == true) {
        $('#modal-tvod .modal-box.subscription .subscription-price').html(subscriptionPrice);
        $('#modal-tvod .modal-box.subscription').show();
        $('#modal-tvod .modal-box.subscription .rtl-selection-modal').show();
    }
    else if (seriePass == true) {
        $('#modal-tvod .modal-box.subscription .subscription-price').html(subscriptionPrice);
        $('#modal-tvod .modal-box.subscription').show();
        $('#modal-tvod .modal-box.subscription .rtl-pass-modal').show();
    } 	
    
    if (price >= 0) {
    
        $('#modal-tvod .modal-box .loca .vod-price').html(price);
        $('#modal-tvod .modal-box.location').show();    
    }


    if (price < 0 && selection != true && seriePass != true)
        $('#modal-tvod .modal-box.not-available').show();

    $('#modal-tvod').toggleClass('is-visible');
    $('body').toggleClass('modal-show');
    $('#modal-tvod .modal-close, #modal-tvod modal-overlay').click(function() {
        $('#modal-tvod').removeClass('is-visible');
        $('body').removeClass('modal-show');
    });

    ott.getUserData('userToken', function (template, credits, walletId) {
 	
        $('#modal-tvod .modal-data .data-money').html(credits + '&nbsp;<img src="assets/images/credit.png" alt="credit"/>');
        $('#modal-tvod .modal-box .conf .next').data('walletId', walletId);
        $('#modal-tvod .modal-box .conf .next').data('tvodProductId', tvodProductId);
        if (credits < price) {
        	$("#modal-tvod .play-loc").click(function () {
        		$("#less-credit").fadeOut(60);
                setTimeout(function() {
                    $("#less-credit").fadeIn();
                }, 100);
        		
        	});
        }
        else
            confirm();
            $('#modal-tvod .modal-box .conf .next').click(function () {
                $('#modal-tvod .modal-box.location').hide();
                $('#modal-tvod .modal-loader').show();
                ott.purchaseVOD($(this).data('tvodProductId'),  $(this).data('walletId'), function () {
                	if( tabuId )
	                	window.location.href = "details.html?season="+tabuId;                   
	                else
						window.location.reload();
                });
            });
        
    });
}

function rat() {
    var score = $('.saison-rating').data('rating');
    var userScore = $('.saison-rating').data('user-rating');
    var stars = { starHalf: 'star-half.png', starOn: 'star-on.png' }
    var ott = new Ott();

    if (userScore > 0) {
        stars = { starHalf: 'star-Y-half.png', starOn: 'star-Y-on.png' }
        score = userScore;
    }

    $('.saison-rating').raty({
        path: 'assets/images',
        half: true,
        score: score,
        starOff: 'star-off.png',
        starHalf: stars.starHalf,
        starOn: stars.starOn,
        mouseover: function(score, event){
        	event.target.title = ''; 
        	},
        click: function (rating) {
            $('.saison-rating').raty('set', { starHalf: 'star-Y-half.png' });
            $('.saison-rating').raty('set', { starOn: 'star-Y-on.png' });

            ott.rateSeason($(this).data('season-id'), rating, function () {
                if ($('.saison-rating').data('user-rating') == 0) {
                    $('.saison-rating').data('user-rating', rating);
                    var raters = parseInt($('.saison-global > span').text()) + 1;
                    $('.saison-global > span').text(raters);
                }
            });
        }
    });
}


function confirm() {
    $("#modal-tvod .play-loc").click(function () {
        $("#modal-tvod .modal-box .loca").fadeOut(200);
        setTimeout(function() {
            $("#modal-tvod .modal-box .conf").fadeIn();
        }, 800);

    });
    $("#modal-tvod .back").click(function () {
        $("#modal-tvod .modal-box .conf").fadeOut(200);
        setTimeout(function() {
            $("#modal-tvod .modal-box .loca").fadeIn();
        }, 800);
    });
}

function readMore() {
    var showChar = 200;
    var ellipsestext = "...";
    var moretext = "en savoir plus";
    var lesstext = "réduire";

    $('.more').each(function () {
        var content = $(this).html();

        if (content.length > showChar) {
            var c = content.substr(0, showChar);
            var h = content.substr(showChar, content.length - showChar);
            var html = c + '<span class="moreellipses">' + ellipsestext + '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink readMore">' + moretext + '</a></span>';
            $(this).html(html);
        }
        else {

        }
    });

    $(".morelink").click(function () {
        if ($(this).hasClass("less")) {
            $(this).removeClass("less");
            $(this).html(moretext);
        } else {
            $(this).addClass("less");
            $(this).html(lesstext);
        }
        $(this).parent().prev().toggle();
        $(this).parent().parent().toggleClass("readingMore");
        $(this).prev().toggle();
        return false;
    });
}

