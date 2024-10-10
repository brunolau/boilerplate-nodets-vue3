import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Modal, { ModalSize } from "../modal/modal";
import ModalFooter from "../modal/modal-footer";
import "./vendor/jcrop.js";
import "./vendor/jquery.Jcrop.css";
import Button from "../button/button";
import { ButtonLayout } from "../button/button-layout";
import ModalBody from "../modal/modal-body";
import HtmlLiteral from "../html-literal/html-literal";
import "./css/image-cropping-modal.css";
const textureImg = "/assets/img/transparent_texture.png";

interface ImageCropModalBindingArgs {}

export interface ImageCroppedUploadArgs {
    fileName: string;
    dataUrl: string;
    file: File;
}

export interface ImageCropModalShowArgs {
    fileName: string;
    imageSrc: string;
    aspectRatio: number;
    titleMessageHtml?: string;
    title: string;
    handleCropUpload: (e: ImageCroppedUploadArgs) => Promise<any>;
}

interface ImageCropSelection {
    ImageHeight: number;
    ImageWidth: number;
    FileName: string;
    Rotation: number;
    CreateThumbs: boolean;
    TargetContainer: string;
    SelectionX: number;
    SelectionY: number;
    SelectionHeight: number;
    SelectionWidth: number;
    WasCropped: boolean;
}

@Component
class ImageCropModal extends TsxComponent<ImageCropModalBindingArgs> implements ImageCropModalBindingArgs {
    blocked: boolean = false;
    imageSrc: string = null;
    fileName: string = null;
    title: string = null;
    handleCropUpload: (e: ImageCroppedUploadArgs) => Promise<any>;
    aspectRatio: number = null;
    titleMessageHtml: string = null;

    private getFileName(): string {
        if (this.imageSrc == null) {
            return "";
        }

        if (this.imageSrc.indexOf("data:image") == 0 || this.imageSrc.indexOf("blob:") == 0) {
            return this.imageSrc;
        }

        return "https://inviton-storage.azureedge.net/ticketimage/" + this.imageSrc;
    }

    private getImageElement(): HTMLImageElement {
        return this.$refs.imageCropImage as HTMLImageElement;
    }

    public show(args: ImageCropModalShowArgs): void {
        if (window["currentJCrop"] != null) {
            window["currentJCrop"].destroy();
        }

        this.blocked = true;
        this.imageSrc = args.imageSrc;
        this.fileName = args.fileName;
        this.aspectRatio = args.aspectRatio;
        this.titleMessageHtml = args.titleMessageHtml;
        this.title = args.title || AppState.resources.imageCrop;
        this.handleCropUpload = args.handleCropUpload;
        let imgElement = this.getImageElement();
        if (imgElement != null) {
            imgElement.src = "";
        }

        (this.$refs.imageCropModal as typeof Modal.prototype).show();

        var containerWidth = $(window).width() - 62;
        var maxWidth = 780;
        if (containerWidth < maxWidth) {
            maxWidth = containerWidth;
        }

        var mySelf = this;
        var start = new Date().getTime();
        var img = new Image();
        img.onload = function () {
            var waitForLoad = function (callback) {
                if (new Date().getTime() - start > 700) {
                    callback();
                } else {
                    setTimeout(function () {
                        waitForLoad(callback);
                    }, 25);
                }
            };

            waitForLoad(function () {
                var height = img.height;
                var width = img.width;
                var maxHeight = $(window).height() - 140;
                var imgRatio = height / width;
                var possibleHeight = maxWidth * imgRatio;

                if (possibleHeight > maxHeight) {
                    var shrinkRatio = possibleHeight / maxHeight;
                    maxWidth = maxWidth / shrinkRatio;
                }

                var cropParams = {
                    boxWidth: maxWidth,
                    setSelect: [0, 0, 99999, 99999],
                    aspectRatio: mySelf.aspectRatio,
                };

                var imgElem = $(mySelf.getImageElement());
                imgElem.attr("src", mySelf.getFileName());
                ($ as any).Jcrop.component.DragState.prototype.touch = false;

                imgElem["Jcrop"](cropParams, function (this: any) {
                    window["currentJCrop"] = this;
                    mySelf.blocked = false;
                });
            });
        };

        img.src = this.getFileName();
    }

    private hide() {
        (this.$refs.imageCropModal as typeof Modal.prototype).hide();
    }

    private getImageFormat(dataUrl): string {
        if (dataUrl.length > 100) {
            dataUrl = dataUrl.substring(0, 100);
        }

        if (dataUrl.contains("image/png")) {
            return "image/png";
        } else {
            return "image/jpeg";
        }
    }

    private onSaveButtonClicked() {
        this.blocked = true;

        var image = new Image();
        var canvas = this.$refs.imageCropCanvas as HTMLCanvasElement;
        var ctx = canvas.getContext("2d");
        var selection = this.getCurrentSelection();

        image.src = this.getFileName();
        image.onload = async () => {
            this.drawCroppedImageOnCanvas(selection, image, canvas, ctx);
            canvas.toBlob(
                async (blob: any) => {
                    blob.name = this.fileName;
                    blob.lastModifiedDate = new Date();
                    blob.lastModified = blob.lastModifiedDate.getTime();

                    await this.handleCropUpload({
                        fileName: this.fileName,
                        file: blob as any,
                        dataUrl: null,
                    });

                    this.hide();

                    setTimeout(() => {
                        this.blocked = false;
                    }, 500);
                },
                this.getImageFormat(image.src),
                0.9
            );
        };
    }

