import NotificationProvider from "../../../ui/notification";
import { BootstrapModal } from "../../../ui/bootstrap-modal";
import "./../css/file-manager-dialog.css";

export const enum FileManagerModalFileType {
    Image = 1,
    All = 2,
    Media = 3,
}

interface FileManagerModalResponseArgs {
    url: string;
}

interface FileManagerModalArgsBase {
    fileType?: FileManagerModalFileType;
    maxWidth?: number;
}

interface FileManagerModalArgs extends FileManagerModalArgsBase {
    callback: (args: FileManagerModalResponseArgs) => void;
}

export class FileManagerDialog {
    static showPromise(args: FileManagerModalArgsBase): Promise<FileManagerModalResponseArgs> {
        return new Promise((resolve, reject) => {
            let superArgs: FileManagerModalArgs = args as any;
            superArgs.callback = (args) => {
                resolve(args);
            };

            this.show(superArgs);
        });
    }

    static show(args: FileManagerModalArgs) {
        $("#fileManagerDialog").remove();
        $(FileManagerDialog.getModalTemplate()).appendTo("body");
        BootstrapModal.show({
            id: "fileManagerDialog",
        });

        var self = FileManagerDialog;
        var iframeUrl =
            "/assets/plugins/tinymce/plugins/tinyfilemanager.net/dialog/tfmdialog?type=" + (args.fileType || 0) + "&callback=onMceDialogCallback&editor=noeditor&lang=" + AppState.currentLanguageCode;

        if (args.maxWidth != null) {
            iframeUrl += "&maxwidth=" + args.maxWidth.toString();
        }

        var context = $("#fileManagerDialog").find(".dialog-frame");
        context.find("iframe").remove();

        window["onMceDialogCallback"] = function (cbArgs) {
            self.tryRemoveCallback();
            args.callback(cbArgs);
            self.hideManagerDialog();
        };

        var ifr = document.createElement("iframe");
        ifr.setAttribute("style", "border:0px;height:600px;");
        ifr.setAttribute("class", "file-manager-iframe");
        ifr.onload = function () {
            setTimeout(() => {
                context.find(".holdon-overlay").remove();
            }, 1000);
        };

        ifr.onerror = function () {
            context.find(".holdon-overlay").remove();
            NotificationProvider.showErrorMessage("Error loading file manager");
            self.hideManagerDialog();
        };

        context[0].appendChild(ifr);
        ifr.src = iframeUrl;
    }

    private static getModalTemplate(): string {
        return '<div id="fileManagerDialog" tabindex="-1" role="dialog" aria-labelledby="fileManagerDialoglabel" aria-hidden="true" class="modal fade file-manager-modal"><div role="document" class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 id="fileManagerDialoglabel" class="modal-title">File manager</h5><button type="button" data-dismiss="modal" aria-label="Close" class="close"><span aria-hidden="true">×</span></button></div><div class="modal-body"><div class="dialog-frame" style="min-height: 600px; position: relative;"><div class="holdon-white holdon-overlay holdon-element"><div class="holdon-content"><div class="sk-rect"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div></div></div></div></div></div>';
    }

    private static hideManagerDialog() {
        BootstrapModal.hide({
            id: "fileManagerDialog",
        });
    }

    private static tryRemoveCallback() {
        try {
            delete window["onMceDialogCallback"];
        } catch (e) {}
    }
}
