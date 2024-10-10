import { toNative } from "vue-facing-decorator";
import ForgotPasswordClient, { ForgotPasswordRequest, ForgotPasswordResponse } from "../../../api/clients/authorization/forgotPasswordClient";
import { TopLevelComponentBase } from "../../../common/base-component";
import AccountPageTemplate from "../../../components/account/account-page-template";
import { ButtonLayout } from "../../../framework/button/button-layout";
import LaddaButton from "../../../framework/button/ladda-button";
import { TextBoxTextType } from "../../../framework/input/textbox";
import TextBoxWithoutLabel from "../../../framework/input/textbox-without-label";
import LoadingIndicator from "../../../framework/loading-indicator";
import { Component } from "../../../app/vuetsx";

@Component
class ForgotPasswordPage extends TopLevelComponentBase {
    email: string = null;
    isLoading: boolean = null;

    protected get breadcrumbItems(): BreadcrumbItem[] {
        return [];
    }

    protected get menuItems(): AppMenuItem[] {
        return [];
    }

    mounted() {}

    async performForgotPassword(): Promise<void> {
        //TODO: Texts for confirm password, too short password, terms and conditions validation
        return new Promise<void>((resolve, reject) => {
            this.email = this.email.trim();
            if (isNullOrEmpty(this.email)) {
                reject();
                return;
            }

            this.isLoading = true;

            setTimeout(async () => {
                let resp = await this.tryPostDataByArgs<ForgotPasswordResponse, ForgotPasswordRequest>({
                    apiMethod: ForgotPasswordClient.create().post,
                    requestArgs: {
                        email: this.email,
                    },
                });

                this.isLoading = false;

                if (resp.result == TryCallApiResult.Success) {
                    resolve();
                    this.showSuccessMessage(this.resources.passwordForgetSuccessMessage);
                } else {
                    reject();
                    this.showErrorMessage(this.resources.passwordForgetErrorMessage);
                }
            }, 1200);
        });
    }

    render(h) {
        return (
            <AccountPageTemplate>
                <div class="login-container" style="position:relative;">
                    <div class="login-form">
                        <LoadingIndicator visible={this.isLoading} />
                        <h4>{AppState.resources.passwordRecovery}</h4>
                        <p class="login-form-hint">{AppState.resources.passwordRecoveryHint}</p>
                        <div>
                            <TextBoxWithoutLabel
                                textType={TextBoxTextType.Email}
                                value={this.email}
                                changed={(e) => {
                                    this.email = e;
                                }}
                                placeholder={AppState.resources.passwordRecoveryPlaceholder}
                            />
                        </div>
                        <div style="text-align:center;">
                            <LaddaButton
                                layout={ButtonLayout.Primary}
                                iconOnRight={true}
                                icon={"icon icon-arrow-right-circle"}
                                clicked={async (e) => {
                                    await this.performForgotPassword();
                                }}
                                text={AppState.resources.passwordForgotButton}
                            />
                        </div>
                    </div>
                </div>
            </AccountPageTemplate>
        );
    }
}

export default toNative(ForgotPasswordPage);
