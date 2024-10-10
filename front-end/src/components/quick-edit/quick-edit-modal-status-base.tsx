import { ATTRACTION_TYPE, STATUS } from "../../api/data-contracts/enums";
import NotificationProvider from "../../ui/notification";
import CausePicker from "../dropdowns/cause-picker";
import StatusPicker from "../dropdowns/status-picker";
import CauseHelper from "../helper/causeHelper";
import QuickEditModalBase, { QuickEditModalBaseDisplayArgs } from "./quick-edit-modal-base";
interface QuickEditModalStatusBaseArgs {}

export default abstract class QuickEditModalStatusBase<T> extends QuickEditModalBase<QuickEditModalStatusBaseArgs> implements QuickEditModalStatusBaseArgs {
    abstract getFetchArgs(item): any;
    abstract getSaveModelArr(modelArr: any[]): any[];
    abstract getModelFromSaveArgs(item: any): any;
    abstract getItemName(item): string;
    abstract getAttractionType(): ATTRACTION_TYPE;
    status: STATUS = null;
    causeId: number = null;

    show(args: QuickEditModalBaseDisplayArgs<QuickEditModalStatusBaseArgs>): void {
        this.status = null;
        this.causeId = null;
        super.show(args);
    }

    getSelectedStatus(): STATUS {
        return this.status;
    }

    validate() {
        if (this.status != STATUS.OPEN && this.causeId == null) {
            NotificationProvider.showErrorMessage(AppState.resources.errorsOnForm);
            return false;
        }

        if (this.status == null) {
            NotificationProvider.showErrorMessage(AppState.resources.errorsOnForm);
            return false;
        }

        return true;
    }

    protected postProcessSaveData(saveArr: any[]) {
        if (this.status != null) {
            for (const saveItem of saveArr) {
                this.getModelFromSaveArgs(saveItem).status = this.status;
            }
        }

        if (this.causeId != null) {
            for (const saveItem of saveArr) {
                this.getModelFromSaveArgs(saveItem).causeID = CauseHelper.getCauseId(this.causeId, this.status);
            }
        }
    }

    render(h) {
        return super.render(h);
    }

    renderBody(h) {
        return (
            <div>
                <StatusPicker
                    selected={this.status}
                    changed={(e) => {
                        this.status = e;
                    }}
                />

                {this.getAttractionType() != null && this.status != STATUS.OPEN && (
                    <CausePicker
                        attractionType={this.getAttractionType()}
                        selected={this.causeId}
                        mandatory={true}
                        changed={(e) => {
                            this.causeId = e.id;
                        }}
                    />
                )}
            </div>
        );
    }
}
