(function () {
    let isDebugMode = location.href.indexOf("localhost") > -1 || location.href.indexOf("//192.168") > -1;
    __webpack_public_path__ = isDebugMode ? "/dist-dev/" : window["resourceCdnPath"] + "/dist/";
})();
