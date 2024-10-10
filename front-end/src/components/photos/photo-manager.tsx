import { Prop, toNative } from "vue-facing-decorator";
import { ATTRACTION_TYPE } from "../../api/data-contracts/enums";
import Photo from "../../api/data-contracts/photo";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import DropzoneGallery, { DropzoneGalleryItem } from "../../framework/dropzone/gallery-dropzone";
import FormItemWrapper from "../../framework/form/form-item-wrapper";
import { Component } from "../../app/vuetsx";

export interface IModelWithPhotos {
    photos: Photo[];
}

interface PhotoManagerArgs {
    itemModel: IModelWithPhotos;
}

class PhotoManagerUberModel extends Photo {
    Id: number = null;
    ImageUrl: string = null;
    SortOrder: number = null;
}

const rootValidations: ValidationRuleset<PhotoManager> = {
    itemModel: {
        photos: ValidationBuilder()
            .customRule("atLeastOnePhoto", function (this: PhotoManager) {
                return !isNullOrEmpty(this.itemModel.photos);
            })
            .build(),
    },
};

@Component({ validations: ValidationHelper.instance.transformRuleset(rootValidations) })
class PhotoManager extends TsxComponentExtended<PhotoManagerArgs> implements PhotoManagerArgs {
    @Prop() itemModel: IModelWithPhotos;

    translateItems(): DropzoneGalleryItem[] {
        if (isNullOrEmpty(this.itemModel?.photos)) {
            return [];
        }

        return this.itemModel.photos.map((p, i) => {
            return {
                Id: p.id as any,
                ImageUrl: p.fullPath,
                SortOrder: p.sortOrder,
            };
        });
    }

    parseServerResponse(resp): DropzoneGalleryItem {
        if (resp.file == null) {
            throw "break";
        }

        return {
            Id: resp.file.id,
            ImageUrl: resp.file.path,
            SortOrder: this.itemModel.photos.length + 1,
        };
    }

    render(h) {
        if (this.itemModel.photos == null) {
            this.itemModel.photos = [];
        }

        this.itemModel.photos.forEach((p, i) => {
            const uberModel: PhotoManagerUberModel = p as any;
            if (uberModel.Id == null) {
                uberModel.Id = p.id;
                uberModel.ImageUrl = p.fullPath;
                uberModel.SortOrder = p.sortOrder || 0;
            }
        });

        return (
            <FormItemWrapper label={""} wrap={false} validationState={this.validationStateOf(this.v$.itemModel.photos, this.resources.photosErrorMessage)}>
                <DropzoneGallery
                    items={this.itemModel.photos as any}
                    uploadUrl={appHttpProvider.enforceDomain + "files"}
                    parseNewItemFromResponse={(resp) => this.parseServerResponse(resp)}
                    defaultMessage={this.resources.photosInitialMessage}
                    errInvalidFileMessage={this.resources.photosInvalidFileMessage}
                    errorHandler={(err) => {
                        this.showErrorMessage(AppConfig.parseErrorMessage(err));
                    }}
                    headers={{
                        Authorization: "Bearer " + appHttpProvider.bearerToken,
                        "Accept-Language": AppState.currentLanguageCode,
                    }}
                    formArr={[
                        {
                            name: "pathToFolder",
                            value: "photos/" + "",
                        },
                    ]}
                    resizeBeforeUpload={{
                        enabled: true,
                        maxSize: 1920,
                        quality: 0.9,
                    }}
                    changed={(items) => {
                        this.itemModel.photos = items.map((p) => {
                            return {
                                id: p.Id,
                                fullPath: p.ImageUrl,
                                name: null,
                                path: null,
                                sortOrder: p.SortOrder,
                            };
                        });
                    }}
                />
            </FormItemWrapper>
        );
    }
}

export default toNative(PhotoManager);
