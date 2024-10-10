import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { _ButtonArgsBase, ButtonLayout, ButtonSize } from "./button-layout";
import Button from "./button";

const enum UploadButtonTarget {
    Local = 0,
    Server = 1,
}

export interface UploadButtonClienstideChangedArgs {
    fileName: string;
    srcBase64: string;
}

export interface UploadButtonFileObtainedArgs {
    file: File;
}

interface UploadButtonArgs extends _ButtonArgsBase {
    target?: UploadButtonTarget;
    asArrayBuffer?: boolean;
    asString?: boolean;
    asFile?: boolean;
    changedClientside?: (args: UploadButtonClienstideChangedArgs) => void;
    fileObtained?: (args: UploadButtonFileObtainedArgs) => void;
    onlyImages?: boolean;
    onlyExcel?: boolean;
    onlyVideo?: boolean;
    accept?: string;
}

@Component
class UploadButton extends TsxComponent<UploadButtonArgs> implements UploadButtonArgs {
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
    @Prop() onlyImages?: boolean;
    @Prop() onlyExcel?: boolean;
    @Prop() onlyVideo?: boolean;
    @Prop() asFile?: boolean;
    @Prop() asArrayBuffer?: boolean;
    @Prop() asString?: boolean;
    @Prop() pulsate!: boolean;
    @Prop() accept?: string;
    @Prop() changedClientside: (args: UploadButtonClienstideChangedArgs) => void;
    @Prop() fileObtained: (args: UploadButtonFileObtainedArgs) => void;

    getAccept(): string {
        if (!isNullOrEmpty(this.accept)) {
            return this.accept;
        } else if (this.onlyImages == true) {
            return "image/*";
        } else if (this.onlyExcel == true) {
            return ".xlsx, .xls, .ods";
        } else if (this.onlyVideo == true) {
            return "video/mp4,video/x-m4v,video/*";
        }

        return null;
    }

    handleClientsideChange(file: File) {
        var reader = new FileReader();
        var mySelf = this;

        reader.onload = function (event) {
            mySelf.$refs.clientImageLoader["value"] = "";
            if (!/safari/i.test(navigator.userAgent)) {
                mySelf.$refs.clientImageLoader["type"] = "";
                mySelf.$refs.clientImageLoader["type"] = "file";
            }

            if (mySelf.changedClientside != null) {
                mySelf.changedClientside({
                    fileName: file.name,
                    srcBase64: event.target["result"] as any,
                });
            }
        };

        if (this.fileObtained != null) {
            this.fileObtained({
                file: file,
            });
        }

        if (this.asFile) {
            return;
        }

        if (this.asArrayBuffer == true) {
            reader.readAsArrayBuffer(file);
        } else if (this.asString == true) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    }

    onClientButtonClicked() {
        this.$refs.clientImageLoader["click"]();
    }

    onFileChanged(e) {
        this.handleClientsideChange(e.target.files[0]);
    }

    onDrop(e) {
        var file = e.dataTransfer.files[0];
        if (file != null) {
            this.handleClientsideChange(file);
        }
    }

    onDummyEvent(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    bindDrop() {
        this.$nextTick(() => {
            let targetEl = this.$refs.uploadButton["$el"] as HTMLElement;
            if (targetEl["_eventsBound"] == null) {
                targetEl["_eventsBound"] = true;
                ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach((evType) => {
                    targetEl.addEventListener(evType, this.onDummyEvent);
                });

                targetEl.addEventListener("drop", (e) => {
                    this.onDrop(e);
                });
            }
        });
    }

    render(h) {
        return this.renderClientsideUpload(h);
    }

    renderClientsideUpload(h) {
        this.bindDrop();

        return (
            <span>
                <Button
                    ref={"uploadButton"}
                    clicked={(e) => {
                        this.onClientButtonClicked();
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
                <input type="file" ref="clientImageLoader" accept={this.getAccept()} style="display:none;" onChange={(e) => this.handleClientsideChange(e.target.files[0])} />
            </span>
        );
    }
}

export default toNative(UploadButton);
