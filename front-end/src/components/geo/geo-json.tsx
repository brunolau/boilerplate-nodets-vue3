import { Prop, toNative } from "vue-facing-decorator";
import { GeoJSON } from "../../api/data-contracts/geo";
import TsxComponent, { Component } from "../../app/vuetsx";
import TextArea from "../../framework/input/textarea";

interface GeoJsonEditorArgs {
    value: GeoJSON;
    label?: string;
    validationState?: ValidationState;
    wrap?: boolean;
    changed: (e: GeoJSON) => void;
}

@Component
class GeoJsonEditor extends TsxComponent<GeoJsonEditorArgs> implements GeoJsonEditorArgs {
    @Prop() value: GeoJSON;
    @Prop() label!: string;
    @Prop() wrap!: boolean;
    @Prop() changed: (e: GeoJSON) => void;

    getCurrentJSON(): string {
        if (this.value != null) {
            return JSON.stringify(this.value);
        }

        return "";
    }

    onJsonValueChanged(e: string): void {
        let parsedObj: GeoJSON;
        try {
            parsedObj = JSON.parse(e);
        } catch (error) {}

        if (parsedObj != null) {
            this.changed(parsedObj);
        }
    }

    render(h) {
        return (
            <TextArea
                rows={4}
                label={"Geo JSON"}
                value={this.getCurrentJSON()}
                changed={(e) => {
                    this.onJsonValueChanged(e);
                }}
            />
        );
    }
}

export default toNative(GeoJsonEditor);
