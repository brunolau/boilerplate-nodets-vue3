import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Modal from "../modal/modal";
import { NamePreserver } from "../../common/name-preserver";
import ModalBody from "../modal/modal-body";
import ModalFooter from "../modal/modal-footer";
import Button from "../button/button";
import { ButtonLayout } from "../button/button-layout";
import { TableColumn } from "./datatable";
import CheckBox from "../input/checkbox";

interface ColVisModalArgs {
    columns: TableColumn[];
    changed: (columns: TableColumn[]) => void;
}

export interface ColVisMethods {
    show: () => void;
}

@Component
class ColVisModal extends TsxComponent<ColVisModalArgs> implements ColVisModalArgs, PublicMethodSet<ColVisMethods> {
    @Prop() columns!: TableColumn[];
    @Prop() changed: (columns: TableColumn[]) => void;

    methods = {
        show: () => {
            (this.$refs.colVisDialog as typeof Modal.prototype).show();
        },
    };

    onColumnChanged(col: TableColumn, visible: boolean): void {
        col.visible = visible;

        if (col.visible == true) {
            col["_enforceVisible"] = true;
        } else {
            if (col["_enforceVisible"] != null) {
                delete col["_enforceVisible"];
            }
        }

        this.changed(this.columns);
    }

    render(h) {
        return (
            <Modal ref="colVisDialog" title={AppState.resources.colVisLabel}>
                <ModalBody>
                    {this.columns &&
                        this.columns.map((col) => (
                            <div class="row">
                                <div class="col-md-12">
                                    <CheckBox label={null} wrap={false} checkboxLabelHtml={col.caption} value={col.visible != false} changed={(e) => this.onColumnChanged(col, e)} />
                                </div>
                            </div>
                        ))}
                </ModalBody>
                <ModalFooter>
                    <Button dismissModal={true} text="OK" layout={ButtonLayout.Default} clicked={() => {}} />
                </ModalFooter>
            </Modal>
        );
    }
}

export default toNative(ColVisModal);
