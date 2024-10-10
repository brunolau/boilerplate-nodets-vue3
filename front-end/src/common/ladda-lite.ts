import "./css/ladda-themeless-zoomin.min.css";

/*! Ladda http://lab.hakim.se/ladda MIT licensed Copyright (C) 2016 Hakim El Hattab, http://hakim.se ....Lightweight adaptation for Inviton API needs*/
namespace laddaLiteUtils {
    function createButtonSpinner(spinnerArgs: any): any {
        var prefixes = ["webkit", "Moz", "ms", "O"] /* Vendor prefixes */,
            animations: any = {} /* Animation rules keyed by their name */,
            useCssAnimations: any; /* Whether to use CSS animations or setTimeout */

        /**
         * Utility function to create elements. If no tag name is given,
         * a DIV is created. Optionally properties can be passed.
         */
        function createEl(tag?: any, prop?: any) {
            var el = document.createElement(tag || "div"),
                n;

            for (n in prop) el[n] = prop[n];
            return el;
        }

        /**
         * Appends children and returns the parent.
         */
        function ins(parent: any, ...items: Array<any>) {
            for (var i = 1, n = arguments.length; i < n; i++) parent.appendChild(arguments[i]);

            return parent;
        }

        /**
         * Insert a new stylesheet to hold the @keyframe or VML rules.
         */
        var sheet = (function () {
            var el = createEl("style", { type: "text/css" });
            ins(document.getElementsByTagName("head")[0], el);
            return el.sheet || el.styleSheet;
        })();

        /**
         * Creates an opacity keyframe animation rule and returns its name.
         * Since most mobile Webkits have timing issues with animation-delay,
         * we create separate rules for each line/segment.
         */
        function addAnimation(alpha: any, trail: any, i: any, lines: any) {
            var name = ["opacity", trail, ~~(alpha * 100), i, lines].join("-"),
                start = 0.01 + (i / lines) * 100,
                z = Math.max(1 - ((1 - alpha) / trail) * (100 - start), alpha),
                prefix = useCssAnimations.substring(0, useCssAnimations.indexOf("Animation")).toLowerCase(),
                pre = (prefix && "-" + prefix + "-") || "";

            if (!animations[name]) {
                sheet.insertRule(
                    "@" +
                        pre +
                        "keyframes " +
                        name +
                        "{" +
                        "0%{opacity:" +
                        z +
                        "}" +
                        start +
                        "%{opacity:" +
                        alpha +
                        "}" +
                        (start + 0.01) +
                        "%{opacity:1}" +
                        ((start + trail) % 100) +
                        "%{opacity:" +
                        alpha +
                        "}" +
                        "100%{opacity:" +
                        z +
                        "}" +
                        "}",
                    sheet.cssRules.length
                );

                animations[name] = 1;
            }

            return name;
        }

        /**
         * Tries various vendor prefixes and returns the first supported property.
         */
        function vendor(el: any, prop: any) {
            var s = el.style,
                pp,
                i;

            prop = prop.charAt(0).toUpperCase() + prop.slice(1);
            for (i = 0; i < prefixes.length; i++) {
                pp = prefixes[i] + prop;
                if (s[pp] !== undefined) return pp;
            }
            if (s[prop] !== undefined) return prop;
        }

        /**
         * Sets multiple style properties at once.
         */
        function css(el: any, prop: any) {
            for (var n in prop) el.style[vendor(el, n) || n] = prop[n];

            return el;
        }

        /**
         * Fills in default values.
         */
        function merge(obj: any, ...newObj: Array<any>) {
            for (var i = 1; i < arguments.length; i++) {
                var def = arguments[i];
                for (var n in def) if (obj[n] === undefined) obj[n] = def[n];
            }
            return obj;
        }

        /**
         * Returns the absolute page-offset of the given element.
         */
        function pos(el: any) {
            var o = { x: el.offsetLeft, y: el.offsetTop };
            while ((el = el.offsetParent)) (o.x += el.offsetLeft), (o.y += el.offsetTop);

            return o;
        }

        /**
         * Returns the line color from the given string or array.
         */
        function getColor(color: any, idx: any) {
            return typeof color == "string" ? color : color[idx % color.length];
        }

        var mergedOpts = merge(spinnerArgs || {}, {
            lines: 12, // The number of lines to draw
            length: 7, // The length of each line
            width: 5, // The line thickness
            radius: 10, // The radius of the inner circle
            rotate: 0, // Rotation offset
            corners: 1, // Roundness (0..1)
            color: "#000", // #rgb or #rrggbb
            direction: 1, // 1: clockwise, -1: counterclockwise
            speed: 1, // Rounds per second
            trail: 100, // Afterglow percentage
            opacity: 1 / 4, // Opacity of the lines
            fps: 20, // Frames per second when using setTimeout()
            zIndex: 2e9, // Use a high z-index by default
            className: "spinner", // CSS class to assign to the element
            top: "50%", // center vertically
            left: "50%", // center horizontally
            position: "absolute", // element position
        });

        var probe = css(createEl("group"), { behavior: "url(#default#VML)" });
        useCssAnimations = vendor(probe, "animation");

        return {
            /**
             * Adds the spinner to the given target element. If this instance is already
             * spinning, it is automatically removed from its previous target b calling
             * stop() internally.
             */
            spin: function (target: any) {
                this.stop();

                var self = this,
                    o = mergedOpts,
                    el = (self.el = css(createEl(0, { className: o.className }), {
                        position: o.position,
                        width: 0,
                        zIndex: o.zIndex,
                    })),
                    mid = o.radius + o.length + o.width;

                css(el, {
                    left: o.left,
                    top: o.top,
                });

                if (target) {
                    target.insertBefore(el, target.firstChild || null);
                }

                el.setAttribute("role", "progressbar");
                self.lines(el, o);
                return self;
            },

            stop: function () {
                var el = this.el;
                if (el) {
                    if (el.parentNode) el.parentNode.removeChild(el);
                    this.el = undefined;
                }
                return this;
            },

            lines: function (el: any, o: any) {
                var i = 0,
                    start = ((o.lines - 1) * (1 - o.direction)) / 2,
                    seg;

                function fill(color: any, shadow: any) {
                    return css(createEl(), {
                        position: "absolute",
                        width: o.length + o.width + "px",
                        height: o.width + "px",
                        background: color,
                        boxShadow: shadow,
                        transformOrigin: "left",
                        transform: "rotate(" + ~~((360 / o.lines) * i + o.rotate) + "deg) translate(" + o.radius + "px" + ",0)",
                        borderRadius: ((o.corners * o.width) >> 1) + "px",
                    });
                }

                for (; i < o.lines; i++) {
                    seg = css(createEl(), {
                        position: "absolute",
                        top: 1 + ~(o.width / 2) + "px",
                        transform: o.hwaccel ? "translate3d(0,0,0)" : "",
                        opacity: o.opacity,
                        animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + " " + 1 / o.speed + "s linear infinite",
                    });

                    if (o.shadow) ins(seg, css(fill("#000", "0 0 4px " + "#000"), { top: 2 + "px" }));
                    ins(el, ins(seg, fill(getColor(o.color, i), "0 0 1px rgba(0,0,0,.1)")));
                }
                return el;
            },

            /**
             * Internal method that adjusts the opacity of a single line.
             * Will be overwritten in VML fallback mode below.
             */
            opacity: function (el: any, i: any, val: any) {
                if (i < el.childNodes.length) el.childNodes[i].style.opacity = val;
            },
        };
    }

