import { GOOGLE_API_KEY } from "./apiKey";

export default class GoogleMapsApiLoader {
    static load(): Promise<boolean> {
        return new Promise(function (resolve, reject) {
            if (GoogleMapsApiLoader.apiLoaded()) {
                resolve(true);
                return;
            }

            if (GoogleMapsApiLoader["_loading"] == null) {
                GoogleMapsApiLoader["_loading"] = true;
            } else {
                var looper = function () {
                    if (GoogleMapsApiLoader.apiLoaded()) {
                        resolve(true);
                    } else {
                        setTimeout(function () {
                            looper();
                        }, 50);
                    }
                };

                looper();
                return;
            }

            var script = document.createElement("script");
            script.async = true;
            script.defer = true;
            script.onload = function () {
                delete GoogleMapsApiLoader["_loading"];
                resolve(true);
            };
            script.onerror = function (e) {
                delete GoogleMapsApiLoader["_loading"];
                reject(false);
            };
            script.src = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_API_KEY + "&libraries=places";
            document.head.appendChild(script);
        });
    }

    private static apiLoaded(): boolean {
        return window["google"] && window["google"].maps && window["google"].maps.places && window["google"].maps.places.Autocomplete;
    }
}
