import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Dropzone from "dropzone";
import Sortable from "sortablejs";
import "dropzone/dist/min/dropzone.min.css";
import "./css/gallery-dropzone.css";
import StringUtils from "../../common/utils/string-utils";

interface DropzoneFormItem {
    name: string;
    value: string;
}

interface DropzoneGalleryArgs {
    items: DropzoneGalleryItem[];
    changed?: (items: DropzoneGalleryItem[]) => void;
    uploadUrl: string;
    headers?: any;
    resizeBeforeUpload?: DropzoneResizeBeforeUploadArgs;
    parseNewItemFromResponse?: (resp: any) => DropzoneGalleryItem;
    formArr?: DropzoneFormItem[];
    errInvalidFileMessage: string;
    defaultMessage: string;
    errorHandler: (err: string) => void;
}

interface DropzoneResizeBeforeUploadArgs {
    enabled: boolean;
    maxSize: number;
    quality?: number; //0.0 - 1.0
}

export interface DropzoneGalleryItem {
    Id: number;
    ImageUrl: string;
    SortOrder: number;
}

@Component
class DropzoneGallery extends TsxComponent<DropzoneGalleryArgs> implements DropzoneGalleryArgs {
    instance: any;
    @Prop() items: DropzoneGalleryItem[];
    @Prop() errorHandler: (err: string) => void;
    @Prop() uploadUrl: string;
    @Prop() headers: any;
    @Prop() resizeBeforeUpload?: DropzoneResizeBeforeUploadArgs;
    @Prop() formArr?: DropzoneFormItem[];
    @Prop() parseNewItemFromResponse?: (resp: any) => DropzoneGalleryItem;
    @Prop() defaultMessage: string;
    @Prop() errInvalidFileMessage: string;
    @Prop() changed?: (items: DropzoneGalleryItem[]) => void;

    mounted() {
        this.bindScript();
    }

    updateSortOrder(itemArr?: DropzoneGalleryItem[]) {
        itemArr = itemArr || this.items.clone().sortBy((p) => p.SortOrder);
        itemArr.forEach((item, i) => {
            if (item != null) {
                item.SortOrder = i;
            }
        });

        if (this.changed != null) {
            this.changed(itemArr);
        }
    }