    var ID_ATTRIBUTE = "data-inv-lid";
    export var instanceCache: any = {};

    export function getTarget(target: any): any {
        var realTarget: HTMLElement;
        var retTarget: HTMLElement;
        var navCount = 0;

        if (target.jquery || target.inviDom == true) {
            realTarget = target[0];
        } else {
            realTarget = target;
        }

        retTarget = realTarget;

        while (true) {
            var classList = retTarget.className;
            if (classList.indexOf("ladda-") > -1) {
                if (classList.indexOf("ladda-button-root") > -1) {
                    break;
                }

                navCount += 1;
                retTarget = <any>retTarget.parentElement;
            } else if (navCount > 3) {
                retTarget = realTarget;
                break;
            } else {
                break;
            }
        }

        if (retTarget.className.indexOf("ladda-button-root") == -1) {
            retTarget.className += " ladda-button-root";
        }

        return retTarget;
    }

    export function getInstanceId(target: any) {
        return target.getAttribute(ID_ATTRIBUTE);
    }

    function createSpinner(button: any) {
        var height = button.offsetHeight;
        if (height === 0) {
            height = parseFloat(<any>window.getComputedStyle(button).height);
        }

        if (height > 32) {
            height *= 0.8;
        }

        var radius = height * 0.2;
        return createButtonSpinner({
            color: "#fff",
            lines: 12,
            radius: radius,
            length: radius * 0.6,
            width: radius < 7 ? 2 : 3,
            zIndex: "auto",
            top: "auto",
            left: "auto",
            className: "",
        });
    }

