import { toNative } from "vue-facing-decorator";
import { TopLevelComponentBase } from "../../../common/base-component";
import AccountPageTemplate from "../../../components/account/account-page-template";
import LoginForm from "../../../components/account/login/login";
import { Component } from "../../../app/vuetsx";

@Component
class LoginPage extends TopLevelComponentBase {
    name: string = null; //Needs to have =null suffixed so that TS compiler takes it into account
    boolValue: boolean = null;

    protected get breadcrumbItems(): BreadcrumbItem[] {
        return [];
    }

    protected get menuItems(): AppMenuItem[] {
        return [];
    }

    mounted() {}

    onSuccess() {
        localStorage.setItem("lastLoginType", "ad");
        location.href = "/";
    }

    render(h) {
        return (
            <AccountPageTemplate>
                <LoginForm
                    showLoginButton={true}
                    showLanguageSwitch={true}
                    activeDirectoryMode={true}
                    success={() => {
                        this.onSuccess();
                    }}
                />
            </AccountPageTemplate>
        );
    }
}

export default toNative(LoginPage);
