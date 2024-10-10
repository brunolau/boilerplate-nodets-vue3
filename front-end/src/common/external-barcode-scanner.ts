export function externalBarcodeScanner(this: any) {
    var self = this;
    this.numbersOnly = false;
    this.minChars = 10;
    this.timeOut = 650;
    this.firefoxHack = false;
    this.scanned = null;

    this._chars = [];
    this._pressed = false;
    this._t = null;
    this._charMap = new Object();
    this._initCharMap = function () {
        this._charMap[32] = " ";
        this._charMap[33] = "!";
        this._charMap[34] = '"';
        this._charMap[35] = "#";
        this._charMap[36] = "$";
        this._charMap[37] = "%";
        this._charMap[38] = "&";
        this._charMap[39] = "'";
        this._charMap[40] = "(";
        this._charMap[41] = ")";
        this._charMap[42] = "*";
        this._charMap[43] = "+";
        this._charMap[44] = ",";
        this._charMap[45] = "-";
        this._charMap[46] = ".";
        this._charMap[47] = "/";
        this._charMap[48] = "0";
        this._charMap[49] = "1";
        this._charMap[50] = "2";
        this._charMap[51] = "3";
        this._charMap[52] = "4";
        this._charMap[53] = "5";
        this._charMap[54] = "6";
        this._charMap[55] = "7";
        this._charMap[56] = "8";
        this._charMap[57] = "9";
        this._charMap[58] = ":";
        this._charMap[59] = ";";
        this._charMap[60] = "<";
        this._charMap[61] = "=";
        this._charMap[62] = ">";
        this._charMap[63] = "?";
        this._charMap[64] = "@";
        this._charMap[65] = "A";
        this._charMap[66] = "B";
        this._charMap[67] = "C";
        this._charMap[68] = "D";
        this._charMap[69] = "E";
        this._charMap[70] = "F";
        this._charMap[71] = "G";
        this._charMap[72] = "H";
        this._charMap[73] = "I";
        this._charMap[74] = "J";
        this._charMap[75] = "K";
        this._charMap[76] = "L";
        this._charMap[77] = "M";
        this._charMap[78] = "N";
        this._charMap[79] = "O";
        this._charMap[80] = "P";
        this._charMap[81] = "Q";
        this._charMap[82] = "R";
        this._charMap[83] = "S";
        this._charMap[84] = "T";
        this._charMap[85] = "U";
        this._charMap[86] = "V";
        this._charMap[87] = "W";
        this._charMap[88] = "X";
        this._charMap[89] = "Y";
        this._charMap[90] = "Z";
        this._charMap[91] = "[";
        this._charMap[92] = "\\";
        this._charMap[93] = "]";
        this._charMap[94] = "^";
        this._charMap[95] = "_";
        this._charMap[96] = "`";
        this._charMap[97] = "a";
        this._charMap[98] = "b";
        this._charMap[99] = "c";
        this._charMap[100] = "d";
        this._charMap[101] = "e";
        this._charMap[102] = "f";
        this._charMap[103] = "g";
        this._charMap[104] = "h";
        this._charMap[105] = "i";
        this._charMap[106] = "j";
        this._charMap[107] = "k";
        this._charMap[108] = "l";
        this._charMap[109] = "m";
        this._charMap[110] = "n";
        this._charMap[111] = "o";
        this._charMap[112] = "p";
        this._charMap[113] = "q";
        this._charMap[114] = "r";
        this._charMap[115] = "s";
        this._charMap[116] = "t";
        this._charMap[117] = "u";
        this._charMap[118] = "v";
        this._charMap[119] = "w";
        this._charMap[120] = "x";
        this._charMap[121] = "y";
        this._charMap[122] = "z";
        this._charMap[123] = "{";
        this._charMap[124] = "|";
        this._charMap[125] = "}";
        this._charMap[126] = "~";
        this._charMap[127] = "";
        this._charMap[128] = "€";
        this._charMap[129] = "";
        this._charMap[130] = "‚";
        this._charMap[131] = "ƒ";
        this._charMap[132] = "„";
        this._charMap[133] = "…";
        this._charMap[134] = "†";
        this._charMap[135] = "‡";
        this._charMap[136] = "ˆ";
        this._charMap[137] = "‰";
        this._charMap[138] = "Š";
        this._charMap[139] = "‹";
        this._charMap[140] = "Œ";
        this._charMap[141] = "";
        this._charMap[142] = "Ž";
        this._charMap[143] = "";
        this._charMap[144] = "";
        this._charMap[145] = "‘";
        this._charMap[146] = "’";
        this._charMap[147] = "“";
        this._charMap[148] = "”";
        this._charMap[149] = "•";
        this._charMap[150] = "–";
        this._charMap[151] = "—";
        this._charMap[152] = "˜";
        this._charMap[153] = "™";
        this._charMap[154] = "š";
        this._charMap[155] = "›";
        this._charMap[156] = "œ";
        this._charMap[157] = "";
        this._charMap[158] = "ž";
        this._charMap[159] = "Ÿ";
        this._charMap[160] = "";
        this._charMap[161] = "¡";
        this._charMap[162] = "¢";
        this._charMap[163] = "£";
        this._charMap[164] = "¤";
        this._charMap[165] = "¥";
        this._charMap[166] = "¦";
        this._charMap[167] = "§";
        this._charMap[168] = "¨";
        this._charMap[169] = "©";
        this._charMap[170] = "ª";
        this._charMap[171] = "«";
        this._charMap[172] = "¬";
        this._charMap[173] = "";
        this._charMap[174] = "®";
        this._charMap[175] = "¯";
        this._charMap[176] = "°";
        this._charMap[177] = "±";
        this._charMap[178] = "²";
        this._charMap[179] = "³";
        this._charMap[180] = "´";
        this._charMap[181] = "µ";
        this._charMap[182] = "¶";
        this._charMap[183] = "·";
        this._charMap[184] = "¸";
        this._charMap[185] = "¹";
        this._charMap[186] = "º";
        this._charMap[187] = "»";
        this._charMap[188] = "¼";
        this._charMap[189] = "½";
        this._charMap[190] = "¾";
        this._charMap[191] = "¿";
        this._charMap[192] = "À";
        this._charMap[193] = "Á";
        this._charMap[194] = "Â";
        this._charMap[195] = "Ã";
        this._charMap[196] = "Ä";
        this._charMap[197] = "Å";
        this._charMap[198] = "Æ";
        this._charMap[199] = "Ç";
        this._charMap[200] = "È";
        this._charMap[201] = "É";
        this._charMap[202] = "Ê";
        this._charMap[203] = "Ë";
        this._charMap[204] = "Ì";
        this._charMap[205] = "Í";
        this._charMap[206] = "Î";
        this._charMap[207] = "Ï";
        this._charMap[208] = "Ð";
        this._charMap[209] = "Ñ";
        this._charMap[210] = "Ò";
        this._charMap[211] = "Ó";
        this._charMap[212] = "Ô";
        this._charMap[213] = "Õ";
        this._charMap[214] = "Ö";
        this._charMap[215] = "×";
        this._charMap[216] = "Ø";
        this._charMap[217] = "Ù";
        this._charMap[218] = "Ú";
        this._charMap[219] = "Û";
        this._charMap[220] = "Ü";
        this._charMap[221] = "Ý";
        this._charMap[222] = "Þ";
        this._charMap[223] = "ß";
        this._charMap[224] = "à";
        this._charMap[225] = "á";
        this._charMap[226] = "â";
        this._charMap[227] = "ã";
        this._charMap[228] = "ä";
        this._charMap[229] = "å";
        this._charMap[230] = "æ";
        this._charMap[231] = "ç";
        this._charMap[232] = "è";
        this._charMap[233] = "é";
        this._charMap[234] = "ê";
        this._charMap[235] = "ë";
        this._charMap[236] = "ì";
        this._charMap[237] = "í";
        this._charMap[238] = "î";
        this._charMap[239] = "ï";
        this._charMap[240] = "ð";
        this._charMap[241] = "ñ";
        this._charMap[242] = "ò";
        this._charMap[243] = "ó";
        this._charMap[244] = "ô";
        this._charMap[245] = "õ";
        this._charMap[246] = "ö";
        this._charMap[247] = "÷";
        this._charMap[248] = "ø";
        this._charMap[249] = "ù";
        this._charMap[250] = "ú";
        this._charMap[251] = "û";
        this._charMap[252] = "ü";
        this._charMap[253] = "ý";
        this._charMap[254] = "þ";
        this._charMap[255] = "ÿ";
    };
    this._initCharMap();

    this._onKeyUp = function (e) {
        var value = e.which ? e.which : e.keyCode;
        console.log(value);

        if (value > 31) {
            clearTimeout(self._t);
            self._pressed = false;

            //var inputVal = String.fromCharCode(value);
            var inputVal = self._charMap[value];
            if (inputVal == null || inputVal.length == 0) {
                inputVal = String.fromCharCode(value);
            }

            if (self.numbersOnly) {
                if (value >= 48 && value <= 57) {
                    self._chars.push(inputVal);
                }
            } else {
                self._chars.push(inputVal);
            }

            if (self._pressed == false) {
                self._pressed = true; // <- SET THIS BEFORE SETTING THE TIMER
                self._t = setTimeout(function () {
                    // = 10) {
                    self._verify();
                    self._cleanUp();
                }, self.timeOut);
            }
        }
    };

    this.register = function () {
        self._chars = [];
        self._pressed = false;
        window["jQuery"](window).on("keyup", self._onKeyUp);
    };

    this.unregister = function () {
        window["jQuery"].off("keyup", self._onKeyUp);
    };

    this._pushChar = function (which) {
        self._chars.push(String.fromCharCode(which));
        //self._verify();
    };

    this._verify = function () {
        if (self._chars.length >= self.minChars) {
            var barcode = self._chars.join("");
            var firstThree = barcode.substring(0, 3);

            if (self.firefoxHack && !isNaN(firstThree)) {
                var firstThreeNum = Number(firstThree);
                if (firstThreeNum < 255) {
                    var charVal = String.fromCharCode(firstThreeNum);
                    if (charVal == self._chars[3]) {
                        var textLength = barcode.length;
                        var retVal = "";

                        if (textLength % 4 == 0) {
                            for (var i = 3; i < textLength; i += 4) {
                                retVal += self._chars[i];
                            }
                        }

                        if (retVal.length >= self.minChars) {
                            barcode = retVal;
                        }
                    }
                }
            }

            if (self.scanned != null) {
                if (barcode != null) {
                    barcode = barcode
                        .replace(/(\r\n|\n|\r)/gm, "")
                        .split("»")
                        .join("1");
                }

                self.scanned(barcode);
                self._cleanUp();
            }
        }
    };

    this._cleanUp = function () {
        clearTimeout(self._t); // <- CLEAR TIMER IF IS NOT BARCODE
        self._chars = [];
        self._pressed = false;
    };
}
