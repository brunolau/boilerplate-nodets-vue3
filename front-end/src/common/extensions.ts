interface Array<T> {
    /**
     * Removes given items from the Array
     *
     * @param items Items that should be removed from the Array
     */
    remove(...items: T[]): void;

    /**
     * Inserts item into the Array at given index
     *
     * @param items Item that should be added to the Array
     * @param index Index at which the item should be added
     */
    insertAt(item: T, index: number): void;

    /**
     * Sorts array by given property
     *
     * @param propName Property name (or function returning the sort key), the array should be sorted by
     */
    sortBy(propName: string | ((item: T) => string | number)): Array<T>;

    /**
     * Clones current array into new instance
     */
    clone(): Array<T>;

    /**
     * Determines if current array contains given object
     *
     * @param str Obj that should be checked
     */
    contains(item: T): boolean;

    /**
     * LINQ Min function equivalent - returns lowest value from the collection
     *
     * @param callbackfn Lambda containing the desired property
     * @param defaultValue Default value for case when sequence contains no elements
     *
     */
    min(callbackfn: (value: T, index: number, array: T[]) => number, defaultValue?: number): number;

    /**
     * LINQ Max function equivalent - returns highest value from the collection
     *
     * @param callbackfn Lambda containing the desired property
     * @param defaultValue Default value for case when sequence contains no elements
     *
     */
    max(callbackfn: (value: T, index: number, array: T[]) => number, defaultValue?: number): number;

    /**
     * LINQ Sum function equivalent - returns sum of the collection
     *
     * @param callbackfn Lambda containing the desired property
     * @param defaultValue Default value for case when sequence contains no elements
     *
     */
    sum(callbackfn: (value: T, index: number, array: T[]) => number, defaultValue?: number): number;

    /**
     * LINQ SelectMany function equivalent - returns flatten collection of array's subcollection
     *
     * @param callbackfn Lambda containing the desired property
     * @param thisArg
     */
    selectMany<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U;

    /**
     * LINQ Distinct function equivalent - returns array with distinct items
     *
     * @param callbackfn Lambda containing the desired property
     * @param thisArg
     */
    distinct<U>(): U;
}

interface String {
    /**
     * Returns capitalized string (with leading letter ensured in capitals)
     *
     * @param str String that should be capitalized
     */
    capitalize(): string;

    /**
     * Returns latinized string (with local accents replaced with ASCII ones)
     *
     * @param str String that should be latinized
     */
    latinize(): string;

    /**
     * Determines if current string ends with given string
     *
     * @param str String that should be checked
     */
    endsWith(str: string): boolean;

    /**
     * Determines if current string contains given substring
     *
     * @param str String that should be checked
     */
    contains(str: string): boolean;

    /**
     * Replaces one or more format items in the string with the string specification of specified object
     *
     * @param args Format objects
     */
    format(...args: Array<string | number>): string;

    /**
     * Determines if current string starts with given string
     *
     * @param str String that should be checked
     */
    startsWith(str: string): boolean;

    /**
     * Replaces all occurences of a text in a string, using a search string.
     * @param searchValue A string to search for.
     * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
     */
    replaceAll(searchValue: string, replaceValue: string): string;
}

interface ObjectConstructor {
    /**
     * Copy the values of all of the enumerable own properties from one or more source objects to a
     * target object. Returns the target object.
     * @param target The target object to copy to.
     * @param source The source object from which to copy properties.
     */
    assign<T, U>(target: T, source: U): T & U;

    /**
     * Copy the values of all of the enumerable own properties from one or more source objects to a
     * target object. Returns the target object.
     * @param target The target object to copy to.
     * @param source1 The first source object from which to copy properties.
     * @param source2 The second source object from which to copy properties.
     */
    assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;

    /**
     * Copy the values of all of the enumerable own properties from one or more source objects to a
     * target object. Returns the target object.
     * @param target The target object to copy to.
     * @param source1 The first source object from which to copy properties.
     * @param source2 The second source object from which to copy properties.
     * @param source3 The third source object from which to copy properties.
     */
    assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;

    /**
     * Copy the values of all of the enumerable own properties from one or more source objects to a
     * target object. Returns the target object.
     * @param target The target object to copy to.
     * @param sources One or more source objects from which to copy properties
     */
    assign(target: object, ...sources: any[]): any;
}

interface EntityWithLength {
    length: number;
}

function isNullOrEmpty(val: EntityWithLength) {
    return val == null || val.length == 0;
}

