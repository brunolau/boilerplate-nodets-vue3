import { Vue } from "vue-facing-decorator";
import { useVuelidate, Validation } from "@vuelidate/core";
import NotificationProvider from "../ui/notification";
import { DialogUtils, DialogResult, AppDialogExResult } from "./dialog-utils";
import { OptionBuilder } from "vue-facing-decorator/dist/optionBuilder";
import { DialogIcons } from "./enums";
//import { LoginDialog } from '../components/login/login-dialog';

export abstract class ViewModelBase extends Vue {
    blockRoot: boolean = true;
    authorized: boolean = true;
    v$: Validation;

    constructor(optionBuilder: OptionBuilder, vueInstance: any) {
        super(optionBuilder, vueInstance);
        this.v$ = useVuelidate() as any as Validation;
    }

    /**
     * Current resource set
     */
    get resources(): IAppResources {
        return AppState.resources;
    }

    /**
     * Current interface language
     */
    get appLanguage(): Language {
        return AppState.currentLanguage;
    }

    /**
     * Try GET data from Inviton API enpoint
     */
    public async tryGetDataByArgs<TData, TArgs = {}>(args: TryCallApiArgs<TData, TArgs>): Promise<TData> {
        return this.tryCallApiByArgs(args, false);
    }

    /**
     * Try POST data to Inviton API endpoint
     */
    public async tryPostDataByArgs<TData, TArgs>(args: TryCallApiArgs<TData, TArgs>): Promise<TryPostApiResponse<TData>> {
        var retVal = await this.tryCallApiByArgs(args, true);
        if (retVal != null && retVal["ajaxErr"] != null) {
            return {
                data: null,
                error: retVal["ajaxErr"],
                result: TryCallApiResult.Error,
            };
        } else {
            return {
                data: retVal,
                error: null,
                result: TryCallApiResult.Success,
            };
        }
    }

    public async tryDeleteDataByArgs<TData, TArgs>(args: TryCallApiArgs<TData, TArgs>): Promise<TData> {
        return this.tryCallApiByArgs(args, false);
    }

    private async tryCallApiByArgs<TData, TArgs>(args: TryCallApiArgs<TData, TArgs>, includeError: boolean): Promise<TData> {
        var retVal: TData;
        let handle: any = null;

        if (args.blockRoot != false) {
            handle = setTimeout(() => {
                this.blockRoot = true;
            }, 850);
        }

        var apiMethod = args.apiMethod as any;
        var promise = apiMethod(args.requestArgs, args.timeout);

        try {
            retVal = await promise;
        } catch (e: any) {
            let err: AjaxError = e;

            if (args.blockRoot != false) {
                this.blockRoot = false;
            }

            if (e == "not authorized, token expired") {
                err = {
                    authorized: false,
                    responseText: this.resources.loginExpired,
                } as any;
            }

            if (err.authorized == false || e == "not authorized, token expired") {
                (window as any).loginModalRootInstance.show();
            }

            if (!err.authorized && args.toggleAuthorization) {
                this.authorized = err.authorized;
            }

            if (args.showError != false) {
                let parsedMsg = AppConfig.parseErrorMessage(err.responseText);
                if (!isNullOrEmpty(parsedMsg)) {
                    this.showErrorMessage(parsedMsg);
                } else if (err.responseText) {
                    this.showErrorMessage(err.responseText);
                } else if ((err as any).message) {
                    this.showErrorMessage((err as any).message);
                }
            }

            if (includeError) {
                retVal = {
                    ajaxErr: err,
                } as any;
            } else {
                retVal = null;
            }
        }

        if (args.blockRoot != false) {
            try {
                clearTimeout(handle);
            } catch (error) {}

            if (this.blockRoot == true) {
                this.blockRoot = false;
            }
        }

        return retVal;
    }

    /**
     * Get children components of given type
     *
     * @param typeName Name of the type
     */
    getChildrenByType<T>(typeName: string): Array<T> {
        return portalUtils.getChildrenByType(this, typeName);
    }

    /**
     * Displays unobtrusive error message
     * @param errMsg Error message
     */
    showErrorMessage(errMsg: string): void {
        NotificationProvider.showErrorMessage(errMsg);
    }

