import TsxComponent, { Component } from "../../app/vuetsx";
import { DialogUtils } from "../../common/dialog-utils";
import { ButtonLayout } from "../../framework/button/button-layout";
import LaddaButton from "../../framework/button/ladda-button";
import LoadingIndicator from "../../framework/loading-indicator";
import Modal, { ModalSize } from "../../framework/modal/modal";
import ModalBody from "../../framework/modal/modal-body";
import ModalFooter from "../../framework/modal/modal-footer";
import { IWebApiClient, WebClientApiMethod } from "../../api/IWebClient";

interface QuickEditModalBaseArgs {}

export interface QuickEditModalBaseDisplayArgs<T> {
    items: T[];
    apiClient: IWebApiClient;
    onComplete: () => void;
    onHidden?: () => void;
}

export default abstract class QuickEditModalBase<T> extends TsxComponent<QuickEditModalBaseArgs> implements QuickEditModalBaseArgs {
    isLoading: boolean = false;
    selectedItems: T[] = null;
    apiClient: IWebApiClient = null;
    onComplete: () => void = null;

    show(args: QuickEditModalBaseDisplayArgs<T>) {
        if (isNullOrEmpty(args?.items)) {
            return;
        }

        this.isLoading = false;
        this.selectedItems = args.items;
        this.apiClient = args.apiClient;
        this.onComplete = args.onComplete;

        this.getModal().show({
            onHidden: () => {
                if (args.onHidden != null) {
                    args.onHidden();
                }
            },
        });
    }

    getModal() {
        return this.$refs.quickEditModal as typeof Modal.prototype;
    }

    getTitle(): string {
        return AppState.resources.quickEdit + `(${AppState.resources.quickEditItemsCount} ${this.selectedItems?.length})`;
    }

    abstract getFetchArgs(item): any;
    abstract getSaveModelArr(modelArr: any[]): any[];
    abstract getItemName(item): string;
    abstract getModelFromSaveArgs(item: any): any;
    abstract renderBody(h): any;
    abstract validate(): boolean;

    protected postProcessSaveData(saveArr: any[]) {}

    protected getModalSize(): ModalSize {
        return ModalSize.Normal;
    }

    async saveClicked() {
        if (!this.validate()) {
            return;
        }

        this.isLoading = true;
        const itemArr: T[] = [];
        for (const item of this.selectedItems) {
            const loadedModel = await this.apiClient[WebClientApiMethod.Get](this.getFetchArgs(item));
            if (loadedModel != null) {
                itemArr.push(loadedModel);
            }
        }

        const errArr: string[] = [];
        const saveArr = this.getSaveModelArr(itemArr);
        this.postProcessSaveData(saveArr);

        for (const saveItem of saveArr) {
            try {
                await (this.apiClient as any).update(saveItem);
            } catch (error) {
                const itemName = this.getItemName(saveItem);
                if (!isNullOrEmpty(itemName)) {
                    errArr.push(itemName);
                } else {
                    throw "break";
                }
            }
        }

        if (!isNullOrEmpty(errArr)) {
            DialogUtils.showErrorMessageDialog(AppState.resources.quickEditErrorNamed.format(errArr.map((p) => portalUtils.htmlEscape(p)).join(",")));
            this.getModal().hide();
            return;
        }

        this.isLoading = false;
        if (this.onComplete != null) {
            this.onComplete();
        }

        this.getModal().hide();
    }

    render(h) {
        return (
            <Modal title={this.getTitle()} ref="quickEditModal" size={this.getModalSize()}>
                <ModalBody>
                    <LoadingIndicator visible={this.isLoading} />
                    {this.renderBody(h)}
                </ModalBody>
                <ModalFooter>
                    <LaddaButton
                        layout={ButtonLayout.Primary}
                        text={AppState.resources.save}
                        icon={"far fa-save"}
                        clicked={async (e) => {
                            await this.saveClicked();
                        }}
                    />
                </ModalFooter>
            </Modal>
        );
    }
}
