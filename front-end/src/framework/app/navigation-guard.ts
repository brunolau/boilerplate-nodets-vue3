export interface NavigationBeforeLeaveArgs {
    to?: IAppRoute;
    from?: IAppRoute;
    instance: any;
    allowsAsync: boolean;
    next: (result?: boolean) => void;
}

export interface NavigationGuardCreateArgs {
    onLeave: (args: NavigationBeforeLeaveArgs) => boolean;
}

export default class NavigationGuardFactory {
    static create(args: NavigationGuardCreateArgs) {
        //Store the component instance
        let instance: any = null;

        //Handler instance for <a href navigations [not caught by Vue router]
        let windowNavigationHandler = (e) => {
            let result: boolean;
            try {
                result = args.onLeave.call(instance, {
                    instance: instance,
                    allowsAsync: false,
                    next: () => void {},
                });
            } catch (e) {
                result = true;
            }

            if (result == false) {
                e.preventDefault();
                e.returnValue = "";
            } else {
                instance = null;
            }
        };

        return {
            created: function () {
                instance = this;
                window.addEventListener("beforeunload", windowNavigationHandler);
            },
            beforeRouteLeave(to, from, next) {
                args.onLeave.call(instance, {
                    to: to,
                    from: from,
                    instance: instance,
                    allowsAsync: true,
                    next: function (result) {
                        if (result != false) {
                            window.removeEventListener("beforeunload", windowNavigationHandler);
                            instance = null;
                        }

                        next(result);
                    },
                });
            },
        };
    }
}