    private drawCroppedImageOnCanvas(cropArgs: ImageCropSelection, img: HTMLImageElement, canvas: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D) {
        if (cropArgs.SelectionHeight > 0 && cropArgs.SelectionWidth > 0) {
            var bitmapHeight = img.height;
            var bitmapWidth = img.width;
            var heightRatio = bitmapHeight / cropArgs.ImageHeight;
            var widthRatio = bitmapWidth / cropArgs.ImageWidth;

            var resizedSelHeight = Math.round(cropArgs.SelectionHeight * heightRatio);
            var resizedSelWidth = Math.round(cropArgs.SelectionWidth * widthRatio);
            var resizedSelX = Math.max(Math.round(cropArgs.SelectionX * widthRatio) - 1, 0); //Remove one pixel to overcome possible errors in pixel rounding on the clientside
            var resizedSelY = Math.max(Math.round(cropArgs.SelectionY * heightRatio) - 1, 0);

            canvas.height = resizedSelHeight;
            canvas.width = resizedSelWidth;

            canvasContext.drawImage(
                img,
                resizedSelX,
                resizedSelY, // Start at 70/20 pixels from the left and the top of the image (crop),
                resizedSelWidth,
                resizedSelHeight, // "Get" a `50 * 50` (w * h) area from the source image (crop),
                0,
                0, // Place the result at 0, 0 in the canvas,
                resizedSelWidth,
                resizedSelHeight
            ); // With as width / height: 100 * 100 (scale)

            //ctx.drawImage(image,
            //    70, 20,   // Start at 70/20 pixels from the left and the top of the image (crop),
            //    50, 50,   // "Get" a `50 * 50` (w * h) area from the source image (crop),
            //    0, 0,     // Place the result at 0, 0 in the canvas,
            //    100, 100); // With as width / height: 100 * 100 (scale)

            //Rectangle cropArea = new Rectangle(resizedSelX, resizedSelY, resizedSelWidth, resizedSelHeight);
            //var retVal = img.Clone(cropArea, img.PixelFormat);

            //if (cropArgs.Rotation == 90) {
            //    retVal.RotateFlip(RotateFlipType.Rotate90FlipNone);
            //}
            //else if (cropArgs.Rotation == 180) {
            //    retVal.RotateFlip(RotateFlipType.Rotate180FlipNone);
            //}
            //else if (cropArgs.Rotation == 270) {
            //    retVal.RotateFlip(RotateFlipType.Rotate270FlipNone);
            //}

            //return retVal;
        } else {
            canvas.height = img.height;
            canvas.width = img.width;

            canvasContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
        }
    }

    private getCurrentSelection(): ImageCropSelection {
        var img = $(this.getImageElement()).first();
        var cropHolder = $(this.$refs.imageCroppingContainer).find(".jcrop-active").first();
        var dataParam = new Object() as ImageCropSelection;
        dataParam.ImageHeight = Math.round(cropHolder.height());
        dataParam.ImageWidth = Math.round(cropHolder.width());
        dataParam.FileName = img.attr("src");
        dataParam.Rotation = 0;
        dataParam.CreateThumbs = false;
        dataParam.TargetContainer = "savethedate";

        try {
            var selectedBounds = window["currentJCrop"].getSelection();
            dataParam.SelectionX = Math.round(selectedBounds.x);
            dataParam.SelectionY = Math.round(selectedBounds.y);
            dataParam.SelectionHeight = Math.round(selectedBounds.h);
            dataParam.SelectionWidth = Math.round(selectedBounds.w);
            dataParam.WasCropped = true;
        } catch (e) {
            dataParam.SelectionX = 0;
            dataParam.SelectionY = 0;
            dataParam.SelectionHeight = 0;
            dataParam.SelectionWidth = 0;
            dataParam.WasCropped = false;
        }

        return dataParam;
    }

    render(h) {
        return (
            <span ref="imageCropModalContainer">
                <Modal ref="imageCropModal" title={this.title} size={ModalSize.Large} blocked={this.blocked} dismissable={false}>
                    <ModalBody>
                        {!isNullOrEmpty(this.titleMessageHtml) && (
                            <p class="cropper-title-message">
                                <HtmlLiteral innerHTML={this.titleMessageHtml} />
                            </p>
                        )}

                        <div ref="imageCroppingContainer" class="cropper-root" style={`background-image: url('${textureImg}')`}>
                            <img ref="imageCropImage" data-filename={this.fileName} class="eventLogoCropImage" />
                            <canvas ref="imageCropCanvas" style="display:none" />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button layout={ButtonLayout.Secondary} dismissModal={true} text={AppState.resources.cancel} clicked={() => {}} />
                        <Button
                            layout={ButtonLayout.Primary}
                            text="OK"
                            clicked={() => {
                                this.onSaveButtonClicked();
                            }}
                        />
                    </ModalFooter>
                </Modal>
            </span>
        );
    }
}

export default toNative(ImageCropModal);
