import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface FormArgs {}

@Component
class Form extends TsxComponent<FormArgs> implements FormArgs {
    render(h) {
        return <form class="form-horizontal">{this.$slots.default?.()}</form>;
    }
}

export default toNative(Form);
