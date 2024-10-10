import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import hljs from "highlight.js/lib";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github.css";

interface HighlightJsArgs {
    script: string;
}

@Component
class HighlightJs extends TsxComponent<HighlightJsArgs> implements HighlightJsArgs {
    @Prop() script!: string;
    _initialized: boolean;

    initHljs() {
        hljs.initHighlightingOnLoad();
        hljs.registerLanguage("javascript", javascript);
        hljs.registerLanguage("xml", xml);
    }

    getTextArea(): HTMLTextAreaElement {
        return this.$refs.highlightJsElem as HTMLTextAreaElement;
    }

    syncWithView() {
        let elem = this.getTextArea();
        if (elem != null) {
            elem.textContent = this.script;

            if (!this._initialized) {
                this.initHljs();
                this._initialized = true;
            }

            hljs.highlightBlock(this.$refs.highlightJsElem);
        }
    }

    mounted() {
        this.syncWithView();
    }

    updated() {
        this.syncWithView();
    }

    render(h) {
        if (this.script == null) {
            return null;
        }

        return (
            <pre>
                <code ref="highlightJsElem">{this.script}</code>
            </pre>
        );
    }
}

export default toNative(HighlightJs);
