import { toNative, Vue } from "vue-facing-decorator"
import ToolbarUserMenu from "../../components/toolbar-user/toolbar-user"
import RootDynamicComponentContainer from "./root-dynamic-component-container"
import LoginModal from "../../components/account/login/login-modal"
import "./../../app/css/common-components.css"
import "./../../app/css/bootstrap-overrides.css"
import "./../../app/css/app.css"
// import "./../../app/css/custom.css";
import "./css/navmenu.css"
import HtmlLiteral from "../html-literal/html-literal"
import { Component } from "../../app/vuetsx"

export interface ILazyLoadedModal {
    id: string
    render: (h) => any
}

interface ParsedMenuItem {
    iconPart: any
    textPart: any
    isSeparator: boolean
    hasChildren: boolean
}

@Component
class AppEntryComponent extends Vue {
    fullScreen: boolean
    hideMenu: boolean
    hideHeader: boolean
    customCssClass: string
    queryRead: boolean = undefined
    breadcrumbItems: BreadcrumbItem[] = []
    menuItems: AppMenuItem[] = []
    lazyLoadedModals: ILazyLoadedModal[] = []
    userDummy: number = 0

    mounted() {}

    handleQuery() {
        if (!this.queryRead) {
            this.fullScreen = QueryStringUtils.getBool("fullscreen", false)
            if (!this.fullScreen) {
                this.fullScreen = QueryStringUtils.getBool("iframe", false)
            }

            if (AppState.currentAppRoute.fullScreen == true) {
                this.fullScreen = true
            }

            this.hideMenu = QueryStringUtils.getBool("hidemenu", false)
            this.hideHeader = QueryStringUtils.getBool("hideheader", false)
            this.customCssClass = QueryStringUtils.getString("cssclass", null)
            this.queryRead = true

            if (AppState.currentAppRoute.hideMenu == true) {
                this.hideMenu = true
            }
        }

        this.handleDocumentTitle()
    }

    handleDocumentTitle() {
        let title = AppState.appName
        let route = AppState.currentAppRoute
        let routeTitle = this.getRouteTitle(route)

        if (!isNullOrEmpty(routeTitle)) {
            title = routeTitle + " | " + title
        }

        document.title = title
    }

    getRouteTitle(route: IAppRoute): string {
        let sectionTitle: string
        if (route != null && route.title != null) {
            try {
                sectionTitle = route.title()
            } catch (e) {}
        }

        return sectionTitle
    }

    getRouteSubtitle(route: IAppRoute): string {
        let sectionSubtitle: string
        if (route != null && route.subtitle != null) {
            try {
                sectionSubtitle = route.subtitle()
            } catch (e) {}
        }

        return sectionSubtitle
    }

    getRootCssClass(): string {
        return (
            "container-scroller " +
            (this.fullScreen ? "inv-full-screen " : "") +
            (this.hideMenu ? "inv-no-menu " : "") +
            (this.hideHeader ? "inv-no-header " : "") +
            (this.customCssClass || "")
        )
    }

    handleMenuItemOnClick(menuItem: AppMenuItem) {
        portalUtils.handleMobileMenuClick()
        menuItem.onClick()
    }

