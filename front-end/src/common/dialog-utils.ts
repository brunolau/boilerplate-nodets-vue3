import { Modal as BootstrapModal } from "bootstrap";
import { ButtonLayout } from "../framework/button/button-layout"
import { DialogIcons } from "./enums"

export const enum DialogResult {
    Confirm = 0,
    Cancel = 1,
}

type AppDialogLoadingTarget = "content" | "body"

export class AppDialogExResult<T> {
    constructor(buttonCtx: JQuery, modalCtx: JQuery, data: T) {
        this.result = data
        this.buttonContext = buttonCtx
        this.modalContext = modalCtx
    }

    result: T
    buttonContext: JQuery
    modalContext: JQuery
    showLoading(target?: AppDialogLoadingTarget) {
        this.modalContext.find(target == "body" ? ".modal-body" : ".modal-content").append(AppConfig.blockerHtml)
    }
    hideLoading() {
        this.modalContext.find(AppConfig.blockerSelector).remove()
    }
    hideModal() {
        BootstrapModal.getOrCreateInstance(this.modalContext[0]).hide()
    }
}

export interface AppDialogButton {
    text: string
    onClick: (buttonContext?: JQuery) => void
    layout?: ButtonLayout
    icon?: string
    iconOnRight?: boolean
    outlined?: boolean
    cssClass?: string
}

export interface AppDialogArgs {
    title: string
    message: string
    icon?: DialogIcons
    autoHide?: boolean
    boxColor?: string
    fullHeight?: boolean
    buttons: AppDialogButton[]
    onHidden?: () => void
    cssClass?: string
    size?: "modal-fw" | "modal-sm" | "modal-lg" | "modal-xl"
}

class DialogIconUtils {
    static getIcon(icon: DialogIcons, iconStub: boolean): string {
        if (icon == DialogIcons.Question) {
            return '<div class="swal2-icon swal2-standard-resize swal2-question swal2-animate-question-icon" style="display: block;">?</div>'
        } else if (icon == DialogIcons.Warning) {
            return '<div class="swal2-icon swal2-standard-resize swal2-warning" style="display: block;">!</div>'
        } else if (icon == DialogIcons.Info) {
            return '<div class="swal2-icon swal2-standard-resize swal2-info swal2-animate-info-icon" style="display: block;">i</div>'
        } else if (icon == DialogIcons.Success) {
            if (iconStub) {
                return '<div class="success-icon-stub"></div>'
            }

            return `
                <div class="swal2-icon  swal2-success swal2-animate-success-icon" style="display: block;">
                    <div class="swal2-success-circular-line-left" style="background: rgb(255, 255, 255);"></div>
                    <span class="swal2-success-line-tip swal2-animate-success-line-tip"></span>
                    <span class="swal2-success-line-long swal2-animate-success-line-long"></span>
                    <div class="swal2-success-ring"></div>
                    <div class="swal2-success-fix" style="background: rgb(255, 255, 255);"></div>
                    <div class="swal2-success-circular-line-right" style="background: rgb(255, 255, 255);"></div>
                </div>`
        } else if (icon == DialogIcons.Error) {
            if (iconStub) {
                return '<div class="swal2-transform-resize"><div class="error-icon-stub" style="display: block;"></div></div>'
            }

            return `
                <div class="swal2-transform-resize">
                    <div class="swal2-icon swal2-error swal2-animate-error-icon" style="display: block;">
                        <span class="swal2-x-mark">
                            <span class="swal2-x-mark-line-left"></span>
                            <span class="swal2-x-mark-line-right"></span>
                        </span>
                    </div>
                </div>`
        }

        return ""
    }
}

class DialogBuilder {
    args: AppDialogArgs = null
    builder: string = null
    hasIcon: boolean = false
    id: string = null
    labelId: string = null

