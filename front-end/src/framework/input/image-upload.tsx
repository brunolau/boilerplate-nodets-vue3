import { toNative, Prop, Watch } from "vue-facing-decorator";
import { FileManagerDialog, FileManagerModalFileType } from "../modal/ts/file-manager-dialog";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import TsxComponent, { Component } from "../../app/vuetsx";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import "./css/image-upload.css";

interface ImageUploadBoxArgs extends FormItemWrapperArgs {
    value: string;
    changed: (newValue: string) => void;
    maxImgWidth?: number;
}

@Component
class ImageUploadBox extends TsxComponent<ImageUploadBoxArgs> implements ImageUploadBoxArgs {
    @Prop() clicked: (e: any) => void;
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: string;
    @Prop() mandatory!: boolean;
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() maxImgWidth?: number;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() changed: (newValue: string) => void;

    currentValue: string = this.value;

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    getCssClass(): string {
        var ret = "image-box-wrap";
        if (isNullOrEmpty(this.currentValue)) {
            ret += " image-box-wrap-empty";
        }
        return ret;
    }

    uploadImg() {
        FileManagerDialog.show({
            fileType: FileManagerModalFileType.Image,
            callback: (data) => {
                this.setImgUrl(data.url);
                this.changed(data.url);
            },
            maxWidth: this.maxImgWidth,
        });
    }
    setImgUrl(imgUrl: string) {
        this.currentValue = imgUrl;
    }

    deleteImg() {
        this.currentValue = "";
    }

    render(h) {
        return (
            <FormItemWrapper
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                marginType={this.marginType}
                hint={this.hint}
                maxWidth={this.maxWidth}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                {isNullOrEmpty(this.currentValue) && (
                    <div
                        class={this.getCssClass()}
                        onClick={() => {
                            this.uploadImg();
                        }}
                    >
                        <span class="image-box-span">
                            <i class="fa fa-download image-box" aria-hidden="true"></i>
                            <br />
                            {AppState.resources.add}&nbsp;{AppState.resources.image}
                        </span>
                    </div>
                )}

                {!isNullOrEmpty(this.currentValue) && (
                    <div class={this.getCssClass()}>
                        <img
                            class="image-box"
                            src={this.currentValue}
                            onClick={() => {
                                this.uploadImg();
                            }}
                        ></img>
                        <span
                            class="image-box-edit-overlay"
                            onClick={() => {
                                this.uploadImg();
                            }}
                        >
                            <i class="fas fa-pencil-alt image-box-edit-icon"></i>
                        </span>
                        <span
                            class="image-box-delete-overlay"
                            onClick={() => {
                                this.deleteImg();
                            }}
                        >
                            <i class="fas fa-trash-alt image-box-delete-icon"></i>
                        </span>
                        <input type={"hidden"} value={this.currentValue} />
                    </div>
                )}
            </FormItemWrapper>
        );
    }
}

export default toNative(ImageUploadBox);
