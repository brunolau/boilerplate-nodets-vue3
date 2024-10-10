import { ResponseMessage } from "./response-message";

export class ImageResponse {
    file: {
        id: number;
        path: string;
    };

    messages: ResponseMessage[];
}

export class OnUploadImageResponse {
    file: File;
    imagePath: string;
}