(function () {
    window["isNullOrEmpty"] = isNullOrEmpty;

    if (!Array.prototype.remove) {
        Array.prototype.remove = function (items: []): void {
            for (var i = 0, len = arguments.length; i < len; i++) {
                var item = arguments[i];
                var itemIndex = this.indexOf(item);

                if (itemIndex > -1) {
                    this.splice(itemIndex, 1);
                }
            }
        };
    }

    if (!Array.prototype.clone) {
        Array.prototype.clone = function () {
            return this.slice(0);
        };
    }

    if (!Array.prototype.insertAt) {
        Array.prototype.insertAt = function (item, index) {
            this.splice(index, 0, item);
        };
    }

    if (!Array.prototype.contains) {
        Array.prototype.contains = function (item) {
            if (item != null) {
                var idProp = "Id";
                if (item[idProp] == null) {
                    idProp = "id";
                }

                var idVal = item[idProp];
                if (idVal != null && this.length > 0) {
                    for (let i = 0, len = this.length; i < len; i++) {
                        if (this[i][idProp] == idVal) {
                            return true;
                        }
                    }
                }
            }

            return this.indexOf(item) > -1;
        };
    }

    if (!Array.prototype.min) {
        Array.prototype.min = function <T>(callbackfn: (value: T, index: number, array: T[]) => number, defaultValue?: number): number {
            if (this.length == 0) {
                return defaultValue;
            }

            return this.reduce((prevVal, u, i) => Math.min(prevVal, callbackfn(u, i, this)), Number.MAX_VALUE);
        };
    }

    if (!Array.prototype.max) {
        Array.prototype.max = function <T>(callbackfn: (value: T, index: number, array: T[]) => number, defaultValue?: number): number {
            if (this.length == 0) {
                return defaultValue;
            }

            return this.reduce((prevVal, u, i) => Math.max(prevVal, callbackfn(u, i, this)), 0);
        };
    }

    if (!Array.prototype.sum) {
        Array.prototype.sum = function <T>(callbackfn: (value: T, index: number, array: T[]) => number, defaultValue?: number): number {
            if (this.length == 0) {
                return defaultValue;
            }

            return this.reduce((prevVal, u, i) => prevVal + callbackfn(u, i, this), 0);
        };
    }

    if (!Array.prototype.selectMany) {
        Array.prototype.selectMany = function (callback): any {
            return this.reduce((prevVal, u, i) => [...prevVal, ...(callback(u, i, this) as any)], []);
        };
    }

    if (!Array.prototype.distinct) {
        Array.prototype.distinct = function (): any {
            return this.reduce((un, u) => ({ ...un, u }), {});
        };
    }

    if (!(Array.prototype as any).find) {
        (Array.prototype as any).find = function (callback) {
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            for (var i = 0; i < length; i++) {
                var element = list[i];
                if (callback.call(thisArg, element, i, list)) {
                    return element;
                }
            }
        };
    }

    if (!Array.prototype.sortBy) {
        Array.prototype.sortBy = function <T>(propName: string | ((item: T) => string | number)): Array<T> {
            function dynamicSort(property) {
                if (propName && {}.toString.call(propName) === "[object Function]") {
                    return function (a, b) {
                        var v1 = (<any>propName)(a);
                        var v2 = (<any>propName)(b);

                        if (!!(v1.constructor && v1.call && v1.apply)) {
                            v1 = v1();
                        }
                        if (!!(v2.constructor && v2.call && v2.apply)) {
                            v2 = v2();
                        }

                        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
                    };
                } else {
                    var propArr: string[] = property;
                    if (typeof property === "string" || property instanceof String) {
                        propArr = <any>[property];
                    }

                    return function (a, b) {
                        for (var i = 0, len = propArr.length; i < len; i++) {
                            var currProp = propArr[i],
                                sortOrder = 1;
                            if (currProp[0] === "-") {
                                sortOrder = -1;
                                currProp = currProp.substr(1);
                            }

                            var aVal = a[currProp],
                                bVal = b[currProp];
                            if (!!(aVal.constructor && aVal.call && aVal.apply)) {
                                aVal = aVal();
                            }
                            if (!!(bVal.constructor && bVal.call && bVal.apply)) {
                                bVal = bVal();
                            }

                            var result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                            if (result != 0) {
                                return result * sortOrder;
                            }
                        }

                        return 0;
                    };
                }
            }

            this.sort(dynamicSort(propName));
            return this;
        };
    }

    if (typeof String.prototype.trim !== "function") {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    String.prototype["format"] = function () {
        var args = arguments;
        return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
            if (m == "{{") {
                return "{";
            }
            if (m == "}}") {
                return "}";
            }
            return args[n];
        });
    };

    String.prototype.replaceAll = function (search, replacement) {
        return this.split(search).join(replacement);
    };

    if (typeof String.prototype.startsWith != "function") {
        String.prototype.startsWith = function (str) {
            return this.indexOf(str) == 0;
        };
    }

    if (typeof String.prototype.contains != "function") {
        String.prototype.contains = function (str) {
            return this.indexOf(str) > -1;
        };
    }

    if (!String.prototype["endsWith"]) {
        String.prototype["endsWith"] = function (suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

    if (!String.prototype["capitalize"]) {
        String.prototype["capitalize"] = function () {
            if (this != null) {
                if (this.length > 1) {
                    return this.charAt(0).toUpperCase() + this.slice(1);
                } else {
                    return this.toUpperCase();
                }
            } else {
                return null;
            }
        };
    }

    if (typeof String.prototype.latinize != "function") {
        String.prototype.latinize = function (): string {
            try {
                return (<any>this).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            } catch (e) {
                return this as any;
            }
        };
    }

    if (!FileReader.prototype.readAsBinaryString) {
        FileReader.prototype.readAsBinaryString = function (fileData) {
            var binary = "";
            var pt = this;
            var reader = new FileReader();
            reader.onload = function (e) {
                var bytes = new Uint8Array((reader as any).result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                //pt.result  - readonly so assign binary
                pt["content"] = binary;

                var event = document.createEvent("HTMLEvents");
                event.initEvent("onload", true, false);
                pt.dispatchEvent(event);
            };
            reader.readAsArrayBuffer(fileData);
        };
    }

    (function () {
        if (typeof Object.assign != "function") {
            Object.assign = function (target, varArgs) {
                // .length of function is 2
                "use strict";
                if (target == null) {
                    // TypeError if undefined or null
                    throw new TypeError("Cannot convert undefined or null to object");
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) {
                        // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            };
        }
    })();
})();
