// Class helping in correct domain obtaining for API calls and other purposes
class domainHelper {
    /**
     * Get domain path for cookie storage.
     */
    static getCookieDomain(): string {
        let schemeEndIndex = location.href.indexOf("//");
        let domainHost = location.href
            .substring(schemeEndIndex + 2)
            .split("/")[0]
            .split(":")[0]
            .trim();
        if (domainHost.toLowerCase().indexOf("www.") == 0) {
            domainHost = domainHost.substring(4);
        }

        if (domainHost.split(".").length == 2) {
            return domainHost;
        } else {
            return "";
        }
    }

    /**
     * Get domain from given URL string
     *
     * @param url URL from which the domain should be extracted
     * @param includeScheme  Determines if the scheme (http:// or https://) should be included [defaults false]
     * @param stripLeadingWWW  Strips leading www if present [defaults false]
     */
    static getDomainFromUrl(url: string, includeScheme?: boolean, stripLeadingWWW?: boolean) {
        let schemeEndIndex = url.indexOf("//");
        let scheme = url.substring(0, schemeEndIndex - 1);
        let domainAuthority = url.substring(schemeEndIndex + 2).split("/")[0];
        let schemePrefix = "";

        if (includeScheme) {
            schemePrefix += scheme + "://";
        }
        if (stripLeadingWWW && domainAuthority.toLowerCase().indexOf("www.") == 0) {
            domainAuthority = domainAuthority.substring(4);
        }

        return schemePrefix + domainAuthority;
    }

    /**
     * Get current domain
     *
     * @param includeScheme  Determines if the scheme (http:// or https://) should be included  [defaults false]
     * @param stripLeadingWWW  Strips leading www if present  [defaults false]
     */
    static getDomain(includeScheme?: boolean, stripLeadingWWW?: boolean) {
        return domainHelper.getDomainFromUrl(location.href, includeScheme, stripLeadingWWW);
    }

    /**
     * Get current domain base (e.g. https://www.inviton.sk/one/two becomes https://www.inviton.sk)
     */
    static getDomainForHttpLinks() {
        return domainHelper.getDomain(true, false);
    }
}

window["domainHelper"] = domainHelper;
