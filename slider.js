var e;
var t;
var n = 6e3;
var s;

function r() {
    $(".slider-timer").clearQueue().finish();
    $(".slider-timer").animate({width: "0"}, 0);
    $(".slider-timer").animate({width: "100%"}, n)
}

function i() {
    r();
    var e = $(".item").index($(".item-actif"));
    if (e < t) {
        var n = $(".item").eq(e);
        $(".nav-li").eq(e).removeClass("nav-li-check");
        n.fadeOut(500, function () {
            n.removeClass("item-actif")
        });
        e++;
        var i = $(".item").eq(e);
        $(".nav-li").eq(e).addClass("nav-li-check");
        i.fadeIn(400, function () {
            i.addClass("item-actif")
        })
    } else {
        var n = $(".item").eq(e);
        $(".nav-li").eq(e).removeClass("nav-li-check");
        n.fadeOut(500, function () {
            n.removeClass("item-actif")
        });
        e = 0;
        var i = $(".item").eq(e);
        $(".nav-li").eq(e).addClass("nav-li-check");
        i.fadeIn(400, function () {
            i.addClass("item-actif")
        })
    }
}

function o() {
    window.clearTimeout(s);
    s = window.setInterval(i, n)
}

function u() {
    for (var t = 1; t <= e; t++) {
        $("#navs").append("<li class='nav-li'>" + t + "</li>")
    }
    $(".nav-li").on("click", function () {
        o();
        r();
        var e = $(this).index();
        $(".nav-li").removeClass("nav-li-check");
        var t = $(".item-actif");
        t.fadeOut(500, function () {
            t.removeClass("item-actif")
        });
        var n = $(".item").eq(e);
        $(this).addClass("nav-li-check");
        n.fadeIn(400, function () {
            n.addClass("item-actif")
        })
    })
}

function a() {
    var e = $(".item").index($(".item-actif"));
    $(".nav-li").eq(e).addClass("nav-li-check");
    var n = $("#nav-left");
    var i = $("#nav-right");
    i.on("click", function () {
        r();
        o();
        var e = $(".item").index($(".item-actif"));
        if (e < t) {
            var n = $(".item").eq(e);
            $(".nav-li").eq(e).removeClass("nav-li-check");
            n.fadeOut(500, function () {
                n.removeClass("item-actif")
            });
            e++;
            var i = $(".item").eq(e);
            $(".nav-li").eq(e).addClass("nav-li-check");
            i.fadeIn(400, function () {
                i.addClass("item-actif")
            })
        } else {
            var n = $(".item").eq(e);
            $(".nav-li").eq(e).removeClass("nav-li-check");
            n.fadeOut(500, function () {
                n.removeClass("item-actif")
            });
            e = 0;
            var i = $(".item").eq(e);
            $(".nav-li").eq(e).addClass("nav-li-check");
            i.fadeIn(400, function () {
                i.addClass("item-actif")
            })
        }
    });

    n.on("click", function () {
        r();
        o();
        var e = $(".item").index($(".item-actif"));
        if (e > 0) {
            var n = $(".item").eq(e);
            $(".nav-li").eq(e).removeClass("nav-li-check");
            n.fadeOut(500, function () {
                n.removeClass("item-actif")
            });
            e--;
            var i = $(".item").eq(e);
            $(".nav-li").eq(e).addClass("nav-li-check");
            i.fadeIn(400, function () {
                i.addClass("item-actif")
            })
        } else {
            var n = $(".item").eq(e);
            $(".nav-li").eq(e).removeClass("nav-li-check");
            n.fadeOut(500, function () {
                n.removeClass("item-actif")
            });
            e = t;
            var i = $(".item").eq(e);
            $(".nav-li").eq(e).addClass("nav-li-check");
            i.fadeIn(400, function () {
                i.addClass("item-actif")
            })
        }
    })
}