    function getButtonSpinner(button: any) {
        return button._spinner;
    }

    function wrapContent(node: any, wrapper: any) {
        var r = document.createRange();
        r.selectNodeContents(node);
        r.surroundContents(wrapper);
        node.appendChild(wrapper);
    }

    interface LaddaInstance {
        timer: number;
        spinner: any;
    }

    export function createLaddaInstance(button: any) {
        var laddaLabel = document.createElement("span");
        laddaLabel.setAttribute("class", "ladda-label");

        //Wrap innerHTML into new element
        var docRange = document.createRange();
        docRange.selectNodeContents(button);
        docRange.surroundContents(laddaLabel);
        button.appendChild(laddaLabel);

        //Append spinner placeholder
        var laddaSpinner = document.createElement("span");
        laddaSpinner.setAttribute("class", "ladda-spinner");
        button.appendChild(laddaSpinner);
        button.className += " ladda-button";

        var newId = Math.floor(Math.random() * 999999999 + 1);
        button.setAttribute("data-style", "zoom-in");
        button.setAttribute(ID_ATTRIBUTE, newId);

        var laddaInstance = {
            timer: <any>null,
            spinner: createSpinner(button),
        };

        instanceCache[newId] = laddaInstance;
        return laddaInstance;
    }
}

export class laddaLite {
    static showSpin(target: HTMLElement): void {
        if (target == null) {
            return;
        }

        var laddaInstance;
        var button = laddaLiteUtils.getTarget(target);
        var instanceId = laddaLiteUtils.getInstanceId(button);

        if (instanceId == null || button.querySelector(".ladda-spinner") == null) {
            laddaInstance = laddaLiteUtils.createLaddaInstance(button);
        } else {
            laddaInstance = laddaLiteUtils.instanceCache[instanceId];
        }

        clearTimeout(laddaInstance.timer);
        button["disabled"] = true;
        button.setAttribute("data-loading", "true");
        laddaInstance.spinner.spin(button.querySelector(".ladda-spinner"));
    }
    static hideSpin(target: HTMLElement): void {
        if (target == null) {
            return;
        }

        var button = laddaLiteUtils.getTarget(target);
        var instanceId = laddaLiteUtils.getInstanceId(button);
        var laddaInstance = laddaLiteUtils.instanceCache[instanceId];
        if (laddaInstance != null && instanceId != null) {
            button["disabled"] = false;
            button.removeAttribute("data-loading");
            laddaInstance.timer = setTimeout(function () {
                laddaInstance.spinner.stop();
            }, 1000);
        }
    }
}

(function () {
    window["laddaLite"] = laddaLite;
})();
