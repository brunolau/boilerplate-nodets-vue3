import { toNative } from "vue-facing-decorator";
import { TsxComponentExtended } from "../../../app/vuestsx-extended";
import "./css/account-page-template.css";
import { Component } from "../../../app/vuetsx";

interface AccountPageTemplateArgs {}

@Component
class AccountPageTemplate extends TsxComponentExtended<AccountPageTemplateArgs> implements AccountPageTemplateArgs {
    mounted() {}

    render(h) {
        return (
            <div class="account-page">
                <div class="account-aside d-flex flex-row-auto bgi-size-cover bgi-no-repeat p-10 p-lg-10" style={"background-image: url('/assets/img/login-bg.jpg');"}>
                    <div class="flex-column-fluid d-flex flex-column justify-content-center">
                        <h3 class="font-size-h1 mb-5 text-white">TMR Datawarehouse</h3>
                    </div>
                </div>
                {this.$slots.default?.()}
            </div>
        );
    }
}

export default toNative(AccountPageTemplate);