    render(h) {
        this.handleQuery()
        const langList = LanguageUtils.getLanguageList()
        const currLang = langList.find((p) => p.id == AppState.currentLanguage)

        return (
            <div id="app-root" class={this.getRootCssClass()}>
                {this.fullScreen != true && (
                    <nav class="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
                        <div class="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
                            <a class="navbar-brand brand-logo" href="/">
                                <img src="/assets/img/tmr-logo-small-white.png" alt="logo" />
                            </a>
                            <a class="navbar-brand brand-logo-mini" href="/">
                                <img src="/assets/img/tmr-logo-icons-only.png" alt="logo" />
                            </a>
                        </div>
                        <div class="navbar-menu-wrapper d-flex align-items-stretch">
                            {this.hideMenu != true && (
                                <button
                                    class="navbar-toggler navbar-toggler align-self-center"
                                    type="button"
                                    onClick={(e) => {
                                        $("body").toggleClass("sidebar-icon-only")
                                    }}
                                >
                                    <span class="mdi mdi-menu"></span>
                                </button>
                            )}
                            <div class="d-none d-xl-flex justify-content-center flex-column m-0">
                                <h5 class="m-0">{this.getRouteTitle(AppState.currentAppRoute)}</h5>
                                <p class="m-0">{this.getRouteSubtitle(AppState.currentAppRoute)}</p>
                            </div>

                            <ul class="navbar-nav navbar-nav-right">
                                <li class="nav-item nav-language dropdown d-none d-md-block">
                                    <a
                                        class="nav-link dropdown-toggle"
                                        id="languageDropdown"
                                        href="#"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <div class="nav-language-icon">
                                            <img src={LanguageUtils.getLanguageFlagUrl(currLang.flag, false)} />
                                        </div>
                                        <div class="nav-language-text">
                                            <p class="mb-1">{currLang.text}</p>
                                        </div>
                                    </a>
                                    <div class="dropdown-menu navbar-dropdown" aria-labelledby="languageDropdown">
                                        {this.renderMenuLanguageItem(
                                            h,
                                            langList.filter((p) => p.id == Language.German)[0],
                                            "Deutsch"
                                        )}
                                        {this.renderMenuLanguageItem(
                                            h,
                                            langList.filter((p) => p.id == Language.English)[0],
                                            "English"
                                        )}
                                        {this.renderMenuLanguageItem(
                                            h,
                                            langList.filter((p) => p.id == Language.Polish)[0],
                                            "Polski"
                                        )}
                                        {this.renderMenuLanguageItem(
                                            h,
                                            langList.filter((p) => p.id == Language.Slovak)[0],
                                            "Slovensky"
                                        )}
                                    </div>
                                </li>

                                {AppState.user != null && (
                                    <li class="nav-item nav-profile dropdown">
                                        <a
                                            class="nav-link dropdown-toggle"
                                            id="profileDropdown"
                                            href="#"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <p class="mb-1">
                                                <span class="d-none d-lg-inline-block">
                                                    {AppState.user.Profile.fullName}
                                                </span>
                                                <span class="d-inline-block d-lg-none">
                                                    <i class="fas fa-user"></i>
                                                </span>
                                            </p>
                                        </a>
                                        <div
                                            class="dropdown-menu navbar-dropdown dropdown-menu-right p-0 border-0 font-size-sm"
                                            aria-labelledby="profileDropdown"
                                            data-x-placement="bottom-end"
                                            style="left:auto;right:0;"
                                        >
                                            <div class="pt-2 pb-2">
                                                <h6 class="dropdown-header" style="color: #979797;font-size: 0.7rem;">
                                                    {AppState.resources.editorLayout}
                                                </h6>
                                                <a
                                                    class="dropdown-item topbar-menu-item"
                                                    href="javascript:"
                                                    onClick={() => {
                                                        AppState.setModalSectionMode(ModalSectionMode.fieldSet)
                                                        location.reload()
                                                    }}
                                                >
                                                    <span>{AppState.resources.editorLayoutFieldset}</span>
                                                    {AppState.modalSectionMode == ModalSectionMode.fieldSet && (
                                                        <i class="fas fa-check" style="float:right;"></i>
                                                    )}
                                                </a>
                                                <a
                                                    class="dropdown-item topbar-menu-item"
                                                    href="javascript:"
                                                    onClick={() => {
                                                        AppState.setModalSectionMode(ModalSectionMode.navPills)
                                                        location.reload()
                                                    }}
                                                >
                                                    <span>{AppState.resources.editorLayoutPills}</span>
                                                    {AppState.modalSectionMode == ModalSectionMode.navPills && (
                                                        <i class="fas fa-check" style="float:right;"></i>
                                                    )}
                                                </a>
                                                <hr class="dropdown-divider" style="background: gray;"></hr>
                                                <a
                                                    class="dropdown-item topbar-menu-item"
                                                    href="javascript:"
                                                    onClick={() => {
                                                        AppState.setUser(null, true)
                                                        location.reload()
                                                    }}
                                                >
                                                    <span>{AppState.resources.logout}</span>
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                )}

                                {AppState.user == null && (
                                    <li class="nav-item nav-profile dropdown navbar-item">
                                        <a class="nav-link" href={AppState.loginViaActiveDirectory ? "/login" : "/login-legacy"}>
                                            <p class="mb-1">Login</p>
                                        </a>
                                    </li>
                                )}
                            </ul>
                            <button
                                class="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
                                type="button"
                                data-bs-toggle="offcanvas"
                                href="#sidebar"
                            >
                                <span class="mdi mdi-menu"></span>
                            </button>
                        </div>
                    </nav>
                )}

                <div class="container-fluid page-body-wrapper">
                    {this.fullScreen != true && this.renderHeaderMenuComponent(h)}

                    <div class="main-panel">
                        <div class="content-wrapper">
                            <router-view></router-view>
                        </div>
                    </div>
                </div>

                <div id="bs-modal-container">
                    <portal-target name="bs-modal-container" multiple />
                </div>
                <div id="bs-modal-container-alt">
                    <portal-target name="bs-modal-container-alt" multiple />
                </div>
                <div id="bs-dtbtn-container"></div>
                <RootDynamicComponentContainer />
                <LoginModal isRootInstance={true} />
            </div>
        )
    }

