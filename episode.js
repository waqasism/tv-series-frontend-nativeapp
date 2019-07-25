var Episode = function(preload, episode) {
	this.metadata = null;
	this.licensingInfo = null;
	this.regex = new RegExp("<[^>]*>", 'g');
}

Episode.prototype.retrieveMetadata = function (episode, callback) {
	var self = this;

	self.metadata.id = episode.id;
	self.metadata.name = self.getTitle(episode.titles);
	self.metadata.description = self.getDescription(episode.descriptions).replace(self.regex, '');
	self.metadata.peg = Math.min.apply(Math, episode.advisoryRating);
	self.metadata.duration = episode.duration;
	self.metadata.progress = episode.playbackDuration;
	self.metadata.progressPercent = (episode.playbackDuration * 100) / episode.duration;

    for (var x = 0; x < episode['thumbnails']['images'].length; x++) {
        if (episode['thumbnails']['images'][x]['type'] == 'thumbnail')
           self.metadata.thumbnail = episode['thumbnails']['baseUrl'] + episode['thumbnails']['images'][x]['url'];
    }

    callback();
}

Episode.prototype.retrieveProductInfo = function (episode, callback) {
	var self = this;
    var thumbnailId = episode['vodProgram']['thumbnails']['images'].map(function(x) {return x.type; }).indexOf('thumbnail');
    var playUrl = null;

    self.metadata.loaned = false;
    self.metadata.isUserAuthorized = false;
    self.licensingInfo.available = false;
    self.licensingInfo.availabilityDate = null;
    self.licensingInfo.seriePass.availability = false;
    self.licensingInfo.selection.availability = false;
    self.licensingInfo.tvod.id = null;
    self.licensingInfo.tvod.price = -1;

    for (streamId in episode['vodProgram']['streams']) {
        var stream = episode['vodProgram']['streams'][streamId];
        if (stream.isUserAuthorized == true) {
            playUrl = stream.url;
            self.metadata.isUserAuthorized = true;
        }

        for (productId in stream.products) {
            var product = stream.products[productId];
            if (product.type.toUpperCase() == 'SVOD') {
                if (product.title == 'SeriesPass') {
                    self.licensingInfo.seriePass.availability = true;
                    self.licensingInfo.seriePass.price = product.price;
                }
                else if (product.title == 'Selection') {
                    self.licensingInfo.seriePass.availability = true;
                    self.metadata.seriePass.price = product.price;
                }
            }
            else if (product.type.toUpperCase() == 'TVOD') {
                self.licensingInfo.tvod.price = product.price;
                self.licensingInfo.tvod.id = product.id;
                if (product.isUserAuthorized)
                    self.metadata.loaned = true;
            }
        }
    }

    console.log(episode);
    console.log('getting episode product data');
    console.log(templateData);
    callback();
};

Episode.prototype.getTitle = function (titles) {
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

Episode.prototype.getDescription = function (descriptions) {
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

Episode.prototype.getAvailability = function (licensingWindows) {
    var availability = null;

    for (var licensingWindowsId in licensingWindows) {
        var licensingWindow = licensingWindows[licensingWindowsId];

        if (availability == null)
            availability = licensingWindow['licensingStartTime'];
        else {
            var a = new Date(availability);
            var b = new Date(licensingWindow['licensingStartTime']);

            if ((b - a) < 0)
                availability = licensingWindow['licensingStartTime'];
        }
    }

    return availability;
};

Episode.prototype.isAvailable = function (availability) {
    var available = false;

    var a = new Date();
    var b = new Date(availability);

    if (availability != null && (b - a) < 0)
        available = true;

    return available;
};

Episode.prototype.getLicenseAvailability = function (licensingWindows) {
    for (var licensingWindowsId in licensingWindows) {
        var licensingWindow = licensingWindows[licensingWindowsId];

        if (availability == null)
            availability = licensingWindow['licensingStartTime'];
        else {
            var a = new Date(availability);
            var b = new Date(licensingWindow['licensingStartTime']);

            if ((b - a) < 0)
                availability = licensingWindow['licensingStartTime'];
        }
    }
};