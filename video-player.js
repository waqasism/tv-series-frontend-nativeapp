function getMovieMetadata(episodeId) {
    var episodeData = ott.getEpisodeMetadata(episodeId);
    
    var playback = $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .episode-time .progress-wrap.progress').data('progress');
    episodeData.playbackDuration = playback;
    
    return JSON.stringify(episodeData);
}

function logNativePlackback(episodeId, type, eventType, position) {
    ott.setEpisodePlayback(episodeId, eventType, position, function () {
        var duration = $('.episode-box[data-id="' + episodeId + '"]').data('duration');

        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').attr('data-progress', position);
        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').data('progress', position);
        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').attr('data-progress-percent', Math.round((position * 100) / duration));
        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').data('progress-percent', Math.round((position * 100) / duration));
        if( window.moveProgressBar )	//this function is available only in season detail page
	        moveProgressBar();

        return true;
    }, type);
}

function loadNativePlayer(id, data) {
    var playback = $('#tabs-container .episode-liste .episode-box[data-id="' + id + '"] .episode-time .progress-wrap.progress').data('progress');
    ott.setEpisodePlayback(id, 'play', playback, function () {});
    var url = 'native://';
    if (!data || !data.redirect)	
    	return false;	
    
    var vod = {
		"start": playback,
		"type": "vod",
		"programId": id
	};
	
	if( data.channel ) {
		$.extend( vod, data.channel );
		vod.channelId = id;
		
		delete data.channel;
		delete vod.programId;
	}
	
    data.vod = vod;
    url += 'playvideo?data=' + encodeURIComponent( JSON.stringify( data ) );	
    window.location.replace(url);
}