    renderHeaderMenuComponent(h) {
        if (this.hideMenu || this.fullScreen) {
            return <div></div>
        } else {
            let menuIndexHolder: AppMenuIndexHolder = { index: 1 }
            const ANCHOR_CSS = "nav-link"

            return (
                <nav class="sidebar sidebar-offcanvas" id="sidebar">
                    <ul class="nav">
                        {(this.menuItems || []).map((menuItem) => {
                            let parsedItem = this.parseMenuItem(h, menuItem, false)

                            if (parsedItem.isSeparator) {
                                return <li class="sidebar-nav-separator"></li>
                            } else if (!parsedItem.hasChildren) {
                                return (
                                    <li class={`nav-item ${menuItem.active ? "active" : ""}`}>
                                        {this.renderMenuItemAnchor(
                                            h,
                                            menuItem,
                                            ANCHOR_CSS,
                                            parsedItem.iconPart,
                                            parsedItem.textPart
                                        )}
                                    </li>
                                )
                            } else {
                                let menuItemId = "menuCollapseItem" + menuIndexHolder.index
                                menuIndexHolder.index += 1

                                return (
                                    <li class={`nav-item dropdown ${menuItem.active ? "active" : ""}`}>
                                        <a
                                            class="nav-link"
                                            href={"#" + menuItemId}
                                            data-bs-toggle="collapse"
                                            aria-expanded="false"
                                        >
                                            {parsedItem.iconPart}
                                            {parsedItem.textPart}
                                            <i class="menu-arrow"></i>
                                        </a>

                                        <div class={`collapse ${menuItem.active ? "show" : ""}`} id={menuItemId}>
                                            <ul class="nav flex-column sub-menu">
                                                {menuItem.children.map((childItem) => {
                                                    var parsedChild = this.parseMenuItem(h, childItem, true)
                                                    if (!isNullOrEmpty(childItem.children)) {
                                                        const msg = "Only two-level header menus are supported"
                                                        console.error(msg)
                                                        throw msg
                                                    }

                                                    if (parsedChild.isSeparator) {
                                                        throw "Subitem separator not implemented"
                                                    } else {
                                                        return (
                                                            <li class="nav-item">
                                                                {this.renderMenuItemAnchor(
                                                                    h,
                                                                    childItem,
                                                                    "nav-link",
                                                                    null,
                                                                    parsedChild.textPart
                                                                )}
                                                            </li>
                                                        )
                                                    }
                                                })}
                                            </ul>
                                        </div>
                                    </li>
                                )
                            }
                        })}
                    </ul>
                </nav>
            )
        }
    }

    renderMenuLanguageItem(h, lang: LanguageUtils.LanguageListItem, langText: string) {
        return (
            <a
                class="dropdown-item"
                onClick={() => AppState.setLanguage(LanguageUtils.getLanguageCode(lang.id), true)}
                href="javascript:"
            >
                <div class="nav-language-icon me-2">
                    <img src={LanguageUtils.getLanguageFlagUrl(lang.flag, false)} />
                </div>
                <div class="d-flex align-items-center">
                    <p class="mb-0">{langText}</p>
                </div>
            </a>
        )
    }

