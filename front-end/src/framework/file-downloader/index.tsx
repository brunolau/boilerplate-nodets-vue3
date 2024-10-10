import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Modal, { ModalSize } from "../modal/modal";
import ModalFooter from "../modal/modal-footer";
import ModalBody from "../modal/modal-body";
import LoadingIndicator from "../loading-indicator";
interface FileDownloadDialogBindingArgs {}

interface FileDownloadDialogShowArgs {
    files: Array<string>;
    threadCount?: number;
    titleHtml?: string;
    messageHtml?: string;
    expectedDownloadMin?: number;
    expectedDownloadMax?: number;
}

interface FileDownloadData {
    url: string;
    downloadFileName: string;
    retryCount: number;
}

@Component
class FileDownloadDialog extends TsxComponent<FileDownloadDialogBindingArgs> implements FileDownloadDialogBindingArgs {
    private totalCount: number = null;
    private downloadedCount: number = null;
    private errorList: string[] = null;
    private isCancelled: boolean = false;

    downloadFiles(args: FileDownloadDialogShowArgs) {
        var mySelf = this;
        var fileArr = this.getFileDownloadData(args);
        var initialCount = fileArr.length;
        var startedDownloadCount = 0;

        //Reset params
        this.totalCount = fileArr.length;
        this.downloadedCount = 0;
        this.errorList = [];
        this.isCancelled = false;

        if (args.expectedDownloadMax == null || args.expectedDownloadMax == 0) {
            args.expectedDownloadMax = 7500;
        }

        if (args.expectedDownloadMin == null || args.expectedDownloadMin == 0) {
            args.expectedDownloadMin = 3000;
        }

        //Direct port from older framework
        var onAfterDownloadComplete = () => {
            if (fileArr.length > 0) {
                innerDownload();
            } else {
                if (!mySelf.hasErrors()) {
                    setTimeout(function () {
                        mySelf.getModal().hide();
                    }, 4000);
                }
            }
        };

        function innerDownload() {
            var currentFile = fileArr.shift();
            if (currentFile != null) {
                var downloadMethod;
                if (window["fetch"]) {
                    downloadMethod = mySelf.downloadUsingFetch;
                } else {
                    downloadMethod = mySelf.downloadUsingXMLHTTP;
                }

                var randomId = "ifl-" + portalUtils.randomString(10);
                startedDownloadCount += 1;
                mySelf.updateCounter(Math.min(initialCount, startedDownloadCount), initialCount);

                downloadMethod(
                    currentFile,
                    function (dlResponse) {
                        var blob = dlResponse.blob;
                        var headers = dlResponse.headers;
                        var downloadFileName: string = null;

                        try {
                            if (headers.forEach != null) {
                                headers.forEach(function (val, key) {
                                    if (key.toLowerCase() == "content-disposition") {
                                        var fnArr = val.split("filename=");
                                        if (fnArr.length > 1) {
                                            downloadFileName = fnArr[1].split(";")[0];
                                        }
                                    }
                                });
                            }
                        } catch (e) {}

                        var _OBJECT_URL = URL.createObjectURL(blob);
                        var dummyLink = document.createElement("a");

                        dummyLink.setAttribute("id", randomId);
                        document.body.append(dummyLink);

                        setTimeout(function () {
                            document.getElementById(randomId).setAttribute("href", _OBJECT_URL);
                            document.getElementById(randomId).setAttribute("download", downloadFileName || currentFile.downloadFileName || randomId + ".pdf");

                            setTimeout(function () {
                                document.getElementById(randomId).click();

                                setTimeout(function () {
                                    window.URL.revokeObjectURL(_OBJECT_URL);
                                    document.body.removeChild(dummyLink);
                                }, 5000);

                                setTimeout(function () {
                                    onAfterDownloadComplete();
                                }, 50);
                            }, 50);
                        }, 50);
                    },
                    function () {
                        currentFile.retryCount += 1;

                        if (currentFile.retryCount < 4) {
                            fileArr.push(currentFile);
                            innerDownload();
                        } else {
                            mySelf.appendError(currentFile);
                            onAfterDownloadComplete();
                        }
                    }
                );
            }
        }

        mySelf.getModal().show({
            onShown: function () {
                var threadCount = args.threadCount || 5;
                for (var i = 0; i < threadCount; i++) {
                    setTimeout(function () {
                        innerDownload();
                    }, mySelf.getDelay(args));
                }

                mySelf.updateCounter(startedDownloadCount, initialCount);
            },
        });
    }

    private downloadUsingXMLHTTP(file: FileDownloadData, success: (response: any) => void, error: () => void): void {
        var request = new XMLHttpRequest();
        request.addEventListener("readystatechange", function (e) {
            if (request.readyState == 4) {
                if (request.status < 400 && request.status >= 200) {
                    success({
                        blob: request.response,
                        headers: {},
                    });
                } else {
                    error();
                }
            }
        });

        request.responseType = "blob";
        request.open("get", file.url);
        request.send();
    }

    private downloadUsingFetch(file: FileDownloadData, callback: (response: any) => void, error: () => void): void {
        let winFetch = window["fetch"] as any;
        winFetch(file.url, {
            method: "get",
            headers: {},
        }).then(function (response) {
            response.blob().then(function (blob) {
                callback({
                    blob: blob,
                    headers: response.headers,
                });
            });
        });
    }

    private getModal() {
        return this.$refs.fileDownloadDialog as typeof Modal.prototype;
    }

    private getFileDownloadData(args: FileDownloadDialogShowArgs): FileDownloadData[] {
        var retVal: FileDownloadData[] = [];

        args.files.forEach((url) => {
            retVal.push({
                url: url,
                downloadFileName: this.getDownloadFileName(url),
                retryCount: 0,
            });
        });

        return retVal;
    }

    private getDownloadFileName(url: string): string {
        const TICKET_URL = "/ticket-pdf?id=";

        if (url.indexOf(TICKET_URL) > -1) {
            var retItem = url.replace(TICKET_URL, "");
            return retItem.substring(0, retItem.indexOf("&"));
        }

        return null;
    }

    private getDelay(args: FileDownloadDialogShowArgs): number {
        return Math.floor(Math.random() * args.expectedDownloadMax) + args.expectedDownloadMin; //As there is no real way to tell if download has finished or succeeded besides passing a cookie, lets play it ugly
    }

    private hasErrors(): boolean {
        return this.errorList != null && this.errorList.length > 0;
    }

    private updateCounter(downloadedCount: number, initialCount: number): void {
        this.downloadedCount = downloadedCount;
        this.totalCount = initialCount;
    }

    private appendError(data: FileDownloadData): void {
        this.errorList.push(data.downloadFileName || data.url);
    }

    private getCompletePercent() {
        return Math.round((this.downloadedCount / this.totalCount) * 100) + " %";
    }

    private render(h) {
        return (
            <Modal ref="fileDownloadDialog" title={AppState.resources.fileDownloadTitle}>
                <ModalBody>
                    <div style="min-height:200px;position:relative;">
                        <LoadingIndicator visible={true} />
                    </div>
                    <h4 style="text-align:center;">{this.getCompletePercent()}</h4>

                    <div class="ifd-error" style="color:red;font-weight:bold;">
                        {this.errorList &&
                            this.errorList.map((err, i) => (
                                <div>
                                    {i > 0 && <br />}

                                    <div>
                                        {AppState.resources.error}: {err}
                                    </div>
                                </div>
                            ))}
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}

export default toNative(FileDownloadDialog);
