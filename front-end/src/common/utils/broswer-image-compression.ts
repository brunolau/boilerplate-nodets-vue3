import imageCompression from "browser-image-compression";

export class BrowserImageCompression {
    static async compress(file: File): Promise<File> {
        const options = {
            maxSizeMB: 0.5,
            useWebWorker: true,
        };

        // console.log('Before:');
        // console.log('compressedFile instanceof Blob', file instanceof Blob);
        // console.log(`compressedFile size ${file.size / 1024 / 1024} MB`);

        let compressedImage: File = null;

        try {
            compressedImage = await imageCompression(file, options);
        } catch (error) {
            console.log(error);
        }

        // console.log('After:');
        // console.log('compressedFile instanceof Blob', file instanceof Blob);
        // console.log(`compressedFile size ${file.size / 1024 / 1024} MB`);
        return compressedImage;
    }
}
