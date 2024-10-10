class HistoryHandlerExt {
    /**
     * Adds listener to back-button click on touch devices, this enables to hijack back button click and perform custom operation when pressed
     *
     * @param handlerId UUID of the handler
     * @param handlerPriority Numeric priority of the handler. Works similar to Z-Index. Handlers with higher priority execute first
     * @param handler Back button click handler, has ability to cancel the back button click and perform custom action
     */
    addOnBackButtonListener(handlerId: string, handlerPriority: number, handler: (args: HistoryHandlerExtBackButtonArgs) => void) {
        window["HistoryHandlerExt"].addOnBackButtonListener(handlerId, handlerPriority, handler);
    }

    /**
     * Starts the back button hijacking
     */
    startHijacking() {
        window["HistoryHandlerExt"].startHijacking();
    }
}

interface HistoryHandlerExtBackButtonArgs {
    /**
     * If cancel is set to true, back-button action is cancelled
     */
    cancel: boolean;
}
