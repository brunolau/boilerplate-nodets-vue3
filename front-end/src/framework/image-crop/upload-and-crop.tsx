import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { ButtonLayout, ButtonSize, _ButtonArgsBase } from "../button/button-layout";
import UploadButton, { UploadButtonFileObtainedArgs } from "../button/upload-button";
import ImageCropModal, { ImageCroppedUploadArgs } from "./image-cropping-modal";
import NotificationProvider from "../../ui/notification";
import { DialogUtils } from "../../common/dialog-utils";
import LoadingIndicator from "../loading-indicator";
import { BrowserImageCompression } from "../../common/utils/broswer-image-compression";

export interface UploadImageAndCropFileCompleteArgs {
    imageSrc: string;
    fileName: string;
}

export interface UploadImageAndCropUploadEventArgs extends ImageCroppedUploadArgs {}

interface UploadImageAndCropButtonArgs extends _ButtonArgsBase {
    title?: string;
    aspectRatio?: number;
    useCropper?: boolean;
    uploadUrl?: string;
    targetBlobContainer: string;
    imageCropperTitleMessage?: string;
    uploadArgs: (e: UploadImageAndCropUploadEventArgs) => any;
    uploadComplete: (args: any) => void;
    autoCommit?: boolean;
}

@Component
class UploadImageAndCropButton extends TsxComponent<UploadImageAndCropButtonArgs> implements UploadImageAndCropButtonArgs {
    @Prop() cssClass!: string;
    @Prop() layout!: ButtonLayout;
    @Prop() text!: string;
    @Prop() size!: ButtonSize;
    @Prop() round!: boolean;
    @Prop() outlined!: boolean;
    @Prop() dismissModal!: boolean;
    @Prop() icon!: string;
    @Prop() disabled!: boolean;
    @Prop() useCropper!: boolean;
    @Prop() fullWidth!: boolean;
    @Prop() title!: string;
    @Prop() aspectRatio!: number;
    @Prop() uploadUrl: string;
    @Prop() targetBlobContainer: string;
    @Prop() imageCropperTitleMessage!: string;
    @Prop() uploadArgs: (e: UploadImageAndCropUploadEventArgs) => any;
    @Prop() uploadComplete: (args: any) => void;
    @Prop() autoCommit: boolean;
    isLoading: boolean = false;

    async onFileObtained(e: UploadButtonFileObtainedArgs) {
        const urlCreator = window.URL || window.webkitURL;
        const imgUrl = urlCreator.createObjectURL(e.file);

        if (this.useCropper != false) {
            (this.$refs.imgCrop as typeof ImageCropModal.prototype).show({
                fileName: e.file.name,
                imageSrc: imgUrl,
                aspectRatio: this.aspectRatio || 5 / 3,
                title: null,
                titleMessageHtml: this.imageCropperTitleMessage,
                handleCropUpload: (e) => {
                    return this.getUploadPromise(e);
                },
            });
        } else {
            this.isLoading = true;
            this.getUploadPromise({
                file: e.file,
                fileName: e.file.name,
                dataUrl: null,
            })
                .then((resp) => {
                    this.isLoading = false;
                })
                .catch((err) => {
                    this.isLoading = false;
                });
        }
    }

    getUploadButton() {
        return this.$refs.uploadButton as typeof UploadButton.prototype;
    }

    async getUploadPromise(args: ImageCroppedUploadArgs): Promise<any> {
        var self = this;

        if (args.file.type != "image/svg+xml") {
            args.file = await BrowserImageCompression.compress(args.file);
        }

        return new Promise(function (resolve, reject) {
            var formData = new FormData();
            if (self.uploadArgs != null) {
                let argsVal = self.uploadArgs(args);
                if (argsVal != null) {
                    for (let key in argsVal) {
                        formData.append(key, argsVal[key]);
                    }
                }
            }
            if (self.autoCommit === true) {
                var request = new XMLHttpRequest();
                request.open("POST", self.uploadUrl);
                request.onreadystatechange = function () {
                    if (request.readyState == 4) {
                        var response;
                        try {
                            response = JSON.parse(request.responseText);
                        } catch (e) {
                            response = request.responseText;
                        }

                        if (request.status == 200) {
                            if (self.uploadComplete) {
                                self.uploadComplete(response);
                            }

                            resolve(response);
                        } else {
                            try {
                                if (response.responseText) {
                                    NotificationProvider.showErrorMessage(response.responseText);
                                } else {
                                    NotificationProvider.showErrorMessage(response);
                                }
                            } catch (e) {}

                            reject(response);
                        }
                    }
                };

                request.send(formData);
            } else {
                let argsVal = self.uploadArgs(args);
                self.uploadComplete(argsVal);
                resolve(formData);
            }
        });
    }

    render(h) {
        return (
            <span style="position:relative;">
                <LoadingIndicator visible={this.isLoading} />
                <UploadButton
                    ref={"uploadButton"}
                    fileObtained={async (e) => {
                        await this.onFileObtained(e);
                    }}
                    onlyImages={true}
                    cssClass={this.cssClass}
                    layout={this.layout}
                    text={this.text}
                    size={this.size}
                    round={this.round}
                    outlined={this.outlined}
                    icon={this.icon}
                    disabled={this.disabled}
                />

                <ImageCropModal ref="imgCrop" />
            </span>
        );
    }
}

export default toNative(UploadImageAndCropButton);