    /**
     * Displays unobtrusive success message
     * @param successMsg Success message
     */
    showSuccessMessage(successMsg: string): void {
        NotificationProvider.showSuccessMessage(successMsg);
    }

    /**
     * Parse variable into number
     * @param val
     * @param defaultValue
     */
    getNumericValue(val: any, defaultValue?: number) {
        if (val != null) {
            try {
                val = Number(val);
                if (isNaN(val)) {
                    val = defaultValue;
                }
            } catch (e) {
                val = defaultValue;
            }
        } else {
            val = defaultValue;
        }

        return val;
    }

    /**
     * Gets if current site is run inside an iframe
     */
    isInIframe(): boolean {
        return portalUtils.isInIframe();
    }

    /**
     * Posts Inviton action message to the topmost window listener
     * @param actionName Unique name of the action
     * @param data Accompanying action data
     */
    postActionMessage(actionName: string, data: any): void {
        portalUtils.postActionMessage(actionName, data);
    }

    /**
     * Parses action message
     * @param message
     */
    parseActionMessage(message: string | MessageEvent): PortalActionMessage {
        let msgStr: string = message as any;
        if ((message as MessageEvent).origin) {
            msgStr = (message as MessageEvent).data;
        }

        msgStr = msgStr || "";
        if (msgStr.startsWith && msgStr.startsWith("INV-")) {
            return JSON.parse(msgStr.substring(4));
        }

        return null;
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
    showConfirmDialog(
        titleHtml: string,
        messageHtml: string,
        yesButton: string = AppState.resources.yes,
        noButton: string = AppState.resources.no,
        icon: DialogIcons = DialogIcons.Warning
    ): Promise<DialogResult> {
        return DialogUtils.showConfirmDialog(titleHtml, messageHtml, yesButton, noButton, icon);
    }

    /**
     * Show informative message dialog with "OK" button
     *
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param icon Icon of the dialog
     */
    showMessageDialog(titleHtml: string, messageHtml: string, icon?: DialogIcons): Promise<any> {
        return DialogUtils.showMessageDialog(titleHtml, messageHtml, icon);
    }

    /**
     * Displays prompt
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param defaultValue Default value of the input
     */
    showPrompt(titleHtml: string, messageHtml: string, defaultValue?: string): Promise<string> {
        return DialogUtils.showPrompt(titleHtml, messageHtml, defaultValue);
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
    showConfirmDialogEx(
        titleHtml: string,
        messageHtml: string,
        yesButton: string = AppState.resources.yes,
        noButton: string = AppState.resources.no,
        icon: DialogIcons = DialogIcons.Warning
    ): Promise<AppDialogExResult<DialogResult>> {
        return DialogUtils.showConfirmDialogEx(titleHtml, messageHtml, yesButton, noButton, icon);
    }

    /**
     * Show informative message dialog with "OK" button, ability to postpone hiding and show loading indicator
     *
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param icon Icon of the dialog
     */
    showMessageDialogEx(titleHtml: string, messageHtml: string, icon?: DialogIcons): Promise<AppDialogExResult<any>> {
        return DialogUtils.showMessageDialogEx(titleHtml, messageHtml, icon);
    }

    /**
     * Displays prompt
     * @param titleHtml HTML string containing the title text of the dialog
     * @param messageHtml HTML string containing the message to be shown
     * @param defaultValue Default value of the input
     */
    showPromptEx(titleHtml: string, messageHtml: string, defaultValue?: string): Promise<AppDialogExResult<string>> {
        return DialogUtils.showPromptEx(titleHtml, messageHtml, defaultValue);
    }

    /**
     * Validates current viewModel state based on given valdiation ruleset
     */
    validate(showErrorMessage?: boolean, silent?: boolean): boolean {
        if (localStorage.getItem("disableValidation") == "1") {
            return true;
        }

        if (this.v$ == null) {
            throw "Validation rules not specified, has to be specified in @Component declaration!";
        }

        var isInvalid = this.v$.$error;
        if (isInvalid) {
            if (showErrorMessage != false) {
                this.showValidationErrorMessage();
            }

            if (silent != true) {
                this.validationIncludeDirty = true;
                this.$nextTick(() => {
                    this.scrollToFirstPossibleError($(this.$el as HTMLElement));
                });
            }
        }

        return !isInvalid;
    }

    showValidationErrorMessage() {
        this.showErrorMessage(this.resources.errorsOnForm);
    }

    scrollToFirstPossibleError(context: JQuery) {
        setTimeout(() => {
            var scrollContext = context.find(".form-group.has-danger, .input-group.has-danger").first();
            if (scrollContext.length == 0) {
                scrollContext = $(".modal.show .form-group.has-danger, .modal.show .input-group.has-danger").first();
            }

            if (scrollContext.length > 0) {
                //Prevents multiple scrolling in one run
                let lastScroll = (AppState as any)._lastValidationScroll || 0;
                let now = new Date().getTime();
                if (now - lastScroll < 800) {
                    return;
                } else {
                    (AppState as any)._lastValidationScroll = now;
                }

                this.scrollToElem(scrollContext.first()[0]);
            }
        }, 10);
    }

    /**
     * Scrolls to element
     * @param elem
     */
    scrollToElem(elem: typeof Vue | Element | typeof Vue[] | Element[], mobileOffset?: boolean | number, mobileOffsetSmoothing?: boolean): void {
        let offset = 0;
        let otherHeaderHeight = $("nav.navbar.fixed-top").height();

        if (($(window).width() < 768 && mobileOffset != false) || otherHeaderHeight > 0) {
            if ((mobileOffset as number) > 1) {
                offset = mobileOffset as number;
            } else {
                offset = $(".topnavbar-wrap").height();
                if (offset == 0) {
                    offset = otherHeaderHeight;
                }

                offset = $(".topnavbar-wrap").height() + (mobileOffsetSmoothing != false ? 25 : 0);
            }
        }

        let itemTop = $(elem).first().offset().top;
        let modalParent = $(elem as HTMLElement).closest(".modal");
        if (modalParent.length == 0) {
            modalParent = null;
        } else {
            itemTop = modalParent.scrollTop() + itemTop - 95;
        }

        if (isNaN(offset)) {
            offset = 0;
        }

        this.scrollToPos(itemTop - offset, modalParent);
    }

    /**
     * Scrolls to position
     * @param elem
     */
    scrollToPos(position: number, context?: JQuery): void {
        setTimeout(() => {
            (context || $("html, body")).animate(
                {
                    scrollTop: position,
                },
                1200
            );
        });
    }

    /**
     * Determines if DIRTY should be included in validation
     */
    validationIncludeDirty: boolean = false;

    /**
     * Obtains validation state of given property
     * @param valProp Validation property
     */
    validationStateOf(valProp: IValidation | IValidation[], customMessage?: string): ValidationState {
        let retVal: ValidationState;
        if (!portalUtils.isArray(valProp)) {
            retVal = ValidationHelper.instance.getValidationDisplayState(valProp as any, this.validationIncludeDirty);
        } else {
            let validationResult: ValidationState;
            for (let i = 0, len = (valProp as IValidation[]).length; i < len; i++) {
                validationResult = ValidationHelper.instance.getValidationDisplayState(valProp[i], this.validationIncludeDirty);
                if (!validationResult.valid) {
                    retVal = validationResult;
                    break;
                }
            }
        }

        if (retVal?.valid == false) {
            if (!isNullOrEmpty(customMessage)) {
                retVal.errorMessage = customMessage;
            }
        }

        return retVal;
    }

    /**
     * Resets validation state of the viewModel
     */
    resetValidation() {
        ValidationHelper.instance.resetValidation(this);
        this.validationIncludeDirty = false;
    }
}

export abstract class TopLevelComponentBase extends ViewModelBase {
    topLevel: boolean = true;
    protected abstract get breadcrumbItems(): BreadcrumbItem[];
    protected abstract get menuItems(): AppMenuItem[];
}

interface TryCallApiArgs<TData, TArgs> {
    apiMethod: (data?: TArgs) => Promise<TData>;
    timeout?: number;
    requestArgs?: TArgs;
    showError?: boolean;
    blockRoot?: boolean;
    toggleAuthorization?: boolean;
    toggleAuthorizationOnNullUser?: boolean;
}

export interface TryPostApiResponse<TData> {
    data: TData;
    result: TryCallApiResult;
    error: AjaxError;
}

interface PortalActionMessage {
    action: string;
    data: any;
}
