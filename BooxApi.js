
var BrowserDetect = {
    init: function() {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function(data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            } else if (dataProp)
                return data[i].identity;
        }
    },
    searchVersion: function(dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },
    dataBrowser: [{
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
    }, {
        string: navigator.userAgent,
        subString: "IEMobile",
        identity: "IEMobile",
        versionSearch: "IEMobile"
    }, {
        string: navigator.userAgent,
        subString: "OmniWeb",
        versionSearch: "OmniWeb/",
        identity: "OmniWeb"
    }, {
        string: navigator.vendor,
        subString: "Apple",
        identity: "Safari",
        versionSearch: "Version"
    }, {
        prop: window.opera,
        identity: "Opera",
        versionSearch: "Version"
    }, {
        string: navigator.vendor,
        subString: "iCab",
        identity: "iCab"
    }, {
        string: navigator.vendor,
        subString: "KDE",
        identity: "Konqueror"
    }, {
        string: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
    }, {
        string: navigator.vendor,
        subString: "Camino",
        identity: "Camino"
    }, {
        string: navigator.userAgent,
        subString: "Netscape",
        identity: "Netscape"
    }, {
        string: navigator.userAgent,
        subString: "Trident",
        identity: "IE11",
        versionSearch: "Trident"
    }, {
        string: navigator.userAgent,
        subString: "MSIE",
        identity: "Explorer",
        versionSearch: "MSIE"
    }, {
        string: navigator.userAgent,
        subString: "Gecko",
        identity: "Mozilla",
        versionSearch: "rv"
    }, {
        string: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
    }],
    dataOS: [{
        string: navigator.userAgent,
        subString: "Windows Phone",
        identity: "Windows Phone"
    }, {
        string: navigator.platform,
        subString: "Win",
        identity: "Windows"
    }, {
        string: navigator.platform,
        subString: "Mac",
        identity: "Mac"
    }, {
        string: navigator.userAgent,
        subString: "iPhone",
        identity: "iPhone/iPod"
    }, {
        string: navigator.userAgent,
        subString: "Android",
        identity: "Android"
    }, {
    }, {
        string: navigator.userAgent,
        subString: "iPad",
        identity: "iPad"
    }, {
        string: navigator.platform,
        subString: "Linux",
        identity: "Linux"
    }]
};
BrowserDetect.init();;

