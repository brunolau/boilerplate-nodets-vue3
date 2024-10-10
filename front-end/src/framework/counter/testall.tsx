import { toNative } from "vue-facing-decorator";
import { TopLevelComponentBase } from "../../common/base-component";

import TextBox from "../input/textbox";
import BootstrapToggle from "../bootstrap-toggle";
import Button from "../button/button";
import { ButtonLayout, ButtonSize } from "../button/button-layout";
import TextButton from "../button/text-button";
import Card from "../card/card";
import CardHeader from "../card/card-header";
import CardBody from "../card/card-body";
import CardHeaderWithOptions, { CardHeaderDropdownArgs } from "../card/card-header-with-options";
import DataTable from "../datatable/datatable";
import DataTableStatic from "../datatable/datatable-static";
import DropdownList, { DropdownListOption } from "../dropdown";
import DropdownButton from "../dropdown-button/dropdown-button";
import DropdownButtonItem from "../dropdown-button/dropdown-button-item";
import DropdownButtonSeparator from "../dropdown-button/dropdown-button-separator";
import FlexContainer from "../form/flex-container";
import FlexFormItem from "../form/form-item-flex";
import Fieldset from "../form/fieldset";
import FooterButtons from "../form/footer-buttons";
import Separator from "../form/separator";
import ValidationResultDisplayer from "../form/validation-result-displayer";
import Accordion from "../accordion/accordion";
import { AccordionPage } from "../accordion/accordion-page";
import FullCalendarDraggableEvent from "../fullcalendar/fullcalendar-draggable-event";
import TimegridCalendar, { TimegridCalendarEvent, TimegridCalendarAddClickedArgs } from "../fullcalendar/timegrid-calendar";
import HtmlLiteral from "../html-literal/html-literal";
import Modal, { ModalSize } from "../modal/modal";
import ModalBody from "../modal/modal-body";
import ModalFooter from "../modal/modal-footer";
import UploadImageAndCropButton from "../image-crop/upload-and-crop";
import CheckBox from "../input/checkbox";
import ColorPicker from "../input/color-picker";
import DaterangePicker from "../input/daterange-picker";
import DatetimePicker from "../input/datetime-picker";
import WysiwigEditor from "../input/wysiwig";
import NumericInput, { NumericInputMode } from "../input/numeric-input";
import Tabs, { TabsRenderMode } from "../tabs/tabs";
import { TabPage } from "../tabs/tab-page";
import { Component } from "../../app/vuetsx";

@Component
class TestAllComponentsPage extends TopLevelComponentBase {
    name: string = null; //Needs to have =null suffixed so that TS compiler takes it into account
    boolValue: boolean = null;
    selectedOptions: any = null;
    timeViewType: string = "resourceTimeline";
    timeEvents: TimegridCalendarEvent[] = [];
    blockModal: boolean = false;
    color: string = "#FF00FF";
    numberVal: number = 1;

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
        return [];
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

    getDummyDropdownOptions(): DropdownListOption[] {
        return [
            { id: "1", text: "Moznost 1" },
            { id: "2", text: "Moznost 2" },
        ];
    }