    build(args: AppDialogArgs): string {
        this.args = args
        this.id = "dyn-modal-" + portalUtils.randomString(6)
        this.labelId = this.id + "label"
        this.hasIcon = args.icon != null
        this.builder = ""

        this.builder +=
            '<div id="' +
            this.id + '" key="' + this.id +
            '" tabindex="-1" role="dialog" aria-labelledby="' +
            this.labelId +
            '" data-bs-backdrop="true" data-bs-keyboard="true" class="modal fade' +
            (args.cssClass ? " " + args.cssClass : "") +
            '">'
        this.builder += '  <div role="document" class="modal-dialog' + (args.size != null ? " " + args.size : "") + '">'
        this.builder += '    <div class="modal-content">'

        this.builder += this._getHeader()
        this.builder += this._getBody()
        this.builder += this._getFooter()

        this.builder += "    </div>"
        this.builder += "  </div>"
        this.builder += "</div>"
        return this.builder
    }

    private _getHeader(): string {
        let innerBuilder = ""
        innerBuilder += '<div class="modal-header' + (this.hasIcon ? " modal-has-headericon" : "") + '">'

        if (this.hasIcon) {
            innerBuilder += '<div class="modal-header-icon">' + this._getIcon() + "</div>"
        }

        innerBuilder += '  <h5 id="' + this.labelId + '" class="modal-title">' + this.args.title + "</h5>"
        innerBuilder +=
            '  <button type="button" data-dismiss="modal" aria-label="Close" class="btn-close close"></button>'
        innerBuilder += "</div>"
        return innerBuilder
    }

    private _getBody(): string {
        return (
            '<div class="modal-body' +
            (this.args.fullHeight ? " modal-full-height" : "") +
            '">' +
            this.args.message +
            "</div>"
        )
    }

    private _getFooter(): string {
        let innerBuilder = ""
        if (!isNullOrEmpty(this.args.buttons)) {
            innerBuilder += '<div class="modal-footer">'

            this.args.buttons.forEach((btn, i) => {
                let textBuilder = btn.text
                if (btn.icon && btn.iconOnRight != true) {
                    textBuilder =
                        '<span class="btn-label"><i class="' +
                        btn.icon +
                        '"></i><span>&nbsp;&nbsp;</span></span>' +
                        textBuilder
                } else if (btn.icon && btn.iconOnRight) {
                    textBuilder +=
                        '<span class="btn-label"><span>&nbsp;&nbsp;</span><i class="' + btn.icon + '"></i></span>'
                }

                let classBuilder = btn.layout.toString()
                if (btn.outlined) {
                    classBuilder += " btn-simple"
                }
                if (!isNullOrEmpty(btn.cssClass)) {
                    classBuilder += " " + btn.cssClass
                }

                innerBuilder +=
                    '<button id="' +
                    this.id +
                    ("-button-" + i) +
                    '" type="button" ' +
                    ' class="' +
                    classBuilder +
                    '">' +
                    textBuilder +
                    "</button>"
            })

            innerBuilder += "</div>"
        }

        return innerBuilder
    }

    private _getIcon(): string {
        return DialogIconUtils.getIcon(this.args.icon, true)
    }
}

export class DialogUtils {
    private static _buildAndShow(args: AppDialogArgs): JQuery {
        let builder = new DialogBuilder()
        let html = builder.build(args)
        let callbackFired = false
        $(html).appendTo("body")

        args.buttons.forEach((btn, i) => {
            $("#" + builder.id + "-button-" + i).click(function () {
                btn.onClick()
            })
        })

        const modalContext = BootstrapModal.getOrCreateInstance("#" + builder.id)
        const modalSelector = $(modalContext["_element"]);
        modalSelector
            .on("shown.bs.modal", function () {
                setTimeout(function () {
                    modalSelector.find("input").focus()
                }, 75)
            })
            .on("hidden.bs.modal", function () {
                if (!callbackFired && args.onHidden != null) {
                    args.onHidden()
                }

                setTimeout(function () {
                    modalSelector.remove()
                }, 50)
            })

        let ensureIconAnimation = function (selector: string, icon: DialogIcons, addExtended: boolean) {
            let stub = modalSelector.find(selector)
            if (stub.length > 0) {
                let headerIcon = modalSelector.find(".modal-header-icon")
                if (addExtended) {
                    headerIcon.parent().addClass("swal-extended-icon")
                }

                setTimeout(
                    () => {
                        headerIcon.html(DialogIconUtils.getIcon(icon, false))
                    },
                    addExtended ? 0 : 300
                )
            }
        }

        ensureIconAnimation(".success-icon-stub", DialogIcons.Success, true)
        ensureIconAnimation(".error-icon-stub", DialogIcons.Error, false)
        console.log(modalSelector)
        modalContext.show()
        return modalSelector
    }