function loadPlayer(episodeId, data) {
	dataLayer.push({'event':'video', 'action':'launch', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': 'n/a', 'videoDuration': episodeDuration});
	
    if (!data.drm)
        loadJwPlayer(episodeId, data.redirect.url);
    else
        loadDashPlayer(episodeId, data);
}

function loadDashPlayer(episodeId, data) {
	
    var episode = $('.episode-box[data-id="' +  episodeId + '"]');
    var vuPlayConfig = { 
        container : document.getElementById("seasonPlayer"),
        autostart : true,
        drmToken: data.drm.token,
        laurl: data.drm.laUrl,
        source : data.redirect.url,
        skinCssUrl : "assets/js/dash/0.6.0/skin.css",
        debug : false,
        posterUrl: episode.data('thumbnail'),
        logoUrl: ""
    };

    $('#seasonPlayer').html('');

    vuplay = new Vuplay(vuPlayConfig);
    if($("#vuplay-video").length != 0) {
		vuplay.pause();
		}

    $('#seasonPlayer').data('episode-id', episodeId);
    var playback = $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .episode-time .progress-wrap.progress').data('progress');
    var interval = null;
    setEpisodePlayback('start', Math.floor(playback));
    if (playback >= 60)
        setTimeout(function(){
			vuplay.seek(playback);
		}, 2000);
    else
        vuplay.play();

    /*if (interval == null) {
        interval = setInterval(function () {
            var playback = parseInt($('progress#vuplay-progress').attr('value'));
            setEpisodePlayback('start', Math.floor(playback));
        }, 60000);
    }*/
    $('.vuplay-central-btn').click(function(e){
    	dataLayer.push({'event':'video', 'action':'play', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': 'n/a', 'videoDuration': episodeDuration});
    	 setTimeout(setEpisodePlayback('start', Math.floor(parseInt($('progress#vuplay-progress').attr('value'))), 0));
    });

    $('#vuplay-play-btn').click(function (e) {
        var state = 'stop';

        if ($(this).hasClass('vuplay-playing')) {
        	playback = parseInt($('progress#vuplay-progress').attr('value'));
        	dataLayer.push({'event':'video', 'action':'stop', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': playback, 'videoDuration': episodeDuration});
            clearInterval(interval);
            interval = null;
        }
        else {
        	dataLayer.push({'event':'video', 'action':'play', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': 'n/a', 'videoDuration': episodeDuration});
            if (interval == null) {
                interval = setInterval(function () {
                    var playback = parseInt($('progress#vuplay-progress').attr('value'));
                    setEpisodePlayback('start', Math.floor(playback));
                }, 60000);
            }
            state = 'start';
        }

        setTimeout(setEpisodePlayback(state, Math.floor(parseInt($('progress#vuplay-progress').attr('value'))), 0));
    });

    //$('.vuplay-progress').click(function (e) {
        //setTimeout(setEpisodePlayback('start', Math.floor(parseInt($('progress#vuplay-progress').attr('value'))), 0));
    //});

    $('.survey .saison-info').hide();
    $('.survey .survey-play').remove();
}

function loadJwPlayer(episodeId, videoUrl) {
	dataLayer.push({'event':'video', 'action':'play', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': 'n/a', 'videoDuration': episodeDuration});
    var episode = $('.episode-box[data-id="' +  episodeId + '"]');

    $('#seasonPlayer').html('');

    jwplayer.key = "yGz//GzkRrCGzAgCKIzh/l7ZmUDVPijpe0VnxA==";
    jwplayer('seasonPlayer').setup({
        file: videoUrl,
        image: episode.data('thumbnail'),
        width: "100%",
        height: "100%",
        autostart: false
    });

    jwplayer('seasonPlayer').onReady(function () {
        $('#seasonPlayer').data('episode-id', episodeId);
        var playback = $('#tabs-container .episode-liste .episode-box[data-id="' + episodeId + '"] .episode-time .progress-wrap.progress').data('progress');
        var interval = null;
        setEpisodePlayback('play', Math.floor(playback));

        if (playback >= 60)
            jwplayer('seasonPlayer').seek(playback);
        else
            jwplayer('seasonPlayer').play(true);

        jwplayer('seasonPlayer').onPlay(function () {
        	dataLayer.push({'event':'video', 'action':'start', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': 'n/a', 'videoDuration': episodeDuration});
            if (interval == null) {
                interval = setInterval(function () {
                    setEpisodePlayback('start', Math.floor(this.getPosition()));
                }, 60000);
            }
        });

        //jwplayer('seasonPlayer').onSeek(function (data) {
            //setTimeout(setEpisodePlayback('start', Math.floor(data.offset), 0));
       // });

        jwplayer('seasonPlayer').onPause(function () {
        	dataLayer.push({'event':'video', 'action':'stop', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': playback, 'videoDuration': episodeDuration});
            clearInterval(interval);
            interval = null;
            setTimeout(setEpisodePlayback('stop', Math.floor(this.getPosition())), 0);
        });

        jwplayer('seasonPlayer').onComplete(function () {
        	dataLayer.push({'event':'video', 'action':'complete', 'videoCategory': videoCategory, 'videoProduct': showTitle, 'episodeTitle':episodeTitle, 'episodeNbr': episodeNumber, 'seasonTitle': seasonTitle, 'viewingDuration': playback, 'videoDuration': episodeDuration});
            clearInterval(interval);
            interval = null;
            setTimeout(setEpisodePlayback('stop', Math.floor(this.getPosition())), 0);
        });

        $('.survey .saison-info').hide();
        $('.survey .survey-play').remove();
    });
}

function setEpisodePlayback(type, position) {
    var episodeId = $('#seasonPlayer').data('episode-id');

    ott.setEpisodePlayback(episodeId, type, position, function () {
        var duration = $('.episode-box[data-id="' + episodeId + '"]').data('duration');

        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').attr('data-progress', position);
        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').data('progress', position);
        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').attr('data-progress-percent', Math.round((position * 100) / duration));
        $('.episode-box[data-id="' + episodeId + '"] .episode-details .progress-wrap.progress').data('progress-percent', Math.round((position * 100) / duration));
        moveProgressBar();

        return true;
    }, 'vod');
}
