export default class ChartColorHelper {
    static getColors(count: number): string[] {
        if (count == null || count < 1) {
            return [];
        }

        const BASE_COLORS = ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"];
        const BASE_COLORS_COUNT = BASE_COLORS.length;
        let variation = 0;
        let retVal = [];

        for (let i = 0; i < count; i++) {
            var colorItem = ColorWrapper.fromString(BASE_COLORS[i % BASE_COLORS_COUNT] || "#666");
            if (i % BASE_COLORS_COUNT == 0 && i) {
                if (variation >= 0) {
                    if (variation < 0.5) {
                        variation = -variation - 0.2;
                    } else variation = 0;
                } else variation = -variation;
            }

            retVal.push(colorItem.scale(1 + variation).toString());
        }

        return retVal;
    }
}

class ColorWrapper {
    r: number;
    g: number;
    b: number;

    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    scale(scaleFactor): ColorWrapper {
        const RGB = "rgb";
        for (var i = 0; i < RGB.length; ++i) {
            this[RGB.charAt(i)] *= scaleFactor;
        }

        return this.normalize();
    }

    toString(): string {
        return "rgb(" + [this.r, this.g, this.b].join(",") + ")";
    }

    normalize(): ColorWrapper {
        function clamp(min, value, max) {
            return Math.round(value < min ? min : value > max ? max : value);
        }

        this.r = clamp(0, this.r, 255);
        this.g = clamp(0, this.g, 255);
        this.b = clamp(0, this.b, 255);
        return this;
    }

    clone() {
        return new ColorWrapper(this.r, this.b, this.g);
    }

    static fromString(str: string): ColorWrapper {
        var res,
            m = ColorWrapper.createInstance;

        // Look for rgb(num,num,num)
        if ((res = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str))) return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10));

        // Look for rgba(num,num,num,num)
        if ((res = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)))
            return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10));

        // Look for rgb(num%,num%,num%)
        if ((res = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str)))
            return m(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55);

        // Look for rgba(num%,num%,num%,num)
        if ((res = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)))
            return m(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55);

        // Look for #a0b1c2
        if ((res = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str))) return m(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16));

        // Look for #fff
        if ((res = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str))) return m(parseInt(res[1] + res[1], 16), parseInt(res[2] + res[2], 16), parseInt(res[3] + res[3], 16));

        // Otherwise, we're most likely dealing with a named color
        var name = $.trim(str).toLowerCase();
        if (name == "transparent") return m(255, 255, 255);
        else {
            throw "Use HEX code and it will be just fine..";
        }
    }

    private static createInstance(r, g, b) {
        return new ColorWrapper(r, g, b);
    }
}
