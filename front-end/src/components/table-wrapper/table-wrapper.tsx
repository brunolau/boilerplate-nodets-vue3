import { Prop, toNative } from "vue-facing-decorator";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import LoadingIndicator from "../../framework/loading-indicator";
import "./css/table-wrapper.css";
import { Component } from "../../app/vuetsx";

interface TableWrapperArgs {
    fullSizeTable?: boolean;
    isLoading: boolean;
}

@Component
class TableWrapper extends TsxComponentExtended<TableWrapperArgs> implements TableWrapperArgs {
    @Prop() fullSizeTable?: boolean;
    @Prop() isLoading: boolean;

    render(h) {
        return (
            <div class={"dwh-table-wrapper" + (this.fullSizeTable == true ? " dwh-table-fullsize" : "")}>
                <LoadingIndicator visible={this.isLoading == true} />
                {this.$slots.default?.()}
            </div>
        );
    }
}

export default toNative(TableWrapper);