    bindScript() {
        var mySelf = this;
        this.instance = $(this.$refs.galleryDropzone)["dropzone"]({
            //autoProcessQueue: true,
            url: mySelf.uploadUrl,
            headers: mySelf.headers,
            previewTemplate:
                '<div class="dz-preview dz-file-preview">\n  <div class="dz-image"><div data-dz-thumbnail /></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename"><span data-dz-name></span></div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>',
            maxFilesize: 5, // MB
            accept: function (file, done) {
                var _this = this;
                var extension = file.name.split(".").pop();

                if ($.inArray(extension.toLowerCase(), ["jpg", "jpeg", "png"]) > -1) {
                    done();
                } else {
                    done(file.name + " - " + mySelf.errInvalidFileMessage);
                    _this.removeFile(file);
                }
            },
            thumbnail: function thumbnail(file, dataUrl, sortOrder) {
                if (file.previewElement) {
                    file.previewElement.classList.remove("dz-file-preview");
                    for (
                        var _iterator6 = file.previewElement.querySelectorAll("[data-dz-thumbnail]"), _isArray6 = true, _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();
                        ;

                    ) {
                        var _ref5;

                        if (_isArray6) {
                            if (_i6 >= _iterator6.length) break;
                            _ref5 = _iterator6[_i6++];
                        } else {
                            _i6 = _iterator6.next();
                            if (_i6["done"]) break;
                            _ref5 = _i6["value"];
                        }

                        var thumbnailElement = _ref5;
                        sortOrder = mySelf.items.length + 1;

                        thumbnailElement.setAttribute("sortOrder", sortOrder);
                        thumbnailElement.style.width = "100%";
                        thumbnailElement.style.height = "100%";
                        thumbnailElement.style.backgroundImage = "url('" + dataUrl + "')";
                        thumbnailElement.style.backgroundSize = "cover";
                        thumbnailElement.style.backgroundRepeat = "no-repeat";
                        thumbnailElement.style.backgroundPosition = "center center";
                    }

                    return setTimeout(function () {
                        return file.previewElement.classList.add("dz-image-preview");
                    }, 1);
                }
            },
            init: function () {
                const addFile = this.addFile;
                this.addFile = async (file: File) => {
                    if (mySelf.resizeBeforeUpload?.enabled == true) {
                        const result = await scaleImageBeforeUpload(file, mySelf.resizeBeforeUpload.maxSize, mySelf.resizeBeforeUpload.quality);

                        if (result.resized) {
                            addFile.call(this, result.fileBlob);
                        } else {
                            addFile.call(this, file);
                        }
                    } else {
                        addFile.call(this, file);
                    }
                };

                this.on("addedfile", function (this: any, file) {
                    // hide display initial dz-message
                    (document.querySelector(".dz-message") as HTMLElement).style.display = "none";
                    // Create the remove button
                    var removeButton = Dropzone.createElement('<a class="dz-gallery-remove-button" href="javascript:" style="cursor:pointer; font-size: 20px; font-weight: bold; color: black">X</a>');

                    var _this = this;
                    // remove image from dropzone and adjust new sortorder attribute
                    removeButton.addEventListener("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let removeItem;
                        let matchingArr = mySelf.items.filter((p) => p.ImageUrl == file.url);

                        if (matchingArr.length == 1) {
                            removeItem = matchingArr[0];
                        } else {
                            removeItem = mySelf.items.find((item) => {
                                if (item.Id > 0) {
                                    return item.Id == file.uuid;
                                } else {
                                    return item["_uuid"] == file.uuid;
                                }
                            });
                        }

                        mySelf.items.remove(removeItem);
                        // Remove the file preview.
                        _this.removeFile(file);
                        mySelf.updateSortOrder();
                        // show init dropzone message only if there is no image
                        if (document.getElementsByClassName("dz-preview").length == 0) {
                            document.querySelector(".dz-message")["style"].display = "block";
                        } else {
                            document.querySelector(".dz-message")["style"].display = "none";
                        }
                    });
                    // Add the button to the file preview element.
                    file.previewElement.getElementsByClassName("dz-details")[0].appendChild(removeButton);
                });

                this.on("success", function (file, response) {
                    let newItem: DropzoneGalleryItem;
                    if (mySelf.parseNewItemFromResponse != null) {
                        newItem = mySelf.parseNewItemFromResponse(response);
                    }

                    if (newItem == null) {
                        newItem = {
                            Id: 0,
                            ImageUrl: response,
                            SortOrder: mySelf.items.length + 1,
                        };
                    }

                    newItem["_uuid"] = Math.floor(Math.random() * 2000000000) * -1;
                    file.uuid = newItem["_uuid"];
                    mySelf.items.push(newItem);

                    if (mySelf.changed != null) {
                        mySelf.changed(mySelf.items);
                    }
                });

                this.on("error", function (file, error, xhr) {
                    mySelf.errorHandler(error);
                });

                var self = this;

                //initialization of existing images into dropzone area
                if (mySelf.items != null && mySelf.items.length > 0) {
                    var eventGallery = mySelf.items.clone().sortBy((p) => p.SortOrder);
                    for (var i = 0; i < eventGallery.length; i++) {
                        let id = eventGallery[i].Id;
                        if (id < 1 && eventGallery[i]["_uuid"] == null) {
                            eventGallery[i]["_uuid"] = Math.floor(Math.random() * 2000000000) * -1;
                            id = eventGallery[i]["_uuid"];
                        }

                        var mock = {
                            name: eventGallery[i].Id,
                            size: 12345,
                            type: "image/jpeg",
                            url: eventGallery[i].ImageUrl,
                            sortOrder: eventGallery[i].SortOrder,
                            uuid: id,
                        };
                        self.emit("addedfile", mock);
                        self.emit("thumbnail", mock, mock.url, mock.sortOrder);
                        self.emit("complete", mock);
                    }
                    document.querySelector(".dz-message")["style"].display = "none";
                } else {
                    document.querySelector(".dz-message")["style"].display = "block";
                }
            },
        });

        new Sortable(this.$refs.galleryDropzone, {
            animation: 150,
            onEnd: (evt) => {
                let oldIndex = evt.oldIndex - 2;
                let newIndex = evt.newIndex - 2;
                let itemArr = this.items.clone().sortBy((p) => p.SortOrder);
                let item = itemArr[oldIndex];

                itemArr.remove(item);
                itemArr.insertAt(item, newIndex);
                this.updateSortOrder(itemArr);
            },
        });
    }

    render(h) {
        return (
            <div class="gallery-dropzone">
                <form class="dropzone" ref={"galleryDropzone"}>
                    {this.formArr != null && this.formArr.map((p) => <input type="hidden" name={p.name} value={p.value} />)}

                    <div class="dz-message" style="display: block" data-dz-message>
                        <i class="far fa-image fa-3x" aria-hidden="true"></i>
                        <br />
                        <span class="gallery-insert-image">&nbsp;{this.defaultMessage}</span>
                    </div>
                </form>
            </div>
        );
    }
}

export async function scaleImageBeforeUpload(file: File, maxSize: number, quality?: number): Promise<{ resized: boolean; fileBlob: File }> {
    // ensure the file is an image
    if (!file.type.match(/image.*/)) {
        return {
            resized: false,
            fileBlob: null,
        };
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);

    await new Promise<Event>((res) => (image.onload = res));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: true });

    var width = image.width;
    var height = image.height;
    if (width > height) {
        if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
        } else {
            return {
                resized: false,
                fileBlob: null,
            };
        }
    } else {
        if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
        } else {
            return {
                resized: false,
                fileBlob: null,
            };
        }
    }
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    let blob: Blob;
    if (quality != null) {
        blob = await new Promise((res) => canvas.toBlob(res, file.type, quality));
    } else {
        blob = await new Promise((res) => canvas.toBlob(res));
    }

    (blob as any).name = StringUtils.normalizeFileName(file.name);
    (blob as any).lastModifiedDate = new Date();
    (blob as any).lastModified = (blob as any).lastModifiedDate.getTime();

    return {
        resized: true,
        fileBlob: blob as any,
    };
}

export default toNative(DropzoneGallery);
