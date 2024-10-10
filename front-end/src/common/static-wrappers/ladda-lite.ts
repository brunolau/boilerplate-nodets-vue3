class LaddaLiteProvider {
    static showSpin(target: HTMLElement): void {
        window["laddaLite"].showSpin(target);
    }
    static hideSpin(target: HTMLElement): void {
        window["laddaLite"].hideSpin(target);
    }
}

window["LaddaLiteProvider"] = LaddaLiteProvider;
