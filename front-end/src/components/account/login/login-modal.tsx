import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../../app/vuetsx";
import { ButtonLayout } from "../../../framework/button/button-layout";
import LaddaButton from "../../../framework/button/ladda-button";
import Modal from "../../../framework/modal/modal";
import ModalBody from "../../../framework/modal/modal-body";
import ModalFooter from "../../../framework/modal/modal-footer";
import LoginForm from "./login";

interface LoginModalArgs {
    isRootInstance: boolean;
}

@Component
class LoginModal extends TsxComponent<LoginModalArgs> implements LoginModalArgs {
    @Prop() isRootInstance: boolean;

    mounted() {
        if (this.isRootInstance) {
            (window as any).loginModalRootInstance = this;
        }
    }

    show() {
        this.getModal().show();
    }

    getModal() {
        return this.$refs.loginModal as typeof Modal.prototype;
    }

    getLoginForm(): typeof LoginForm.prototype {
        return this.$refs.loginForm as typeof LoginForm.prototype;
    }
    f;
    async loginClicked() {
        await this.getLoginForm().performLogin();
    }

    render(h) {
        return (
            <Modal title="" ref="loginModal">
                <ModalBody>
                    <LoginForm
                        ref="loginForm"
                        showLoginButton={false}
                        showLanguageSwitch={false}
                        activeDirectoryMode={AppState.loginViaActiveDirectory}
                        success={() => {
                            location.reload();
                        }}
                    />
                </ModalBody>
                <ModalFooter>
                    <LaddaButton
                        layout={ButtonLayout.Primary}
                        text={AppState.resources.signInButtonLabel}
                        icon={"icon icon-arrow-right-circle"}
                        clicked={async (e) => {
                            await this.loginClicked();
                        }}
                    />
                </ModalFooter>
            </Modal>
        );
    }
}

export default toNative(LoginModal);