function utf8_encode(argString) {
    if (argString === null || typeof argString === 'undefined') {
        return '';
    }
    var string = (argString + '');
    var utftext = '',
        start, end, stringl = 0;
    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        } else if ((c1 & 0xF800) != 0xD800) {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        } else {
            if ((c1 & 0xFC00) != 0xD800) {
                throw new RangeError('Unmatched trail surrogate at ' + n);
            }
            var c2 = string.charCodeAt(++n);
            if ((c2 & 0xFC00) != 0xDC00) {
                throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
            }
            c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
            enc = String.fromCharCode((c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
    if (end > start) {
        utftext += string.slice(start, stringl);
    }
    return utftext;
}

function md5(str) {
    var xl;
    var rotateLeft = function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };
    var addUnsigned = function(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };
    var _F = function(x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function(x, y, z) {
        return (x & z) | (y & (~z));
    };
    var _H = function(x, y, z) {
        return (x ^ y ^ z);
    };
    var _I = function(x, y, z) {
        return (y ^ (x | (~z)));
    };
    var _FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var _GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var _HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var _II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var convertToWordArray = function(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
    var wordToHex = function(lValue) {
        var wordToHexValue = '',
            wordToHexValue_temp = '',
            lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = '0' + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };
    var x = [],
        k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;
    str = this.utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;
    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return temp.toLowerCase();
};
var BxApi = function() {
    this.username = readCookie('username');
    this.password = '';
    this.context = null;
    this.apiDeferred = null;
    this.apiSettings = {};
    this.tryCount = 0;
    this.cnonce = '';

    if (this.username == null)
        this.username = 'guest';
};
BxApi.prototype.apiProgress = function() {
    this.apiDeferred.notifyWith(this.context, arguments);
};
BxApi.prototype.apiDone = function() {
    this.tryCount = 0;
    this.apiDeferred.resolveWith(this.context, arguments);
};
BxApi.prototype.apiReject = function() {
    if (typeof BxApi.app != 'undefined')
        BxApi.app.trigger('api-failed', {
            context: this.context,
            args: arguments
        });
    
    this.apiDeferred.rejectWith(this.context, arguments);
}
BxApi.prototype.apiFail = function(xhr) {
    if (xhr.status == 401) {
        var authParams = this.getAuthParams(xhr.getResponseHeader('X-Authenticate'));
        if (authParams.length > 0) {
            var realm = _.find(authParams, function(value) {
                return (value[0] === 'realm');
            })[1];
            if (realm == 'service') {
                if (this.tryCount == 0) {
                    this.tryCount++;
                    /*this.performServiceAuth(xhr, this.apiSettings.url, this.apiSettings.type).done(function(json) {
                        this.tryCount = 0;
                        var xhr = $.ajax(this.apiSettings);
                        xhr.fail(this.apiFail);
                        xhr.done(this.apiDone);
                        xhr.progress(this.apiProgress);
                    }).fail(function() {
                        this.apiReject(arguments);
                    });*/
		    this.authHeaderValue = xhr.getResponseHeader('X-Authenticate').replace('"auth"', '"auth,auth-int"');
		    //console.log(this.authHeaderValue);
		    //var cnonce = 'bd5fd9b093dccaa1';
		    //var nc = '00000001';
		    var tmp = xhr.getResponseHeader('X-Authenticate').split(',');
		    var nonce = tmp[2].split('=')[1].replace(/\"/g, '');
		    var qop = tmp[1].split('=')[1].replace(/\"/g, '');
		    //console.log(qop);
		    var hash = md5(serviceUserName + ':service:' + servicePassword);
                    var A2 = md5(this.apiSettings.type + ':' + this.apiSettings.url);
		    var response = md5(hash + ':' + nonce + ':' + this.tryCount + ':' + this.cnonce + ':' + qop + ':' + A2);
		    //console.log(tmp);
		    this.authHeaderValue = 'Digest username="' + serviceUserName + '",realm="service",' + tmp[2] + ',uri="' + this.apiSettings.url + '",' + tmp[1] + ',nc="' + this.tryCount + '",cnonce="' + this.cnonce + '",response="' + response + '",' + tmp[3];
		    //console.log(this.authHeaderValue);
		    var xhr = $.ajax(this.apiSettings);
                        xhr.fail(this.apiFail);
                        xhr.done(this.apiDone);
                        xhr.progress(this.apiProgress);
                    
                } else {
                    this.apiReject(arguments);
                }
            } else if (realm == 'user') {
                if (this.tryCount == 0) {
                    this.tryCount++;
                    
                    this.authHeaderValue = this.getAuthHeader(authParams);
                    if (this.authHeaderValue) {
                        var xhr = $.ajax(this.apiSettings);
                        xhr.fail(this.apiFail);
                        xhr.done(this.apiDone);
                        xhr.progress(this.apiProgress);
                    }
		    else {
			this.apiReject(arguments);
		    }
		} else {
                    this.apiReject(arguments);
                }
            } else {
                this.apiReject(arguments);
            }
        } else {
            this.apiReject(arguments);
        }
    } else if (xhr.status == 200) {
        this.apiDeferred.resolveWith(this.context);
    } else {
        this.apiReject(arguments);
    }
};

BxApi.prototype.call = function(type, url, data) {
    this.apiDeferred = $.Deferred();
    //url = url.replace(/\/api\/user\/([a-zA-Z0-9._\-@]+)\/(.*)/, "/api/user/" + this.username + "/$2");
    this.cnonce = Math.random().toString(36).substring(7);
    data = $.extend(data, {
        'service': serviceUserName,
        'ajax': '1',
    });
    this.apiSettings = {
        context: this,
        type: type,
        url: webserviceUrl + url,
        dataType: "json",
        cache: false,
        async: true,
        data: data,
        beforeSend: function(xhr) {
            if (this.authHeaderValue != undefined)
                xhr.setRequestHeader('Authorization', this.authHeaderValue);
        },
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true
    };
    var xhr = $.ajax(this.apiSettings);
    xhr.fail(this.apiFail);
    xhr.progress(this.apiProgress);
    xhr.done(this.apiDone);
    return this.apiDeferred.promise();
};

BxApi.prototype.getAuthParams = function(authHeader) {
    var authParams = [];
    authHeader = authHeader || '';
    params = authHeader.split(' ', 2);
    if (params.length == 2 && params[0].toLowerCase() === 'digest') {
        param2 = params[1].split(',');
        if (param2.length > 0) {
            _.each(param2, function(value) {
                pair = value.split('=');
                pair[1] = pair[1].replace(/\"/g, '');
                authParams.push(new Array(pair[0], pair[1]));
            });
        }
    }
    return authParams;
};

BxApi.prototype.performServiceAuth = function(xhr, uri, requestMethod) {
    return $.ajax({
        context: this,
        type: "POST",
        url: '/auth/service',
        data: {
            'authParams': xhr.getResponseHeader('X-Authenticate'),
            'uri': uri,
            'requestMethod': requestMethod,
            'serviceUser': serviceUserName
        },
        cache: false,
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true
    });
};

BxApi.prototype.getAuthHeader = function(authParams) {
    var paramList = [];
    authParams.push(new Array('uri', this.apiSettings.url));
    authParams.push(new Array('nc', this.tryCount));
    authParams.push(new Array('cnonce', this.cnonce));
    var realm = _.find(authParams, function(value) {
        return (value[0] === 'realm');
    })[1];
    authParams.push(new Array('username', this.username));
    if (this.password) {
        hash = md5(this.username + ':' + realm + ':' + this.password);
    } else {
        return;
    }
    var nonce = _.find(authParams, function(value) {
        return (value[0] === 'nonce');
    })[1];
    var qop = _.find(authParams, function(value) {
        return (value[0] === 'qop');
    })[1];
    A2 = md5(this.apiSettings.type + ':' + this.apiSettings.url);
    response = md5(hash + ':' + nonce + ':' + this.tryCount + ':' + this.cnonce + ':' + qop + ':' + A2);
    authParams.push(new Array('response', response));
    _.each(authParams, function(value) {
        paramList.push(value[0] + '="' + value[1] + '"');
    });
    return params[0] + ' ' + paramList.join(',');
};

BxApi.prototype.login = function(username, password, csrf) {
    this.context = this;
    var prevUsername = this.username;
    var prevPassword = this.password;
    this.username = username;
    this.password = password;
    return this.call('POST', '/api/user/' + this.username + '/login', {
        'ver': webui_v,
        'device_id': md5(BrowserDetect.OS + ":" + BrowserDetect.browser + ":" + BrowserDetect.version),
        'platform': BrowserDetect.browser,
        'os_ver': BrowserDetect.version,
        'YII_CSRF_TOKEN': csrf,
        'auth_user': 1
    }).done(function() {
        username = this.username;
    }).fail(function() {
        this.username = prevUsername;
        this.password = prevPassword;
    });
};

BxApi.prototype.logout = function() {
    this.context = this;
    return this.call('POST', '/api/user/' + this.username + '/logout').done(function() {
        this.username = 'guest';
        this.password = '';
    }).fail(function(xhr) {
        if (xhr.status == 401) {
            this.username = 'guest';
            this.password = '';
        }
    });
};
