export const enum ButtonLayout {
    Default = "btn btn-secondary btn-simple",
    Primary = "btn btn-primary",
    Secondary = "btn btn-secondary",
    Info = "btn btn-info",
    Success = "btn btn-success",
    Warning = "btn btn-warning",
    Danger = "btn btn-danger",
}

export const enum ButtonSize {
    Regular = "",
    Small = "btn-sm",
    Large = "btn-lg",
}

export const enum ButtonIframeHandling {
    Both = 0,
    LocalOnly = 1,
    PostOnly = 2,
}

export interface _ButtonArgsBase {
    layout: ButtonLayout;
    text?: string;
    size?: ButtonSize;
    round?: boolean;
    outlined?: boolean;
    icon?: string;
    iconButton?: boolean;
    iconOnRight?: boolean;
    cssClass?: string;
    dismissModal?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    tooltip?: string;
    pulsate?: boolean;
}
