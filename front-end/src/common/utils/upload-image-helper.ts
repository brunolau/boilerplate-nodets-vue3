import { ATTRACTION_TYPE } from "../../api/data-contracts/enums";
import { ImageResponse, OnUploadImageResponse } from "../../api/data-contracts/image";
import { BrowserImageCompression } from "./broswer-image-compression";
import StringUtils from "./string-utils";

export class UploadImageHelper {
    static async postImage(file: File, attractionType: ATTRACTION_TYPE | string): Promise<ImageResponse> {
        if (file.type != "image/svg+xml") {
            file = await BrowserImageCompression.compress(file);
        }

        let formData: FormData = new FormData();
        let fileObj = new File([file], StringUtils.normalizeFileName(file.name));

        formData.append("pathToFolder", "photos/" + attractionType + "/");
        formData.append("file", fileObj);

        let response = await fetch(appHttpProvider.enforceDomain + "files", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: "Bearer " + appHttpProvider.bearerToken,
                "Accept-Language": AppState.currentLanguageCode,
            },
        });

        return (await response.json()) as ImageResponse;
    }

    static onUploadImage(e: File): OnUploadImageResponse {
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(e);

        return {
            file: e,
            imagePath: imageUrl,
        };
    }
}