    addTimeEvent(e: TimegridCalendarAddClickedArgs) {
        let startTime = DateWrapper.getCurrent();
        startTime.setDate(e.defaultDate.getDate());
        startTime.setMonth(e.defaultDate.getMonth());
        startTime.setFullYear(e.defaultDate.getFullYear());
        startTime.setHours(e.defaultDate.getHours());
        startTime.setMinutes(e.defaultDate.getMinutes());

        let endTime = DateWrapper.getCurrent();
        endTime.setDate(e.defaultDate.getDate());
        endTime.setMonth(e.defaultDate.getMonth());
        endTime.setFullYear(e.defaultDate.getFullYear());
        endTime.setHours(e.defaultDate.getHours() + 1);
        endTime.setMinutes(e.defaultDate.getMinutes());

        this.timeEvents.push({
            id: "idd" + Math.random() * (999999999 - 1) + 1,
            dataRow: { jedna: "sdfsd", druha: "sdfsdfsd" },
            resourceId: e.resource != null ? e.resource.id : prompt("Room a or b?", "a"),
            title: "Event cislo " + this.timeEvents.length + 1,
            start: startTime,
            end: endTime,
        });
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
                    subtitle={"Some additional info about the field"}
                />
                <TextBox
                    label={"Your name append"}
                    value={this.name}
                    changed={(e) => {
                        this.name = e;
                    }}
                    appendIcon={"fas fa-user"}
                />
                <TextBox
                    label={"Your name prepend"}
                    value={this.name}
                    changed={(e) => {
                        this.name = e;
                    }}
                    prependIcon={"fas fa-user"}
                />
                <TextBox
                    label={"With error"}
                    value={null}
                    changed={(e) => {}}
                    validationState={{
                        errorMessage: "Unable to proceed, error...",
                        mandatory: true,
                        valid: false,
                        validationDeclaration: null,
                    }}
                />
                <CheckBox
                    label={"Do you agree?"}
                    checkboxLabelHtml={"Additional checkbox label"}
                    value={this.boolValue}
                    changed={(e) => {
                        this.boolValue = e;
                    }}
                />
                <ColorPicker
                    label={"Pick a color"}
                    value={this.color}
                    changed={(e) => {
                        this.color = e;
                    }}
                />
                <DaterangePicker label={"Range picker"} value={null} changed={(e) => {}} />
                <DatetimePicker label={"Pick a date"} value={null} showTime={true} changed={(e) => {}} />
                <NumericInput
                    label={"Spinner number input"}
                    value={this.numberVal}
                    changed={(e) => {
                        this.numberVal = e;
                    }}
                />
                <NumericInput
                    label={"Native number input"}
                    mode={NumericInputMode.Clasic}
                    value={this.numberVal}
                    changed={(e) => {
                        this.numberVal = e;
                    }}
                />
                <WysiwigEditor label={"WYSIWIG"} value={null} changed={(e) => {}} />
                <Tabs>
                    <TabPage icon={"icon icon-user"} navCaption={"User"}>
                        Tu je tab usera
                    </TabPage>
                    <TabPage icon={"icon icon-settings"} navCaption={"Settings"}>
                        Tu je tab settings
                    </TabPage>
                </Tabs>
                <Tabs renderMode={TabsRenderMode.Normal}>
                    <TabPage icon={"icon icon-user"} navCaption={"User"}>
                        Tu je tab usera
                    </TabPage>
                    <TabPage icon={"icon icon-settings"} navCaption={"Settings"}>
                        Tu je tab settings
                    </TabPage>
                </Tabs>
                <br />
                <br />
                <Tabs renderMode={TabsRenderMode.SidePillsExtended}>
                    <TabPage icon={"icon icon-user"} navCaption={"User"}>
                        Tu je tab usera
                    </TabPage>
                    <TabPage icon={"icon icon-settings"} navCaption={"Settings"}>
                        Tu je tab settings
                    </TabPage>
                </Tabs>
                <br />
                <br />
                <BootstrapToggle
                    label={"Toggle"}
                    value={this.boolValue}
                    changed={(e) => {
                        this.boolValue = e;
                    }}
                />
                <Button
                    text={"Click me"}
                    layout={ButtonLayout.Primary}
                    disabled={true}
                    icon={"icon icon-people"}
                    iconButton={false}
                    round={true}
                    size={ButtonSize.Regular}
                    tooltip={"Sample tooltip"}
                    clicked={(e) => {
                        alert("you clicked me");
                    }}
                />
                <Button
                    text={"Show sample modal"}
                    layout={ButtonLayout.Secondary}
                    clicked={(e) => {
                        this.blockModal = true;
                        (this.$refs.sampleModal as typeof Modal.prototype).show();
                        setTimeout(() => {
                            this.blockModal = false;
                        }, 3000);
                    }}
                />
                <TextButton
                    text="Click me for some news"
                    icon={"icon icon-people"}
                    clicked={(e) => {
                        alert("you clicked me?");
                    }}
                />
                <Card>
                    <CardHeader title={"Vacsia titulka"} />
                    <CardBody>jeden, dva</CardBody>
                </Card>
                <Card>
                    <CardHeader smallTitle={"Graf vstupov"} />
                    <CardBody>jeden, dva</CardBody>
                </Card>
                <br />
                <br />
                <Card renderMode={"inlined"}>
                    <CardHeader title={"Inlajnova karta"} />
                    <CardBody>jeden, dva</CardBody>
                </Card>
                <br />
                <br />
                <Card>
                    <CardHeaderWithOptions smallTitle={"Graf vstupov"} dropdownOptions={this.getLineChartHeaderOptions()} />
                    <CardBody>jeden, dva</CardBody>
                </Card>
                <DataTableStatic
                    id={"tblTest"}
                    columns={[
                        { id: "One", caption: "One" },
                        { id: "Two", caption: "Two" },
                        { id: "Three", caption: "Three" },
                    ]}
                    rows={[
                        { One: "Row-1-1", Two: "Row-2-1", Three: "Row-3-1" },
                        { One: "Row-1-2", Two: "Row-2-2", Three: "Row-3-2" },
                        { One: "Row-1-3", Two: "Row-2-3", Three: "Row-3-3" },
                    ]}
                />
                <DropdownList
                    options={this.getDummyDropdownOptions()}
                    selected={this.getDummyDropdownOptions().filter((p) => p.id == this.selectedOptions)[0]}
                    label={"TODO: Upravit sablonou Vyber z dropdownu"}
                    changed={(v) => {
                        this.selectedOptions = v.id;
                    }}
                />
                <DropdownButton layout={ButtonLayout.Default} size={ButtonSize.Regular} text={"Akcie"}>
                    <DropdownButtonItem icon={"icon icon-settings"} text={this.resources.edit} clicked={() => alert("clicked me")} />
                    <DropdownButtonSeparator />
                    <DropdownButtonItem
                        icon={"icon icon-notebook"}
                        text={"History"}
                        clicked={() => {
                            alert("clicked history");
                        }}
                    />
                    <DropdownButtonItem icon={"icon icon-trash"} text={"Delete"} clicked={() => confirm("You sure?")} />
                </DropdownButton>
                <br />
                Flex NOT collapsing on mobile
                <FlexContainer fullWidthOnMobile={false}>
                    <FlexFormItem>Auto-wrap</FlexFormItem>
                    <FlexFormItem>Auto-wrap</FlexFormItem>
                    <FlexFormItem flexFill={false} width={100}>
                        <div style="background-color:gray">100px</div>
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={50}>
                        <div style="background-color:gray">50px</div>
                    </FlexFormItem>
                </FlexContainer>
                <br />
                Flex collapsing on mobile
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem>Auto-wrap</FlexFormItem>
                    <FlexFormItem>Auto-wrap</FlexFormItem>
                    <FlexFormItem flexFill={false} width={100}>
                        <div style="background-color:gray">100px</div>
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={50}>
                        <div style="background-color:gray">50px</div>
                    </FlexFormItem>
                </FlexContainer>
                <Fieldset caption={"Sample fields"}>Here is some inner content</Fieldset>
                <FooterButtons>
                    <Button clicked={(e) => alert("cancel")} layout={ButtonLayout.Default} icon="fas fa-times" text={this.resources.cancel} />
                </FooterButtons>
                <Separator text="Separujem.." />
                <ValidationResultDisplayer
                    validationState={{
                        errorMessage: "Unable to proceed, error...",
                        mandatory: true,
                        valid: false,
                        validationDeclaration: null,
                    }}
                />
                <HtmlLiteral innerHTML={"Test of <b>HTML Literal</b>"} />
                <UploadImageAndCropButton
                    text={"Upload image and crop"}
                    icon={"icon icon-people"}
                    layout={ButtonLayout.Danger}
                    uploadArgs={null}
                    targetBlobContainer={"dummy"}
                    uploadComplete={(e) => {}}
                    uploadUrl={"dummy"}
                />
                <br />
                <Accordion>
                    <AccordionPage caption={"One"} badge={"0"}>
                        <div>One</div>
                    </AccordionPage>
                    <AccordionPage caption={"Two"} badge={"3"} badgeStyle={"warning"}>
                        <div>Two</div>
                    </AccordionPage>
                    <AccordionPage caption={"Three"} badge={"3"} badgeStyle={"danger"}>
                        <div>Three</div>
                    </AccordionPage>
                </Accordion>
                <br />
                <div>
                    <FullCalendarDraggableEvent
                        title={"Event druhaov"}
                        dataRow={{ druha: "jedna" }}
                        startDate={new DateWrapper(1900, 1, 1, 10, 0, 0, 0)}
                        endDate={new DateWrapper(1900, 1, 1, 10, 45, 0, 0)}
                    />
                    <FullCalendarDraggableEvent
                        title={"Ej bardzo dva"}
                        dataRow={{ druha: "kurva" }}
                        startDate={new DateWrapper(1900, 1, 1, 10, 0, 0, 0)}
                        endDate={new DateWrapper(1900, 1, 1, 11, 30, 0, 0)}
                    />
                </div>
                <TimegridCalendar
                    minDate={new DateWrapper(2020, 2, 3)}
                    maxDate={new DateWrapper(2020, 2, 7, 10, 0, 0)}
                    viewType={this.timeViewType as any}
                    resources={[
                        { id: "a", title: "Room a", building: "druha", dataRow: {} },
                        { id: "b", title: "Room BBB", building: "jedna", dataRow: {} },
                    ]}
                    events={this.timeEvents}
                    addClicked={(e) => {
                        this.addTimeEvent(e);
                    }}
                    eventChanged={(e) => {
                        e.blockElem();

                        setTimeout(() => {
                            e.unblockElem();
                        }, 3000);
                    }}
                />
                <br />
                <Modal size={ModalSize.Normal} ref="sampleModal" title={"Sample modal"} blocked={this.blockModal}>
                    <ModalBody>
                        <p>Some modal content</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button layout={ButtonLayout.Default} dismissModal={true} text={this.resources.close} clicked={() => {}} />
                        <Button
                            layout={ButtonLayout.Primary}
                            text="OK"
                            clicked={() => {
                                alert("OK clicked...now click close");
                            }}
                        />
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default toNative(TestAllComponentsPage);
