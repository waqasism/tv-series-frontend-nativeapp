var timeout = null;

function viewAll(categoryId) {
     $( "#view-all"+categoryId ).click(function(settings) {
         if(isMobile.any){
             $('#makeMeScrollable'+categoryId+' .scrollWrapper').kinetic('new_stop');
         }

               var cur =$(this).parent(),
               curdiv = $(  ">.makeMeScrollable",cur)

         $( curdiv).toggleClass("more");
         $(this).toggleClass('active');
         if($( curdiv ).hasClass( "more" )){
             $(curdiv).smoothDivScroll("disable");
         }
         else{
             $( curdiv).smoothDivScroll("enable");
         }
     });
}

$.preload = function () {
    var imgs = Object.prototype.toString.call(arguments[0]) === '[object Array]'
        ? arguments[0] : arguments;

    var tmp = [];
    var i = imgs.length;
    for (; i--;) tmp.push($('<img />').attr('src', imgs[i]));
};

function search() {
    $(".search-min .search-big").click(function () {
        $(".search-min input").toggleClass('search_select');
        $(".search-min a , .logo , .connect, .channel-header").queue(function() {
            $( this ).toggleClass('search-select');
            $( this ).dequeue();

        })
    });

    if ($('#search-container').length <= 0) {

        $('.search input, .search-min input').bind("change input paste", function(event) {
            var ott = new Ott();
            var value = $(this).val();
            var timeout = null;

            if (value.length >= 3) {
                if (timeout)
                    clearTimeout(timeout);

                var timeout = setTimeout(function() {
                    ott.search(value, function (template) {
                        $('#container').html(template);
                        if (isMobile.any) {
                            noHover();
                        }
                        else {
                            tool('#research span a');
                        }
                    });
                }, 500);
            }
        });
    }
}

function slideInfinite() {
    $(".slide-panel").mouseover(function() {
        $(".discover").addClass("sd")
        $(".panel").stop().slideDown("slow");
    })
    .mouseout(function() {
        $(".panel").stop().slideUp("fast")
        $(".discover").removeClass("sd");
    });
 };



$(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
        $(".discover").css("height","10px");
    }
    else {
        $(".discover").css("height","28px");
    }
    
    return false
});

function subinfo() {
    $( '.box-subs-info ,.subs-closed').click(function(e) {
        e.stopPropagation();
    });
    $( ".box-subs-info" ).click(function() {
        var cor =$(this).parent()
        $(">.box-subs-det",cor).fadeToggle();
        $(this).hide();

    });$( ".subs-closed" ).click(function() {
        var cor =$(this).parent(),
            car = cor.parent()
        $(cor).fadeToggle();
        $(">.box-subs-info",car).show();

    });

}
function noHover() {
    $('div.scrollableArea span a.no-hover, #research  span a.no-hover').removeClass('no-hover')
}


