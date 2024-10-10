import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Modal from "../modal/modal";
interface ShareComponentBindingArgs {}
import "./css/share.css";
import NotificationProvider from "../../ui/notification";

interface ShareComponentArgs {
    shareUrl: string;
    shareTitle: string;
}

export class ShareHelper {
    static nativeShare(title: string, url: string): void {
        navigator["share"]({
            title: title,
            text: "",
            url: url,
        })
            .then(() => {
                //on success
            })
            .catch((error) => {
                console.log("Error sharing:", error);
            });
    }
}

@Component
class ShareComponent extends TsxComponent<ShareComponentArgs> implements ShareComponentArgs {
    @Prop() shareUrl: string;
    @Prop() shareTitle: string;
    FB_APP_ID: string = "144914712372771";

    private isInAppBrowser(): boolean {
        var ua = (navigator.userAgent || "").toLowerCase();
        return ua.contains("fbav") || ua.contains("fban") || ua.contains("instagram") || ua.contains("twitter");
    }

    private getUrl(): string {
        return this.shareUrl;
    }

    private isMobile(): boolean {
        return portalUtils.isAndroid() || portalUtils.isIOS();
    }

    private facebookShare(): void {
        window.open("https://www.facebook.com/sharer/sharer.php?u=" + this.getUrl());
    }

    private twitterShare(): void {
        var text = this.shareTitle;
        var url = "https://twitter.com/intent/tweet?url=" + this.getUrl() + "&text=" + encodeURIComponent(text);
        window.open(url);
    }

    private facebookMessengerShare(): void {
        if (this.isInAppBrowser()) {
            alert("ERROR - Unable to open in Facebook browser, open the entry in your system browser and try again");
            return;
        }

        if (this.isMobile()) {
            window.open("fb-messenger://share?link=" + encodeURIComponent(this.getUrl()) + "&app_id=" + encodeURIComponent(this.FB_APP_ID), "_system");
        } else {
            window.open(
                "https://www.facebook.com/dialog/send?link=" +
                    encodeURIComponent(this.getUrl()) +
                    "&app_id=" +
                    encodeURIComponent(this.FB_APP_ID) +
                    "&redirect_uri=" +
                    encodeURIComponent(this.getUrl()),
                "_system"
            );
        }
    }

    private whatsAppShare(): void {
        if (this.isMobile()) {
            window.open("whatsapp://send?text=" + encodeURIComponent(this.getUrl()));
        } else {
            window.open("https://web.whatsapp.com/send?text=" + encodeURIComponent(this.getUrl()));
        }
    }

    private redditShare(): void {
        window.open("https://reddit.com/submit?url=" + encodeURIComponent(this.getUrl()) + "&title=" + encodeURIComponent(this.shareTitle));
    }

    private pinterestShare(): void {
        window.open("https://pinterest.com/pin/create/button/?url=" + encodeURIComponent(this.getUrl()) + "&description=" + encodeURIComponent(this.shareTitle));
    }

    private linkedInShare(): void {
        window.open("https://www.linkedin.com/shareArticle?url=" + encodeURIComponent(this.getUrl()) + "&title=" + encodeURIComponent(this.shareTitle));
    }

    private emailShare(): void {
        window.location.href = "mailto:?body=" + encodeURIComponent(this.shareTitle) + "<br><br>" + this.getUrl();
    }

    private smsShare(): void {
        window.open("sms:?body=" + encodeURIComponent(this.shareTitle + ", " + this.getUrl()));
    }

    private copyToClipboard(): void {
        (navigator["permissions"] as any).query({ name: "clipboard-write" }).then((result) => {
            if (result.state == "granted" || result.state == "prompt") {
                navigator["clipboard"].writeText(this.getUrl()).then(function () {
                    NotificationProvider.showSuccessMessage(AppState.resources.copyToClipboardSuccess);
                });
            }
        });
    }

    private render(h) {
        if (portalUtils.hasNativeShare()) {
            return null;
        } else {
            return (
                <div>
                    <div class="share-cmp">
                        <div onClick={() => this.copyToClipboard()}>
                            <div class="share-cmp-icon">
                                <i class="far fa-copy"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>{AppState.resources.copyToClipboard}</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.facebookShare()}>
                            <div class="share-cmp-icon">
                                <i class="fab fa-facebook-f"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>Facebook</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.facebookMessengerShare()}>
                            <div class="share-cmp-icon">
                                <i class="fab fa-facebook-messenger"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>Facebook Messenger</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.whatsAppShare()}>
                            <div class="share-cmp-icon">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>WhatsApp</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.twitterShare()}>
                            <div class="share-cmp-icon">
                                <i class="fab fa-twitter"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>Twitter</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.redditShare()}>
                            <div class="share-cmp-icon">
                                <i class="fab fa-reddit-square"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>Reddit</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.pinterestShare()}>
                            <div class="share-cmp-icon">
                                <i class="fab fa-pinterest-square"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>Pinterest</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.linkedInShare()}>
                            <div class="share-cmp-icon">
                                <i class="fab fa-linkedin"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>LinkedIn</span>
                            </div>
                        </div>
                    </div>

                    <div class="share-cmp">
                        <div onClick={() => this.emailShare()}>
                            <div class="share-cmp-icon">
                                <i class="fas fa-at"></i>
                            </div>
                            <div class="share-cmp-content" data-bind="emailTo">
                                <span>Email</span>
                            </div>
                        </div>
                    </div>

                    {this.isMobile() && (
                        <div class="share-cmp" onClick={() => this.smsShare()}>
                            <div class="share-cmp-icon">
                                <i class="far fa-comment"></i>
                            </div>
                            <div class="share-cmp-content">
                                <span>SMS</span>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    }
}

export default toNative(ShareComponent);
