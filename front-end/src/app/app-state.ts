class AppState {
    static _stickyMap: { [index: string]: IStickyDeclaration } = {}
    static _vueInstance: IVue = null
    static _state: IInitialState = null

    static get appName(): string {
        return "TMR DWH"
    }

    static get router(): IVueRouter {
        return AppRouterAccessor.instance.currentRouter
    }

    static get currentAppRoute(): IAppRoute {
        var retVal = AppRouterAccessor.instance.getRouteByName(AppState.router.currentRoute.value.name)
        if (retVal == null) {
            retVal = AppRouterAccessor.instance.getPossibleInitialRoute()
        }

        return retVal
    }

    static get currentLanguage(): Language {
        return AppState.initialState.Language
    }

    static get currentLanguageCode(): string {
        return LanguageUtils.getLanguageCode(AppState.currentLanguage)
    }

    static get resources(): IAppResources {
        return LanguageProviderAccessor.instance.getResourcePack(AppState.currentLanguage)
    }

    static get user(): ISessionUser {
        return AppState.initialState.User
    }

    static get currentResortId(): number {
        return null
    }

    static get isDevMode(): boolean {
        return location.href.indexOf("http://localhost:8080") > -1
    }

    static get loginViaActiveDirectory(): boolean {
        if (AppState.isDevMode) {
            return false
        }

        if (localStorage.getItem("lastLoginType") == "legacy") {
            return false
        }

        return true
    }

    static registerStickyTabs(id: string, state: IStickyDeclaration): void {
        AppState._stickyMap[id] = state
    }

    static unregisterStickyTabs(id: string): void {
        if (AppState._stickyMap[id] != null) {
            try {
                delete AppState._stickyMap[id]
            } catch (e) {}
        }
    }

    static setLanguage(langCode: string, redir?: boolean): void {
        var expirationDate = new Date()
        expirationDate.setFullYear(expirationDate.getFullYear() + 10)
        cookieProvider.set("invLang", langCode, expirationDate)

        if (redir == true) {
            var docUrl = document.URL
            docUrl = docUrl
                .replace(new RegExp("[?&]" + "lang" + "=[^&#]*(#.*)?$"), "$1")
                .replace(new RegExp("([?&])" + "lang" + "=[^&]*&"), "$1")
                .replace(new RegExp("[?&]" + "language" + "=[^&#]*(#.*)?$"), "$1")
                .replace(new RegExp("([?&])" + "language" + "=[^&]*&"), "$1")

            $("body").html(AppConfig.intransparentBlockerHtml)
            setTimeout(function () {
                location.href = docUrl
            }, 150)
        }
    }

    static get tokenExpiryMs(): number {
        return 6300000 //105 minutes
    }

    static setUser(userData: ISessionUser, storeLocally: boolean) {
        if (userData != null && userData.ExpiresAt == null) {
            userData.ExpiresAt = new Date().getTime() + this.tokenExpiryMs
        }

        AppState.initialState.User = userData

        if (AppState._vueInstance && !isNullOrEmpty(AppState._vueInstance.$children)) {
            ;(AppState._vueInstance.$children[0] as any).userDummy += 1
        }

        if (storeLocally) {
            localStorage.setItem("appUser", JSON.stringify(userData))
        }
    }

    static get stickyTabs(): IStickyDeclaration {
        for (let id in AppState._stickyMap) {
            if (AppState._stickyMap[id].HasSticky) {
                return AppState._stickyMap[id]
            }
        }

        return {
            AllowTabChange: true,
            HasSticky: false,
        }
    }

    static get modalSectionMode(): ModalSectionMode {
        if ((AppState as any)._modalSectionMode == null) {
            if (localStorage.getItem("modalSectionMode") != null) {
                ;(AppState as any)._modalSectionMode = Number(localStorage.getItem("modalSectionMode"))
            } else {
                AppState.setModalSectionMode(ModalSectionMode.fieldSet)
            }
        }

        return (AppState as any)._modalSectionMode
    }

    static setModalSectionMode(mode: ModalSectionMode): void {
        localStorage.setItem("modalSectionMode", mode.toString())
        ;(AppState as any)._modalSectionMode = mode
    }

    private static get initialState(): IInitialState {
        if (this._state != null) {
            return this._state
        }

        let serverProvided = (window as any).initialState
        if (serverProvided != null) {
            this._state = serverProvided
            return this._state
        }

        let userLang = this.getCurrentLanguage()
        if (userLang == null) {
            userLang = this.autoDetectLanguage()
            this.setLanguage(LanguageUtils.getLanguageCode(userLang), false)
        }

        this._state = {
            Language: userLang,
            User: this.getCurrentUser(),
        }

        return this._state
    }

    private static getCurrentUser(): ISessionUser {
        const storedVal = (localStorage.getItem("appUser") || "").trim()
        let user: ISessionUser

        if (!isNullOrEmpty(storedVal) && storedVal != "null") {
            user = JSON.parse(storedVal)
            if (user.ExpiresAt > 0) {
                const now = new Date().getTime()
                try {
                    const validRemaining = user.ExpiresAt - now

                    if (validRemaining < 0) {
                        localStorage.removeItem("appUser")
                        user = null
                    }
                } catch (error) {
                    localStorage.removeItem("appUser")
                    user = null
                }
            }
        }

        if (user == null) {
            const currentUrl = location.href
            let needsRedir = true
            try {
                const routes = AppRouterAccessor.instance.currentRouter.getRoutes()

                for (const route of routes) {
                    if (route.path == null) {
                        continue
                    }

                    if (currentUrl.contains(route.path.split("/:")[0]) && route.path != "/") {
                        if (route.meta.requiresAuth == false) {
                            needsRedir = false
                            break
                        }
                    }
                }
            } catch (error) {
                needsRedir = false
            }

            if (needsRedir) {
                if (AppState.loginViaActiveDirectory) {
                    if (location.href.indexOf("meteo.tmr.sk") > -1) {
                        location.href = "https://meteo.tmr.sk/login"
                    } else {
                        location.href = "/login"
                    }
                } else {
                    if (location.href.indexOf("meteo.tmr.sk") > -1) {
                        location.href = "https://meteo.tmr.sk/login-legacy"
                    } else {
                        location.href = "/login-legacy"
                    }
                }
            }
        }

        return user
    }

    private static getCurrentLanguage(): Language {
        let cookieLang = cookieProvider.read("invLang")
        if (!isNullOrEmpty(cookieLang)) {
            return LanguageUtils.getLanguageEnum(cookieLang)
        }

        return null
    }

    private static autoDetectLanguage(): Language {
        let userLang = (navigator.language || navigator["userLanguage"] || "").toLocaleLowerCase()
        if (userLang.indexOf("sk") > -1) {
            return Language.Slovak
        } else if (userLang.indexOf("cs") > -1 || userLang.indexOf("cz") > -1) {
            return Language.Czech
        } else if (userLang.indexOf("en") > -1) {
            return Language.English
            //  return 'de';
        } else if (userLang.indexOf("de") > -1) {
            //  return 'de';
        } else if (userLang.indexOf("pl") > -1) {
            // return 'pl';
        } else if (userLang.indexOf("hu") > -1) {
            // return 'hu';
        } else {
            // return 'en';
        }

        return Language.Slovak
    }
}

interface IStickyDeclaration {
    HasSticky: boolean
    AllowTabChange: boolean
}

interface IInitialState {
    Language: Language
    User: ISessionUser
}

interface ISessionUser {
    ExpiresAt: number
    Token: string
    Profile: UserProfile
}

class UserProfile {
    id: number = null
    fullName: string = null
    name: string = null
    surname: string = null
    email: string = null
    phone: string = null
    permissions: UserPermissionModel[]
}

class UserRoleModel {
    id: number = null
    name: string = null
    permissions: UserPermissionModel[] = null
}

class UserPermissionModel {
    key: string = null
    groupKey: string
}

window["AppState"] = AppState