    /**
     * Shows barebone dialog
     * @param args Modal display args
     */
    static showDialogEx(args: AppDialogArgs): Promise<AppDialogExResult<any>> {
        var _self = this
        return new Promise(function (resolve, reject) {
            let cbFired = false
            let modalContext: JQuery

            modalContext = _self._buildAndShow(args)
            resolve(new AppDialogExResult(null, modalContext, null))
        })
    }

    /**
     * Show confirm dialog
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param yesButton Caption of the CONFIRM button
     * @param noButton Caption of the CANCEL button
     * @param icon Icon of the dialog
     * @param autoHide Determines if the dialog should be auto-hidden
     */
    static showConfirmDialog(
        titleHtml: string,
        messageHtml: string,
        yesButton: string = AppState.resources.yes,
        noButton: string = AppState.resources.no,
        icon: DialogIcons = DialogIcons.Warning
    ): Promise<DialogResult> {
        var _self = this
        return new Promise(function (resolve, reject) {
            _self.showConfirmDialogEx(titleHtml, messageHtml, yesButton, noButton, icon).then(function (dialogHandle) {
                dialogHandle.hideModal()
                resolve(dialogHandle.result)
            })
        })
    }

    /**
     * Show confirm dialog with ability to delay hiding of the dialog
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param yesButton Caption of the CONFIRM button
     * @param noButton Caption of the CANCEL button
     * @param icon Icon of the dialog
     * @param autoHide Determines if the dialog should be auto-hidden
     */
    static showConfirmDialogEx(
        titleHtml: string,
        messageHtml: string,
        yesButton: string = AppState.resources.yes,
        noButton: string = AppState.resources.no,
        icon: DialogIcons = DialogIcons.Warning
    ): Promise<AppDialogExResult<DialogResult>> {
        var _self = this
        return new Promise(function (resolve, reject) {
            let cbFired = false
            let modalContext: JQuery

            modalContext = _self._buildAndShow({
                autoHide: false,
                boxColor: null,
                icon: icon,
                message: messageHtml,
                title: titleHtml,
                buttons: [
                    {
                        layout: ButtonLayout.Default,
                        text: noButton || AppState.resources.no,
                        onClick: (buttonContext) => {
                            resolve(new AppDialogExResult(buttonContext, modalContext, DialogResult.Cancel))
                        },
                    },
                    {
                        layout: ButtonLayout.Primary,
                        text: yesButton || AppState.resources.yes,
                        onClick: (buttonContext) => {
                            resolve(new AppDialogExResult(buttonContext, modalContext, DialogResult.Confirm))
                        },
                    },
                ],
                onHidden: () => {
                    setTimeout(() => {
                        resolve(new AppDialogExResult($("#dummmyy"), modalContext, DialogResult.Cancel))
                    }, 75)
                },
            })
        })
    }

    /**
     * Show informative message dialog with "OK" button
     *
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param icon Icon of the dialog
     */
    static showMessageDialog(titleHtml: string, messageHtml: string, icon?: DialogIcons): Promise<any> {
        var _self = this
        return new Promise(function (resolve, reject) {
            _self.showMessageDialogEx(titleHtml, messageHtml, icon).then(function (dialogHandle) {
                dialogHandle.hideModal()
                resolve(true)
            })
        })
    }

