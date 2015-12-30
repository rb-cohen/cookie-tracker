(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        var _old = window.CookieHistory;
        var api = window.CookieHistory = factory();
        api.noConflict = function () {
            window.CookieHistory = _old;
            return api;
        };
    }
}(function(){

    return function(options){
        var api = {};

        var settings = $.extend({
            url: null,
            filter: null,
            onDataLoaded: function(){},
            onDataError: function(){},
        }, options);

        var data = {};
        var history = [];

        function loadData() {
            if (settings.url) {
                $.ajax({
                    url: settings.url,
                    contentType: 'json',
                    success: function (response) {
                        setData(response);
                    },
                    error: function (error) {
                        settings.onDataError.call(api, error);
                    }
                });
            } else {
                setData({
                    cookies: Cookies.get()
                });
            }
        }

        function setData(raw){
            if(raw.cookies) {
                var reg = (settings.filter) ? new RegExp(settings.filter) : null;
                var cookies = [];

                for (var name in raw.cookies) {
                    if (reg === null || reg.test(name)) {
                        cookies.push({name: name, value: raw.cookies[name]});
                    }
                }

                data.cookies = cookies;
                delete raw.cookies;
            }

            $.extend(data, raw);
            settings.onDataSuccess.call(api, data);
        }

        function getCurrentEntry(){
            return {
                date: new Date().toUTCString(),
                data: data,
                checksum: generateHash(JSON.stringify(data))
            };
        }

        function logCurrentEntry() {
            var existing = history;
            var current = getCurrentEntry();

            existing.unshift(current);
            $.jStorage.set('cookieHistory', existing);
        }

        function loadHistory(){
            history =  $.jStorage.get('cookieHistory', []);
        }

        function getHistory(){
            return history;
        }

        function wipeHistory(){
            history = [];
            $.jStorage.set('cookieHistory', []);
        }

        function generateHash(string) {
            var hash = 0, i, chr, len;
            if (string.length === 0) return hash;
            for (i = 0, len = string.length; i < len; i++) {
                chr   = string.charCodeAt(i);
                hash  = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }

        $.extend(api, {
            current: getCurrentEntry,
            list: getHistory,
            log: logCurrentEntry,
            wipe: wipeHistory
        });

        loadHistory();
        loadData();

        return api;
    };

}));