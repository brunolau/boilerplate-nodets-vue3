import { Prop, toNative } from "vue-facing-decorator";
import LoginClient, { LoginRequest, LoginResponse } from "../../../api/clients/authorization/loginClient";
import { TsxComponentExtended } from "../../../app/vuestsx-extended";
import Button from "../../../framework/button/button";
import { ButtonLayout } from "../../../framework/button/button-layout";
import LaddaButton from "../../../framework/button/ladda-button";
import TextButton from "../../../framework/button/text-button";
import { TextBoxTextType } from "../../../framework/input/textbox";
import TextBoxWithoutLabel from "../../../framework/input/textbox-without-label";
import LoadingIndicator from "../../../framework/loading-indicator";
import "./css/login.css";
import { Component } from "../../../app/vuetsx";

interface LoginFormArgs {
    showLoginButton: boolean;
    showLanguageSwitch: boolean;
    activeDirectoryMode: boolean;
    success: () => void;
}

@Component
class LoginForm extends TsxComponentExtended<LoginFormArgs> implements LoginFormArgs {
    @Prop() success: () => void;
    @Prop() showLoginButton: boolean;
    @Prop() showLanguageSwitch: boolean;
    @Prop() activeDirectoryMode: boolean;
    userName: string = null;
    password: string = null;
    isLoading: boolean = false;

    async performLogin() {
        if (this.userName?.toLowerCase()?.trim() == "validation_disable") {
            localStorage.setItem("disableValidation", "1");
            this.showSuccessMessage("Validation disabled!");
            return;
        }

        if (this.userName?.toLowerCase()?.trim() == "validation_enable") {
            localStorage.setItem("disableValidation", "1");
            this.showSuccessMessage("Validation disabled!");
            return;
        }

        if (this.activeDirectoryMode == true) {
            await this.performActiveDirectoryLogin();
            return;
        }

        this.isLoading = true;
        let resp = await this.tryPostDataByArgs<LoginResponse, LoginRequest>({
            apiMethod: LoginClient.create().post,
            requestArgs: {
                email: this.userName,
                password: this.password,
                extendedProfile: true,
            },
        });

        this.isLoading = false;
        if (resp.result == TryCallApiResult.Success) {
            if ((window as any).PasswordCredential && (navigator as any).credentials) {
                var cr = new (window as any).PasswordCredential({ id: this.userName, password: this.password });
                await (navigator as any).credentials.store(cr);
            }

            AppState.setUser(
                {
                    Token: resp.data.accessToken,
                    ExpiresAt: null,
                    Profile: resp.data.extendedProfile,
                },
                true
            );

            if (this.success != null) {
                this.success();
            }
        }
    }

    performActiveDirectoryLogin(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                location.href = "/login-ad";
            }, 250);
        });
    }

    forgotPasswordClicked(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                AppState.router.push("/forgot-password");
            }, 250);
        });
    }

    getLoginHint(): string {
        if (this.activeDirectoryMode) {
            return this.resources.singInActiveDirectoryHint;
        } else {
            return this.resources.signInHint;
        }
    }

    onPasswordKeyUp(e) {
        if (e.which == 13) {
            setTimeout(() => {
                this.performLogin();
            }, 50);
        }
    }

    render(h) {
        const langList = LanguageUtils.getLanguageList();
        const currLang = langList.find((p) => p.id == AppState.currentLanguage);

        return (
            <div class="login-container" style="position:relative;">
                <div class="login-form">
                    <LoadingIndicator visible={this.isLoading} />

                    <h4>{this.resources.signIn}</h4>

                    {this.showLanguageSwitch && (
                        <div class="login-language-wrap">
                            <a class="nav-link dropdown-toggle d-flex" id="languageDropdown" style="color: #5E6278 !important;" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                <div class="nav-language-icon">
                                    <img src={LanguageUtils.getLanguageFlagUrl(currLang.flag, false)} />
                                </div>
                                <div class="nav-language-text" style="font-size: .875rem;color: #5E6278 !important;font-weight:500;margin-left:5px;">
                                    <p class="mb-1">{currLang.text}</p>
                                </div>
                            </a>
                            <div class="dropdown-menu navbar-dropdown" aria-labelledby="languageDropdown">
                                {this.renderMenuLanguageItem(h, langList.filter((p) => p.id == Language.German)[0], "Deutsch")}
                                {this.renderMenuLanguageItem(h, langList.filter((p) => p.id == Language.English)[0], "English")}
                                {this.renderMenuLanguageItem(h, langList.filter((p) => p.id == Language.Polish)[0], "Polski")}
                                {this.renderMenuLanguageItem(h, langList.filter((p) => p.id == Language.Slovak)[0], "Slovensky")}
                            </div>
                        </div>
                    )}

                    <p class="login-form-hint">{this.getLoginHint()}</p>

                    {!this.activeDirectoryMode && (
                        <div>
                            <TextBoxWithoutLabel
                                textType={TextBoxTextType.Email}
                                value={this.userName}
                                changed={(e) => {
                                    this.userName = e;
                                }}
                                placeholder={this.resources.loginUsername}
                            />
                            <TextBoxWithoutLabel
                                textType={TextBoxTextType.Password}
                                value={this.password}
                                changed={(e) => {
                                    this.password = e;
                                }}
                                keyDown={(e) => {
                                    this.onPasswordKeyUp(e);
                                }}
                                placeholder={this.resources.password}
                            />
                        </div>
                    )}

                    {this.showLoginButton && this.activeDirectoryMode == true && (
                        <div style="text-align:center;">
                            <LaddaButton
                                layout={ButtonLayout.Primary}
                                iconOnRight={true}
                                icon={"icon icon-arrow-right-circle"}
                                clicked={async (e) => {
                                    await this.performLogin();
                                }}
                                text={this.resources.continue}
                            />
                        </div>
                    )}

                    {this.showLoginButton && this.activeDirectoryMode == false && (
                        <div class="sign-in-last-row">
                            <TextButton
                                text={this.resources.forgotPassword}
                                clicked={async (e) => {
                                    await this.forgotPasswordClicked();
                                }}
                                icon={""}
                            />
                            <Button
                                layout={ButtonLayout.Primary}
                                clicked={(e) => {
                                    this.performLogin();
                                }}
                                text={this.resources.signInButtonLabel}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    renderMenuLanguageItem(h, lang: LanguageUtils.LanguageListItem, langText: string) {
        return (
            <a class="dropdown-item d-flex" onClick={() => AppState.setLanguage(LanguageUtils.getLanguageCode(lang.id), true)} href="javascript:">
                <div class="nav-language-icon me-2">
                    <img src={LanguageUtils.getLanguageFlagUrl(lang.flag, false)} />
                </div>
                <div class="d-flex align-items-center">
                    <p class="mb-0">{langText}</p>
                </div>
            </a>
        );
    }
}

export default toNative(LoginForm);