    /**
     * Show informative message dialog with "OK" button, ability to postpone hiding and show loading indicator
     *
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param icon Icon of the dialog
     */
    static showMessageDialogEx(
        titleHtml: string,
        messageHtml: string,
        icon?: DialogIcons
    ): Promise<AppDialogExResult<any>> {
        var _self = this
        return new Promise(function (resolve, reject) {
            let cbFired = false
            let modalContext: JQuery

            modalContext = _self._buildAndShow({
                autoHide: true,
                boxColor: null,
                icon: icon,
                message: messageHtml,
                title: titleHtml,
                buttons: [
                    {
                        layout: ButtonLayout.Default,
                        text: "OK",
                        onClick: (buttonContext) => {
                            if (!cbFired) {
                                cbFired = true
                                resolve(new AppDialogExResult(buttonContext, modalContext, true))
                            }
                        },
                    },
                ],
                onHidden: () => {
                    setTimeout(() => {
                        if (!cbFired) {
                            cbFired = true
                            resolve(new AppDialogExResult($("#dummmyy"), modalContext, true))
                        } else {
                            cbFired = false
                        }
                    }, 75)
                },
            })
        })
    }

    /**
     * Show informative message dialog with "OK" button
     *
     * @param messageHtml HTML string containing the message to be shown
     */
    static showErrorMessageDialog(messageHtml: string): Promise<any> {
        return this.showMessageDialog(AppState.resources.error, messageHtml, DialogIcons.Error)
    }

    /**
     * Displays prompt
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param defaultValue Default value of the input
     */
    static showPrompt(titleHtml: string, messageHtml: string, defaultValue?: string): Promise<string> {
        var _self = this
        return new Promise(function (resolve, reject) {
            _self.showPromptEx(titleHtml, messageHtml, defaultValue).then(function (dialogHandle) {
                dialogHandle.hideModal()
                resolve(dialogHandle.result)
            })
        })
    }

    /**
     * Displays prompt
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param defaultValue Default value of the input
     */
    static showPromptEx(
        titleHtml: string,
        messageHtml: string,
        defaultValue?: string
    ): Promise<AppDialogExResult<string>> {
        var _self = this
        return new Promise(function (resolve, reject) {
            let cbFired = false
            let inputId = "dyn-input-" + portalUtils.randomString(6)
            let modalContext: JQuery

            modalContext = _self._buildAndShow({
                autoHide: true,
                boxColor: null,
                icon: DialogIcons.Question,
                message:
                    messageHtml +
                    '<br><br><div class="form-group"><input id="' +
                    inputId +
                    '" type="text" class="form-control" placeholder="' +
                    (defaultValue || "").replace(/"/g, "&quot;") +
                    '"></div>',
                title: titleHtml,
                buttons: [
                    {
                        layout: ButtonLayout.Default,
                        text: AppState.resources.cancel,
                        onClick: (buttonContext) => {
                            if (!cbFired) {
                                cbFired = true
                                new AppDialogExResult(buttonContext, modalContext, null).hideModal()
                            }
                        },
                    },
                    {
                        layout: ButtonLayout.Primary,
                        text: "OK",
                        onClick: (buttonContext) => {
                            if (!cbFired) {
                                cbFired = true

                                var currentVal = $("#" + inputId).val() as string
                                if (isNullOrEmpty(currentVal)) {
                                    currentVal = defaultValue
                                }

                                resolve(new AppDialogExResult(buttonContext, modalContext, currentVal))
                            }
                        },
                    },
                ],
                onHidden: () => {
                    setTimeout(() => {
                        if (!cbFired) {
                            cbFired = true
                        }
                    }, 75)
                },
            })

            modalContext.find("input").keyup(function (e) {
                if (e.keyCode == 13) {
                    modalContext.find(".btn-primary").click()
                }
            })
        })
    }
}

;(function () {
    window["DialogUtils"] = DialogUtils
})()
