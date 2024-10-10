//import './../../node_modules/bootstrap-notify/bootstrap-notify.min.js';
import "bootstrap-notify";

/**
 * Type of the notification determined by the bootstrap theme
 */
export const enum NotificationType {
    Primary = "primary",
    Secondary = "secondary",
    Info = "info",
    Success = "success",
    Warning = "warning",
    Danger = "danger",
    Error = "danger",
}

export const enum NotificationIcon {
    Bell = "now-ui-icons ui-1_bell-53",
    Exclamation = "fas fa-exclamation-triangle",
    Checkmark = "fas fa-check",
    Cross = "now-ui-icons ui-1_simple-remove",
    Like = "now-ui-icons ui-2_like",
    Gear = "now-ui-icons ui-1_settings-gear-63",
    Smiley = "now-ui-icons emoticons_satisfied",
}

/**
 * Notification placement
 */
export const enum NotificationPlacement {
    TopLeft = 0,
    TopCenter = 1,
    TopRight = 2,
    BottomLeft = 20,
    BottomCenter = 21,
    BottomRight = 22,
}

interface NotificationDisplayArgs {
    /**
     * Notification message HTML, will not be escaped, ensure proper escaping if needed
     */
    messageHtml: string;

    /**
     * Icon of the notification, might be NotificationIcon type, or now-ui, font awesome, or simple line icons
     */
    icon?: NotificationIcon | string;

    /**
     * Optional title of the notification
     */
    title?: string;

    /**
     * Display type of the notification [based on bootstrap theme colors]
     */
    type?: NotificationType;

    /**
     * Notification placement
     */
    placement?: NotificationPlacement;

    /**
     * If not closed manually, after this timeout [in ms] ellapses, notification automatically hides (default 4000ms)
     */
    timeout?: number;
}

var NotificationUtils = (function () {
    function getArgs(messageOrArgs: string | NotificationDisplayArgs, icon?: string, title?: string): NotificationDisplayArgs {
        var args = messageOrArgs as NotificationDisplayArgs;
        if (args.messageHtml != null) {
            return args;
        }

        return {
            messageHtml: <string>messageOrArgs,
            icon: icon,
            title: title,
        };
    }

    function getPlacement(args: NotificationDisplayArgs): any {
        var placement = args.placement || NotificationPlacement.TopCenter;
        var placementEnd = (<number>placement).toString();
        var lastNumber = Number(placementEnd.substring(placementEnd.length - 1));
        var from = placement < 10 ? "top" : "bottom";
        var align;

        if (lastNumber == 0) {
            align = "left";
        } else if (lastNumber == 1) {
            align = "center";
        } else {
            align = "right";
        }

        return {
            from: from,
            align: align,
        };
    }

    function show(messageOrArgs: string | NotificationDisplayArgs, icon?: string, title?: string): void {
        var args = getArgs(messageOrArgs, icon, title);

        jQuery["notify"](
            {
                icon: args.icon,
                message: args.messageHtml,
                title: args.title,
            },
            {
                type: args.type || "primary",
                timer: args.timeout || 4000,
                placement: getPlacement(args),
                z_index: 99999,
                animate: {
                    enter: "animate__animated animate__fadeInDown",
                    exit: "animate__animated animate__fadeOutUp",
                },
                template:
                    '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert" style="z-index:999999"><div type="button" aria-hidden="true" class="btn-close close" data-notify="dismiss"></div><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>',
            },
        );
    }

    return {
        show: show,
    };
})();

export default class NotificationProvider {
    /**
     * Displays given message top-center
     * @param message
     */
    static show(message: string): void;

    /**
     * Displays message based on given args
     *
     * @param args
     */
    static show(args: NotificationDisplayArgs): void;

    /**
     * Displays given message
     * @param message Message to-be shown
     * @param icon Accompanying icon
     */
    static show(message: string, icon?: NotificationIcon | string): void;

    /**
     * Displays given message
     *
     * @param message Message to-be shown
     * @param icon Accompanying icon
     * @param title Message title
     */
    static show(message: string | NotificationDisplayArgs, icon?: NotificationIcon | string, title?: string): void {
        NotificationUtils.show(message, icon, title);
    }

    /**
     * Displays error message
     *
     * @param message Error message
     */
    static showErrorMessage(message: string): void;

    /**
     * Displays error message
     *
     * @param messageHtml Error message
     * @param title Title of the message
     */
    static showErrorMessage(messageHtml: string, title?: string): void {
        NotificationUtils.show({
            messageHtml: messageHtml,
            title: title,
            icon: NotificationIcon.Exclamation,
            type: NotificationType.Error,
        });
    }

    /**
     * Displays success message
     *
     * @param message Success message
     */
    static showSuccessMessage(message: string): void;

    /**
     * Displays success message
     *
     * @param messageHtml Success message
     * @param title Title of the message
     */
    static showSuccessMessage(messageHtml: string, title?: string): void {
        NotificationUtils.show({
            messageHtml: messageHtml,
            title: title,
            icon: NotificationIcon.Checkmark,
            type: NotificationType.Success,
        });
    }
}
