import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownButtonItem, { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import DropdownButtonSeparator from "../dropdown-button/dropdown-button-separator";
import "./css/card-header-with-options.css";

interface CardHeaderWithOptionsArgs {
    title?: string;
    subtitle?: string;
    smallTitle?: string;
    dropdownOptions: DropdownButtonItemArgs[];
}

export interface CardHeaderDropdownArgs extends DropdownButtonItemArgs {
    isSeparator?: boolean;
}

@Component
class CardHeaderWithOptions extends TsxComponent<CardHeaderWithOptionsArgs> implements CardHeaderWithOptionsArgs {
    @Prop() title!: string;
    @Prop() subtitle!: string;
    @Prop() smallTitle!: string;
    @Prop() dropdownOptions!: CardHeaderDropdownArgs[];

    render(h) {
        return (
            <div class="card-header ">
                {this.smallTitle && <h5 class="card-category">{this.smallTitle}</h5>}

                {this.title && (
                    <h4 class="card-title">
                        {this.title}

                        {this.subtitle != null && this.subtitle.length > 0 && <small class="description d-none d-md-inline"> - {this.subtitle}</small>}
                    </h4>
                )}

                <div class="dropdown card-header-options-dropdown">
                    <button type="button" class="btn btn-default dropdown-toggle no-caret" data-toggle="dropdown">
                        <i class="icon icon-settings"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        {this.dropdownOptions.map((di) =>
                            di.isSeparator != true ? (
                                <DropdownButtonItem clicked={di.clicked} href={di.href} hrefBlank={di.hrefBlank} icon={di.icon} img={di.img} text={di.text} isSelected={di.isSelected} />
                            ) : (
                                <DropdownButtonSeparator />
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default toNative(CardHeaderWithOptions);
