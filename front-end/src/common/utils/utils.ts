class portalUtils {
    /**
     * Gets if current site is run inside an iframe
     */
    static isInIframe(): boolean {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     * Determines if current device runs iOS
     */
    static isIOS(): boolean {
        return (
            (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window["MSStream"]) || navigator.userAgent.match(/(iPad)/) != null || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
        );
    }

    /**
     * Determines if current device runs Android
     */
    static isAndroid(): boolean {
        return navigator.userAgent.toLowerCase().indexOf("android") > -1;
    }

    /**
     * Determines if given variable is a string
     * @param obj
     */
    static isString(obj: any): boolean {
        return typeof obj === "string" || obj instanceof String;
    }

    /**
     * Determines if given variable is a number
     *
     * @param numberToCheck Possible function
     */
    static isNumber(numberToCheck: any): boolean {
        return !isNaN(parseFloat(numberToCheck)) && isFinite(numberToCheck);
    }

    /**
     * Determines if given variable is a function
     *
     * @param functionToCheck Possible function
     */
    static isFunction(functionToCheck: any): boolean {
        return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
    }

    /**
     * Determines if given variable is Array
     * @param arr Possible array
     */
    static isArray(arr: any): boolean {
        return arr && Object.prototype.toString.call(arr) === "[object Array]";
    }

    /**
     * Determines if current browser is Chrome
     */
    static isBrowserChrome(): boolean {
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }

    /**
     * Performs normalization / unification for search
     */
    static normalizeStringForSearch(str: string): string {
        return str.toLowerCase().latinize().trim();
    }

    /**
     * Generates random string
     *
     * @param length Desired length of the random string
     */
    static randomString(length: number): string {
        var result = "";
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    /**
     * Generates random number
     *
     * @param min Min value
     * @param max Max value
     */
    static randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * max) + min;
    }

    /**
     * Downloads a Blob object to a file
     * @param blob Blob that should be downloaded
     * @param fileName FileName of the download file
     */
    static downloadBlob(blob: Blob, fileName: string, callback: () => void): void {
        if ((window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
            callback();
        } else {
            var _OBJECT_URL = URL.createObjectURL(blob);
            var dummyLink = document.createElement("a");
            var randomId = "ifl-" + portalUtils.randomString(10);

            dummyLink.setAttribute("id", randomId);
            document.body.append(dummyLink);

            setTimeout(function () {
                document.getElementById(randomId).setAttribute("href", _OBJECT_URL);
                document.getElementById(randomId).setAttribute("download", fileName);

                setTimeout(function () {
                    document.getElementById(randomId).click();

                    setTimeout(function () {
                        window.URL.revokeObjectURL(_OBJECT_URL);
                        document.body.removeChild(dummyLink);
                    }, 5000);

                    setTimeout(function () {
                        callback();
                    }, 50);
                }, 50);
            }, 50);
        }
    }

    /*
     * Obtains current URL for static files that should be delivered by the CDN
     */
    static getCdnUrl(): string {
        return window["AppConfig"].cdnPath;
    }

    /*
     * Obtains URL for asset either on CDN, or on local
     */
    static getAssetPath(path: string): string {
        return portalUtils.getCdnUrl() + path;
    }

    /**
     * Posts Inviton action message to the topmost window listener
     * @param actionName Unique name of the action
     * @param data Accompanying action data
     */
    static postActionMessage(actionName: string, data: any): void {
        window.top.postMessage(
            "INV-" +
                JSON.stringify({
                    action: actionName,
                    data: data,
                }),
            "*",
        );
    }

    /**
     * Determines width of the scrollbar
     */
    static getScrollbarWidth(): number {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    }

    /**
     * Determines if current device is a touch-enabled device (mobile, tablet, desktop with touchscreen, etc.)
     */
    static isTouchDevice(): boolean {
        if (portalUtils["_isTouchDeviceVal"] == null) {
            try {
                document.createEvent("TouchEvent");
                portalUtils["_isTouchDeviceVal"] = true;
            } catch (e) {
                portalUtils["_isTouchDeviceVal"] = false;
            }
        }
        return portalUtils["_isTouchDeviceVal"];
    }

    static isChromeDesktopBrowser(): boolean {
        if (portalUtils["_isChromeBrowser"] == null) {
            var retVal = false;
            var isChromium = (window as any).chrome;
            var winNav = window.navigator;
            var vendorName = winNav.vendor;
            var isOpera = typeof (window as any).opr !== "undefined";
            var isIEedge = winNav.userAgent.indexOf("Edg") > -1;
            var isIOSChrome = winNav.userAgent.match("CriOS");

            if (isIOSChrome) {
                retVal = false;
            } else if (isChromium !== null && typeof isChromium !== "undefined" && vendorName === "Google Inc." && isOpera === false && isIEedge === false) {
                retVal = true;
            } else {
                retVal = false;
            }

            portalUtils["_isChromeBrowser"] = retVal;
        }

        return portalUtils["_isChromeBrowser"];
    }

    /**
     * Gets if current site is run inside an iframe
     */
    static treatAsMobileDevice(): boolean {
        if (portalUtils["_treatAsMobileDeviceVal"] != null) {
            return portalUtils["_treatAsMobileDeviceVal"];
        }

        var retVal = false;
        if (portalUtils.isAndroid() || portalUtils.isIOS()) {
            portalUtils["_treatAsMobileDeviceVal"] = true;
            return portalUtils["_treatAsMobileDeviceVal"];
        }

        //If the scrollbar is wider than 0, it means the device usually shows scrollbar when needed and it's most likely a desktop computer with a touchscreen
        if (portalUtils.getScrollbarWidth() > 0) {
            portalUtils["_treatAsMobileDeviceVal"] = false;
            return false;
        }

        portalUtils["_treatAsMobileDeviceVal"] = portalUtils.isTouchDevice();
        return portalUtils["_treatAsMobileDeviceVal"];
    }

    /**
     * Escapes string into HTML-safe string
     * @param str - String that needs to be HTML-escaped
     */
    static htmlEscape(str: string): string {
        return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /**
     * Determines if device supports Native share API
     */
    static hasNativeShare(): boolean {
        return navigator["share"] != null;
    }

    /**
     * Animated scrolls to given element
     *
     * @param element HTMLElement or InviDom object to which page should scroll
     * @param offset Offset of the scroll, negative scrolls a bit up (-80 scrolls up 80px), positive scrolls down (100, scrolls additional 100px down)
     */
    static scrollToElement(element: HTMLElement | JQuery, offset?: number) {
        if (element["inviDom"] || element["jquery"]) {
            element = element[0];
        }

        /**
         * Recursively climbs UP the tree to determine first PARENT node of the scroll element to obtain the scroll target
         * @param currentElem
         */
        function getScrollTaget(currentElem: HTMLElement): HTMLElement {
            if (
                currentElem.scrollTop != 0 ||
                currentElem.nodeName == "DIALOG" ||
                currentElem.classList.contains("invmodal-root") ||
                currentElem.classList.contains("modal") ||
                currentElem.getAttribute("role") == "dialog"
            ) {
                return currentElem;
            } else if (currentElem.parentNode == null || currentElem.nodeName == "HTML") {
                return currentElem;
            } else {
                return getScrollTaget(currentElem.parentElement);
            }
        }

        var scrollElem = getScrollTaget(<HTMLElement>element);
        var target = (<HTMLElement>element).getBoundingClientRect().top + scrollElem.scrollTop + (offset != null ? offset : 0);
        portalUtils.scrollElement(scrollElem, target);
    }

    /**
     * Animated scrolls to top
     */
    static scrollToTop() {
        /**
         * Recursively climbs DOWN the tree to determine first CHILD node of the scroll element to obtain the scroll target
         * @param currentElem
         */
        function getScrollTaget(currentElem: HTMLElement): HTMLElement {
            if (currentElem.scrollTop != 0) {
                return currentElem;
            }

            if (currentElem.children != null) {
                var childLen = currentElem.children.length;
                if (childLen > 0) {
                    for (var i = 0; i < childLen; i++) {
                        var possibleItem = getScrollTaget(<HTMLElement>currentElem.children[i]);
                        if (possibleItem != null) {
                            return possibleItem;
                        }
                    }
                }
            }

            return null;
        }

        portalUtils.scrollElement(getScrollTaget(document.body) || document.body.parentElement, 0);
    }

    /**
     * Animted scrolls element to given position
     *
     * @param element HTMLElement or InviDom object which should scroll (usually document.body)
     * @param offset Offset of the scroll, negative scrolls a bit up (-80 scrolls up 80px), positive scrolls down (100, scrolls additional 100px down)
     */
    static scrollElement(element: HTMLElement | JQuery, scrollPos: number, offset?: number) {
        if (element["inviDom"] || element["jquery"]) {
            element = element[0];
        }

        //Determine if the topmost scroll element should be HTML or BODY element
        if ((<HTMLElement>element).nodeName == "HTML" && (<HTMLElement>element).scrollTop == 0) {
            (<HTMLElement>element).scrollTop = 1;
            if ((<HTMLElement>element).scrollTop != 1) {
                element = document.body;
            }
        }

        //Open dialogs should not scroll unless scrolling inside the dialog
        if ((window as any).inviton && (window as any).inviton.dialogUtils && (window as any).inviton.dialogUtils.dialogIsOpen()) {
            var nodeName = (<HTMLElement>element).nodeName.toLowerCase();
            if (nodeName == "html" || nodeName == "body") {
                return;
            }
        }

        var targetScroll = scrollPos + (offset != null ? offset : 0);
        window["jQuery"](element).animate(
            {
                scrollTop: targetScroll + "px",
            },
            1200,
        );
    }

    static getChildrenByType<T>(context: any, typeName: string): Array<T> {
        return context.$children.filter((p) => p.$options.name == typeName) as any;
    }

    static handleMobileMenuClick(): void {
        try {
            if ($("html").hasClass("nav-open") && $(window).width() < 768) {
                setTimeout(() => {
                    if (window["_nowDashboard"].misc.navbar_menu_visible == 1) {
                        $("html").removeClass("nav-open");
                        window["_nowDashboard"].misc.navbar_menu_visible = 0;
                        setTimeout(function () {
                            $(".navbar-toggle").removeClass("toggled");
                            $("#bodyClick").remove();
                        }, 550);
                    }
                }, 350);
            }
        } catch (e) {}
    }

    static postToNewWindow(url, fieldArr) {
        var arr;
        if (fieldArr.constructor === Array) {
            arr = fieldArr;
        } else {
            arr = [];
            for (var key in fieldArr) {
                if (fieldArr.hasOwnProperty(key)) {
                    arr.push({
                        name: key,
                        value: fieldArr[key],
                    });
                }
            }
        }

        var formMethod = "POST";
        var formName = "frm" + new Date().getTime().toString();
        var newForm = '<form id="' + formName + '" method="' + formMethod + '" action="' + url + '" target="_blank">';

        $.each(arr, function (i, field) {
            var newElem = $('<div><input type="hidden" name="' + field.name + '" /></div>');
            $("input", newElem).val(field.value);
            newForm += newElem.html();
        });

        newForm += "</form>";

        var newFormElem = $(newForm);
        $("body").append(newFormElem);
        newFormElem.submit();

        setTimeout(function () {
            newFormElem.remove();
        }, 50);
    }
}

(function () {
    window["portalUtils"] = portalUtils;
})();
