import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface HtmlLiteralArgs {
    innerHTML: string;
}

@Component
class HtmlLiteral extends TsxComponent<HtmlLiteralArgs> implements HtmlLiteralArgs {
    @Prop() innerHTML!: string;

    mounted() {
        this.syncElem();
    }

    updated() {
        this.syncElem();
    }

    syncElem() {
        let rootElem = this.$refs.rootElem as Element;
        if (rootElem != null) {
            rootElem.innerHTML = this.innerHTML;
        } else {
            this.$nextTick(() => {
                rootElem = this.$refs.rootElem as Element;
                if (rootElem != null) {
                    rootElem.innerHTML = this.innerHTML;
                }
            });
        }
    }

    render(h) {
        if (this.innerHTML != null) {
            return <span ref="rootElem"></span>;
        }
    }
}

export default toNative(HtmlLiteral);
