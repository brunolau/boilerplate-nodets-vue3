import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { _ButtonArgsBase, ButtonLayout, ButtonSize } from "./button-layout";
import UploadButton from "./upload-button";
import { ExcelReader } from "../../common/excel/excel-reader";

interface ExcelUploadButtonArgs extends _ButtonArgsBase {
    excelLoaded: (excelData: Array<Array<string>>) => void;
}

@Component
class ExcelUploadButton extends TsxComponent<ExcelUploadButtonArgs> implements ExcelUploadButtonArgs {
    @Prop() cssClass!: string;
    @Prop() layout!: ButtonLayout;
    @Prop() text!: string;
    @Prop() tooltip!: string;
    @Prop() size!: ButtonSize;
    @Prop() round!: boolean;
    @Prop() outlined!: boolean;
    @Prop() dismissModal!: boolean;
    @Prop() icon!: string;
    @Prop() iconOnRight!: boolean;
    @Prop() disabled!: boolean;
    @Prop() fullWidth!: boolean;
    @Prop() pulsate!: boolean;
    @Prop() excelLoaded: (excelData: Array<Array<string>>) => void;

    onFileLoaded(buffer) {
        if (this.excelLoaded != null) {
            this.excelLoaded(ExcelReader.readFileAsJson(buffer));
        }
    }

    render(h) {
        return (
            <UploadButton
                onlyExcel={true}
                asArrayBuffer={true}
                changedClientside={(e) => {
                    this.onFileLoaded(e);
                }}
                cssClass={this.cssClass}
                layout={this.layout}
                text={this.text}
                size={this.size}
                round={this.round}
                outlined={this.outlined}
                icon={this.icon}
                iconOnRight={this.iconOnRight}
                tooltip={this.tooltip}
                disabled={this.disabled}
                pulsate={this.pulsate}
            />
        );
    }
}

export default toNative(ExcelUploadButton);