function tool(divs) {
    var ott = new Ott();
    var loader = '<div class="spinner"><div class="spinner-container container1"> <div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container2"> <div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container3"> <div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div></div>'
    
    if (!divs)
        divs = '.scrollableArea a';

    $(divs).tooltipster ({
        animation :  'fade' ,
        delay :  1000 ,
        position: 'right',
        content: loader,
        offsetY : -80,
        contentAsHTML : true,
        touchDevices :  false ,
        trigger :  'hover',
        interactive: true,
        functionBefore: function(origin, continueTooltip) {
            continueTooltip();
            
            if (origin.data('ajax') !== 'cached') {
                var seasonId = $(this).parent('span').data('id');
                
                ott.getTooltip(seasonId, function (template) {
                    origin.tooltipster('content', template).data('ajax', 'cached');
                    $('.tooltipster-content .add-liste').click(function () {
                        var self = this;
                        var favorite = $(self).data('favorite');

                        ott.addToFavorite($(self).data('id'), favorite, function () {
                            ott.getFavorite(function (favorites) {
                                $('#liste .content-liste .box-liste[data-id="favorite"]').remove();
                                $('#liste .content-liste').prepend(favorites);

                                if (isMobile.any) {
                                    var imgs = $('div#makeMeScrollablefavorite img');
                                    if ($(imgs[0]).width() <= 110) {
                                        if ($("body").width() <= 440) {
                                            imgWidth = 110
                                        }
                                        else {
                                            imgWidth = 142
                                        }
                                    }
                                    else
                                        imgWidth = $(imgs[0]).width()
                                    $('div#makeMeScrollablefavorite').smoothDivScroll({
                                        touchScrolling: true,
                                        hotSpotScrolling: false,
                                        mousewheelScrolling: "",
                                        manualContinuousScrolling: true,
                                        visibleHotSpotBackgrounds: "hover",
                                        easingAfterHotSpotScrolling: false,
                                        imgWidth: imgWidth
                                    });

                                    $('div#makeMeScrollablefavorite').smoothDivScroll('emulateOnLoad');
                                    noHover();
                                }
                                else {
                                    var imgs = $('div#makeMeScrollablefavorite img');

                                    if ($(imgs[0]).width() <= 110)
                                        imgWidth = 142;
                                    else
                                        imgWidth = $(imgs[0]).width()

                                    $('div#makeMeScrollablefavorite').smoothDivScroll({
                                        manualContinuousScrolling: true,
                                        mousewheelScrolling: "",
                                        visibleHotSpotBackgrounds: "hover",
                                        easingAfterHotSpotScrolling: false,
                                        imgWidth: imgWidth
                                    });

                                    $('div#makeMeScrollablefavorite').smoothDivScroll('emulateOnLoad');
                                    tool();
                                }
                            });

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
                });
            }
        }
    });
}

function select() {
    $(".box-subs:not(.acq) , .box-exclu:not(.acq)  , .box-reload").click(function() {
        $(".box-subs:not(.acq) ,.box-exclu:not(.acq) , .box-reload").each(function(){
            $(this).removeClass("selected");
        });
        $(this).addClass("selected");
        $(".subs button,.reload button").addClass("selected");
    });
}

function retina() {
    if (isMobile.any) {
        $('img.ret').each(function () {
            var img = $(this);
            img.attr('src', img.attr('src').replace('.', '@2x.'));
        })
    }
}

//function modal() {
//    $('.modal-toggle').on('click', function (e) {
//        e.preventDefault();
//        document.location = "#mod";
//        $('.modal').toggleClass('is-visible');
//        $('body').toggleClass('modal-show');
//    });
//}

$.fn.mobileFix = function (options) {
    var $parent = $(this),
    $fixedElements = $(options.fixedElements);

    $(document)
    .on('focus', options.inputElements, function(e) {
        $parent.addClass(options.addClass);
    })
    .on('blur', options.inputElements, function(e) {
        $parent.removeClass(options.addClass);

        // Fix for some scenarios where you need to start scrolling
        setTimeout(function() {
            $(document).scrollTop($(document).scrollTop())
        }, 1);
    });

    return this; // Allowing chaining
};

$(document).ready(function(){
	// Only on touch devices
	if (isMobile.any) {
		$("body").mobileFix({ // Pass parent to apply to
			inputElements: "input,textarea", // Pass activation child elements i.e input,textarea,select
			addClass: "fixfixed" // Pass class name
		});
	}
});

$(document).ready(function () {
	//binding click event to login buttons
	$('.connect:not(.clickBound) , .connect-modal:not(.clickBound)').addClass('clickBound').on('click',  function(){
		var href = window.location.href;
		if(href.indexOf("me_connecter.html") == -1)
			sessionStorage.setItem('redirectUrl', href);
	});
});

/*
 * 
 * name: reportConsumedMinutes
 * send playback minutes consumption report to api. 
 * This function is executed after predefined time interval
 * @return void
 * 
 */
function reportConsumedMinutes() {
	if( !localStorage.AlloConsumedMinutes || isNaN( localStorage.AlloConsumedMinutes ) )
		return false;
	
	var minutes = parseInt( localStorage.AlloConsumedMinutes ),
		bxApi = new BxApi();
	
	if( minutes == 0 )
		return false;
	
	bxApi.call('POST', '/api/user/'+ bxApi.username +'/service/1/package/minutes', { mins: minutes })
	.done(function(){
		localStorage.AlloConsumedMinutes = 0;
	});
}

/*
 * 
 * name: logNativeConsumedMinutes
 * collect minutes consumed from native mobile apps and store locally.
 * @param int number of minutes consumed in user playback
 * @return bool false if provided value is not a number, true otherwise
 * 
 */
function logNativeConsumedMinutes(minutes) {
	if( isNaN(minutes) )
		return false;
	
	if(userAllo == false || userRop == false)
		return false;
	
	
	var consumedMinutes;
	
	if( !localStorage.AlloConsumedMinutes || isNaN( localStorage.AlloConsumedMinutes ) )
		consumedMinutes = 0;
	else
		consumedMinutes = minutes + parseInt( localStorage.AlloConsumedMinutes );
	
	localStorage.AlloConsumedMinutes = consumedMinutes;
	
	if( !$("body").data("minutesReportingInterval") )
		!$("body").data("minutesReportingInterval", setInterval( reportConsumedMinutes, consumedMinutesReportingInterval ));
	
	return true;
}
