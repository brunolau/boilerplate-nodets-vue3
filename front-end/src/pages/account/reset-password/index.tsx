import { toNative } from "vue-facing-decorator";
import AppRoutes from "../../../app-routes";
import { TopLevelComponentBase } from "../../../common/base-component";
import AccountPageTemplate from "../../../components/account/account-page-template";
import { ButtonLayout } from "../../../framework/button/button-layout";
import LaddaButton from "../../../framework/button/ladda-button";
import { TextBoxTextType } from "../../../framework/input/textbox";
import TextBoxWithoutLabel from "../../../framework/input/textbox-without-label";
import LoadingIndicator from "../../../framework/loading-indicator";
import { Component } from "../../../app/vuetsx";

const validationRules: ValidationRuleset<ResetPasswordPage> = {
    newPassword: ValidationBuilder().required().build(),
    confirmPassword: ValidationBuilder().required().sameAs("newPassword").build(),
};

@Component({ validations: ValidationHelper.instance.transformRuleset(validationRules) })
class ResetPasswordPage extends TopLevelComponentBase {
    newPassword: string = null;
    confirmPassword: string = null;
    token: string = null;
    isLoading: boolean = null;

    protected get breadcrumbItems(): BreadcrumbItem[] {
        return [];
    }

    protected get menuItems(): AppMenuItem[] {
        return [];
    }

    mounted() {
        this.token = QueryStringUtils.getString("token");
    }

    async performResetPassword() {
        if (!this.validate()) {
            return;
        }

        this.isLoading = true;

        try {
            const resp = await fetch(appHttpProvider.enforceDomain + "authorization/reset-password", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + this.token,
                },
                method: "POST",
                body: JSON.stringify({ password: this.newPassword }),
            });

            const respJson = await resp.json();
            if (resp.ok) {
                AppState.router.push(AppRoutes.loginLegacy.path).then(() => {
                    this.showSuccessMessage(this.resources.passwordResetSuccess);
                });
            } else {
                this.showErrorMessage(this.resources.passwordResetError);
            }
        } catch (error) {
            this.showErrorMessage(this.resources.passwordResetError);
        } finally {
            this.isLoading = false;
        }
    }

    render(h) {
        return (
            <AccountPageTemplate>
                <div class="login-container" style="position:relative;">
                    <div class="login-form">
                        <LoadingIndicator visible={this.isLoading} />
                        <h4>{this.resources.passwordReset}</h4>
                        <p class="login-form-hint">{this.resources.passwordResetHint}</p>
                        <div>
                            <TextBoxWithoutLabel
                                textType={TextBoxTextType.Password}
                                value={this.newPassword}
                                changed={(e) => {
                                    this.newPassword = e;
                                }}
                                placeholder={this.resources.passwordResetLabel}
                            />
                        </div>
                        <div>
                            <TextBoxWithoutLabel
                                textType={TextBoxTextType.Password}
                                value={this.confirmPassword}
                                changed={(e) => {
                                    this.confirmPassword = e;
                                }}
                                placeholder={this.resources.passwordResetAgainLabel}
                            />
                        </div>
                        <div style="text-align:center;">
                            <LaddaButton
                                layout={ButtonLayout.Primary}
                                iconOnRight={true}
                                icon={"icon icon-arrow-right-circle"}
                                clicked={async (e) => {
                                    await this.performResetPassword();
                                }}
                                text={this.resources.passwordResetButton}
                            />
                        </div>
                    </div>
                </div>
            </AccountPageTemplate>
        );
    }
}

export default toNative(ResetPasswordPage);
