import { toNative } from "vue-facing-decorator";
import { TopLevelComponentBase } from "../common/base-component";
import { AppMenuSet } from "../components/menu/app-menu-set";
import TextBox from "../framework/input/textbox";
import BootstrapToggle from "../framework/bootstrap-toggle";
import Card from "../framework/card/card";
import CardBody from "../framework/card/card-body";
import CardHeaderWithOptions, { CardHeaderDropdownArgs } from "../framework/card/card-header-with-options";
import { Component } from "../app/vuetsx";

@Component
class HelloWorldPage extends TopLevelComponentBase {
    name: string = null; //Needs to have =null suffixed so that TS compiler takes it into account
    boolValue: boolean = null;

    protected get breadcrumbItems(): BreadcrumbItem[] {
        return [
            {
                text: "Home",
                url: "/",
                icon: "icon-direction",
            },
            {
                text: "Hello world",
                url: null,
            },
        ];
    }

    protected get menuItems(): AppMenuItem[] {
        return AppMenuSet.instance.menuItems;
    }

    mounted() {
        window["_helloInstance"] = this;
    }

    getLineChartHeaderOptions(): CardHeaderDropdownArgs[] {
        let retVal: CardHeaderDropdownArgs[] = [];

        retVal.push({
            text: "Jedna moznosti",
            icon: "fas fa-download",
            clicked: () => alert("jedna"),
        });

        retVal.push({
            text: "Dva moznostka",
            icon: "fas fa-sync-alt",
            clicked: () => alert("dva"),
        });

        return retVal;
    }

    render(h) {
        return (
            <div>
                <p>Hello world from the boilerplate</p>
                <p>{`Your name is: ${this.name?.length > 0 ? this.name : "Not specified"}`}</p>
                <TextBox
                    label={"Your name"}
                    value={this.name}
                    changed={(e) => {
                        this.name = e;
                    }}
                />

                <BootstrapToggle
                    label={"Toggle"}
                    value={this.boolValue}
                    changed={(e) => {
                        this.boolValue = e;
                    }}
                />

                <Card>
                    <CardHeaderWithOptions smallTitle={"Graf vstupov"} dropdownOptions={this.getLineChartHeaderOptions()} />
                    <CardBody>raz dva tri</CardBody>
                </Card>
            </div>
        );
    }
}

export default toNative(HelloWorldPage);