    renderMenuItemAnchor(h, menuItem: AppMenuItem, cssClass: string, iconPart, textPart) {
        if (menuItem.routerPath) {
            return (
                <router-link class={cssClass} to={menuItem.url}>
                    {iconPart}
                    {textPart}
                </router-link>
            )
        } else if (menuItem.url) {
            return (
                <a class={cssClass} href={menuItem.url}>
                    {iconPart}
                    {textPart}
                </a>
            )
        } else if (menuItem.onClick) {
            return (
                <a
                    class={cssClass}
                    href={"javascript:"}
                    onClick={() => {
                        this.handleMenuItemOnClick(menuItem)
                    }}
                >
                    {iconPart}
                    {textPart}
                </a>
            )
        }
    }

    renderTopPanel(h, dummyUser) {
        if (this.hideMenu || this.fullScreen) {
            return <div></div>
        } else {
            let route = AppState.currentAppRoute
            let routerTitle = this.getRouteTitle(route)
            let breadcrumbList = (this.breadcrumbItems || []) as BreadcrumbItem[]
            let breadcrumbLastIndex = breadcrumbList.length - 1
            let hasBreadcrumb = breadcrumbList.length > 0

            return (
                <div class="topnavbar-wrap">
                    <nav
                        class={
                            "navbar navbar-expand-lg navbar-transparent  navbar-absolute bg-primary " +
                            (hasBreadcrumb ? "has-breadcrumb " : "")
                        }
                    >
                        <div class="container-fluid">
                            <div class="navbar-wrapper">
                                <div class="navbar-toggle">
                                    <button type="button" class="navbar-toggler">
                                        <span class="navbar-toggler-bar bar1"></span>
                                        <span class="navbar-toggler-bar bar2"></span>
                                        <span class="navbar-toggler-bar bar3"></span>
                                    </button>
                                </div>

                                <span class="navbar-title-bc">
                                    <span class="navbar-brand pg-title">
                                        {!isNullOrEmpty(routerTitle) ? routerTitle : ""}
                                    </span>

                                    {hasBreadcrumb && (
                                        <nav class="breadcrumb-wrap" aria-label="breadcrumb">
                                            <ol class="breadcrumb">
                                                {breadcrumbList.map((item, i) => {
                                                    let breadcrumbItem
                                                    let lastItem = i == breadcrumbLastIndex

                                                    if (isNullOrEmpty(item.icon)) {
                                                        breadcrumbItem = item.text
                                                    } else {
                                                        breadcrumbItem = (
                                                            <span class="breadcrumbitem-wi">
                                                                <i class={item.icon}></i>
                                                                {item.text}
                                                            </span>
                                                        )
                                                    }

                                                    if (!lastItem) {
                                                        return (
                                                            <li class="breadcrumb-item">
                                                                <a
                                                                    href={
                                                                        !isNullOrEmpty(item.url)
                                                                            ? item.url
                                                                            : "javascript:"
                                                                    }
                                                                >
                                                                    {breadcrumbItem}
                                                                </a>
                                                            </li>
                                                        )
                                                    } else {
                                                        return (
                                                            <li class="breadcrumb-item active" aria-current="page">
                                                                {breadcrumbItem}
                                                            </li>
                                                        )
                                                    }
                                                })}
                                            </ol>
                                        </nav>
                                    )}
                                </span>
                            </div>

                            {ToolbarUserMenu.renderMenu(h, this.userDummy)}
                        </div>
                    </nav>

                    <div class="panel-header panel-header-sm"> </div>
                </div>
            )
        }
    }

    parseMenuItem(h, menuItem: AppMenuItem, isChild: boolean): ParsedMenuItem {
        let hasChildren = !isNullOrEmpty(menuItem.children)
        let isSeparator = !hasChildren && menuItem.type == AppMenuType.Separator
        let iconPart, textPart

        if (!isSeparator) {
            if (!isNullOrEmpty(menuItem.iconHtml)) {
                iconPart = (
                    <span class="icon-bg icon-bg-image">
                        <HtmlLiteral innerHTML={menuItem.iconHtml} />
                    </span>
                )
            } else {
                iconPart = (
                    <span class="icon-bg">
                        <i class={menuItem.icon}></i>
                    </span>
                )
            }

            if (!isChild) {
                textPart = <span class="menu-title">{menuItem.text}</span>
            } else {
                textPart = menuItem.text
            }
        }

        return {
            iconPart: iconPart,
            textPart: textPart,
            isSeparator: isSeparator,
            hasChildren: hasChildren,
        }
    }
}

interface AppMenuIndexHolder {
    index: number
}

export default toNative(AppEntryComponent)
