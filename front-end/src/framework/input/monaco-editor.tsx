import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import loader from "@monaco-editor/loader";
import LoadingIndicator from "../loading-indicator";

interface MonacoEditorArgs {
    value: string;
    language: string;
    height?: string;
    changed: (newValue: string) => void;
    //options: monaco.editor.IStandaloneEditorConstructionOptions
}

@Component
class MonacoEditor extends TsxComponent<MonacoEditorArgs> implements MonacoEditorArgs {
    @Prop() value: string;
    @Prop() language: string;
    @Prop() height!: string;
    @Prop() changed: (newValue: string) => void;
    editor: any;
    monacoLoading: boolean = false;
    currentValue: string;

    raiseChangeEvent() {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            var newValue = this._getValue();
            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    mounted() {
        this.currentValue = this.value;
        if ((window as any).monaco) {
            this.initMonaco();
        } else {
            this.monacoLoading = true;

            loader.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs" } });
            loader.init().then((monaco) => {
                this.monacoLoading = false;
                this.initMonaco();
            });
        }
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    getOptions() {
        return {};
    }

    initMonaco() {
        this.editor = (window as any).monaco.editor.create(this.$el as HTMLElement, {
            value: this.currentValue,
            language: this.language,
            theme: "vs",
            ...this.getOptions(),
        });

        this._editorMounted(this.editor);
    }

    refreshLayout() {
        this.editor &&
            this.$nextTick(() => {
                this.editor.layout();
            });
    }

    _getEditor() {
        if (!this.editor) return null;
        return this.editor;
    }

    _setValue(value) {
        let editor = this._getEditor();
        if (editor) return editor.setValue(value);
    }

    _getValue() {
        let editor = this._getEditor();
        if (!editor) return "";
        return editor.getValue();
    }

    _editorMounted(editor) {
        editor.onDidChangeModelContent((event) => {
            this.raiseChangeEvent();
        });
    }

    @Watch("currentValue")
    onValueChanged(val: string, oldVal: string) {
        if (val != oldVal) {
            this.currentValue = val;

            let currentVal = this._getValue();
            if (currentVal != val) {
                this._setValue(val);
            }
        }
    }

    render(h) {
        return (
            <div class="monaco_editor_container" style={"position:relative;width:100%; height: " + (!isNullOrEmpty(this.height) ? this.height : "300px") + ";"}>
                <LoadingIndicator visible={this.monacoLoading} />
            </div>
        );
    }
}

export default toNative(MonacoEditor);
