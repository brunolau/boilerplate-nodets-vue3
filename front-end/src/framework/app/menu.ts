interface AppMenuItem {
    text?: string;
    url?: string;
    icon?: string;
    iconHtml?: string;
    onClick?: () => void;
    active?: boolean;
    routerPath?: boolean;
    type?: AppMenuType;
    children?: AppMenuItem[];
}
