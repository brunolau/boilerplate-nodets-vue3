// Cookie manipulation abstraction
class cookieProvider {
    /**
     * Sets cookie value
     *
     * @param name  Name of the cookie
     * @param value Cookie value
     * @param expiration When the cookie should expire, set as a past date in order to delete the cookie
     */
    static set(name: string, value: string, expiration?: Date) {
        let domain = domainHelper.getCookieDomain();
        if (domain.length > 0) {
            domain = ";domain=." + domain;
        }

        let realExpiration;
        if (expiration != null) {
            realExpiration = expiration.toUTCString();
        } else {
            realExpiration = "";
        }

        document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + ";expires=" + expiration + domain + ";path=/";
    }

    /**
     * Obtains cookie value
     *
     * @param name  Name of the cookie
     */
    static read(name: string): string {
        name = name + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return null;
    }

    /**
     * Removes cookie
     *
     * @param name  Name of the cookie
     */
    static remove(name: string) {
        let someDate = new Date(); // add arguments as needed
        someDate.setTime(someDate.getTime() - 3 * 28 * 24 * 60 * 60);
        cookieProvider.set(name, "", someDate);
    }
}

window["cookieProvider"] = cookieProvider;
