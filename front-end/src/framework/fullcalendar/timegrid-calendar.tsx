import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { Calendar } from "@fullcalendar/core";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interaction from "@fullcalendar/interaction";
import deepEqual from "fast-deep-equal";

import "../../../node_modules/@fullcalendar/core/main.css";
import "../../../node_modules/@fullcalendar/timeline/main.css";
import "../../../node_modules/@fullcalendar/resource-timeline/main.css";

import { OptionsInput, Duration, View } from "@fullcalendar/core";
import EventApi from "@fullcalendar/core/api/EventApi";
import ContextMenuBinder, { ContextMenuItem } from "../context-menu/context-menu-binder";
import { DialogUtils, DialogResult, AppDialogExResult } from "../../common/dialog-utils";
import "./css/fullcalendar.css";
import { DialogIcons } from "../../common/enums";

export interface TimegridCalendarResource {
    id: string;
    dataRow: any;
    building: string;
    title: string;
}

export interface TimegridCalendarEvent {
    id: string;
    resourceId: string;
    dataRow: any;
    title: string;
    start: DateWrapper;
    end: DateWrapper;
}

export type TimegridCalendarViewType = "resourceTimeline" | "resourceTimeGridDay";

interface TimegridCalendarArgs {
    viewType?: TimegridCalendarViewType;
    allowDrop?: boolean;
    events: TimegridCalendarEvent[];
    resources: TimegridCalendarResource[];
    height?: number | "auto" | "parent" | (() => number);

    minDate?: DateWrapper;
    maxDate?: DateWrapper;
    defaultDate?: DateWrapper;

    hasOverlappingEvents?: (ev: TimegridCalendarEvent, evArr: TimegridCalendarEvent[], possibleOverlap: boolean) => boolean;
    eventChanged?: (e: TimegridCalendarEventChangedArgs) => void;

    addContextCaption?: string;
    addClicked?: (e: TimegridCalendarAddClickedArgs) => void;

    editContextCaption?: string;
    editClicked?: (dataRow: any) => void;

    deleteContextCaption?: string;
    deletePromptTitle?: string;
    deletePromptMessage?: string;
    deleteClicked?: (dataRow: any, dialogHandle: AppDialogExResult<DialogResult>) => void;
}

export interface TimegridCalendarAddClickedArgs {
    resource: TimegridCalendarResource;
    defaultDate: DateWrapper;
}

export interface TimegridCalendarEventChangedArgs {
    el: HTMLElement;
    prevResouce: TimegridCalendarResource;
    newResource: TimegridCalendarResource;
    calEvent: any;
    startTime: DateWrapper;
    endTime: DateWrapper;
    revertChange: () => void;
    blockElem: () => void;
    unblockElem: () => void;
}

@Component
class TimegridCalendar extends TsxComponent<TimegridCalendarArgs> implements TimegridCalendarArgs {
    private _calendar: Calendar;
    private _lastOptions: OptionsInput;
    private instanceId: string = null;

    @Prop() viewType!: TimegridCalendarViewType;
    @Prop() allowDrop!: boolean;
    @Prop() events!: TimegridCalendarEvent[];
    @Prop() resources!: TimegridCalendarResource[];
    @Prop() height!: number | "auto" | "parent" | (() => number);

    @Prop() minDate!: DateWrapper;
    @Prop() maxDate!: DateWrapper;
    @Prop() defaultDate!: DateWrapper;

    @Prop() hasOverlappingEvents?: (ev: TimegridCalendarEvent, evArr: TimegridCalendarEvent[], possibleOverlap: boolean) => boolean;
    @Prop() eventChanged?: (e: TimegridCalendarEventChangedArgs) => void;

    @Prop() addContextCaption: string;
    @Prop() addClicked: (e: TimegridCalendarAddClickedArgs) => void;

    @Prop() editContextCaption: string;
    @Prop() editClicked: (dataRow: any) => void;

    @Prop() deleteContextCaption: string;
    @Prop() deletePromptTitle: string;
    @Prop() deletePromptMessage: string;
    @Prop() deleteClicked: (dataRow: any, dialogHandle: AppDialogExResult<DialogResult>) => void;

    mounted() {
        if (this.instanceId == null) {
            this.instanceId = "tg-" + portalUtils.randomString(10);
        }

        this._lastOptions = this.buildOptions();
        this._calendar = new Calendar(this.$el as HTMLElement, this._lastOptions);
        this._calendar.render();
        this.bindContextMenu();
        this.handleChanges();
    }

    updated() {
        if (this._calendar != null) {
            let newProps = this.buildOptions();
            let updates = {};
            let removals = [];

            for (let propName in this._lastOptions) {
                if (!(propName in newProps)) {
                    removals.push(propName);
                }
            }

            for (let propName in newProps) {
                if (!deepEqual(newProps[propName], this._lastOptions[propName])) {
                    updates[propName] = newProps[propName];
                }
            }

            if (updates["defaultView"] != null) {
                this._calendar.changeView(newProps.defaultView);
                this.unbdindContextMenu(false);
                this.bindContextMenu();
            }

            this._calendar.removeAllEvents();
            this._lastOptions = newProps;
            this._calendar.mutateOptions(updates, removals, false, deepEqual);
            this.handleChanges();
        }
    }

    beforeDestroy() {
        this._calendar.destroy();
        this._calendar = null;
        this.unbdindContextMenu(true);
        this.unbdindContextMenu(false);
    }

    bindContextMenu() {
        ContextMenuBinder.bindMenu({
            selector: this.getContextMenuSelector(true),
            build: ($trigger: JQuery, e: JQuery.Event) => {
                let itemArr: ContextMenuItem[];
                let isEvent = $trigger.hasClass("tg-has-menu");
                let dataRow = null;
                let addArgs: TimegridCalendarAddClickedArgs = null;

                if (!isEvent) {
                    itemArr = [{ key: "add", text: this.addContextCaption || AppState.resources.add, icon: "add" }];

                    let defaultDate: DateWrapper, resource: TimegridCalendarResource;

                    if (isNullOrEmpty(this.viewType) || this.viewType == "resourceTimeGridDay") {
                        let defMin: number, defHour: number;
                        let defTime = $trigger.attr("data-time");
                        let splitArr = (defTime || "").split(":");
                        if (splitArr.length > 2) {
                            defHour = Number(splitArr[0]);
                            defMin = Number(splitArr[1]);
                        }

                        try {
                            let currentDate = this._calendar.getDate();
                            let offset = $trigger.closest(".fc-body").offset();
                            let scroller = $trigger.closest(".fc-scroller");
                            let hitDetail = this._calendar.view["timeGrid"].positionToHit(e.pageX - offset.left + scroller.scrollLeft(), e.pageY - offset.top + scroller.scrollTop());
                            if (hitDetail != null) {
                                resource = this.resources[hitDetail.col];

                                if (defHour == null) {
                                    defHour = hitDetail.dateSpan.start.getUTCHours();
                                    defMin = hitDetail.dateSpan.start.getUTCMinutes();
                                }
                            }

                            defaultDate = new DateWrapper(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), defHour, defMin, 0, 0);
                        } catch (e) {}
                    } else {
                        let scroller = $trigger.closest(".fc-scroller");
                        let offset = scroller.offset();
                        let hitDetail = (this._calendar.view as any).queryHit(e.pageX - offset.left + scroller.scrollLeft(), e.pageY - offset.top + scroller.scrollTop());

                        if (hitDetail != null) {
                            let dateSpan = hitDetail.dateSpan;
                            if (!isNullOrEmpty(dateSpan.resourceId)) {
                                resource = this.resources.filter((p) => p.id == dateSpan.resourceId)[0];
                            }

                            if (dateSpan.range != null && dateSpan.range.start != null) {
                                defaultDate = this.transformToDateWrapper(dateSpan.range.start);
                            }
                        }
                    }

                    addArgs = {
                        resource: resource,
                        defaultDate: defaultDate,
                    };
                } else {
                    itemArr = [
                        { key: "edit", text: this.editContextCaption || AppState.resources.edit, icon: "edit" },
                        { key: "delete", text: this.deleteContextCaption || AppState.resources.remove, icon: "delete" },
                    ];

                    let uuid = $trigger.attr("data-uuid");
                    let eventArr = this._calendar.getEvents();

                    for (let i = 0, len = eventArr.length; i < len; i++) {
                        let eventItem = eventArr[i];
                        if (eventItem.extendedProps.uuid == uuid) {
                            dataRow = eventItem.extendedProps.dataRow;
                            break;
                        }
                    }
                }

                return {
                    callback: async (key: string, options: any) => {
                        if (key == "add") {
                            this.addClicked(addArgs);
                        } else if (key == "edit") {
                            this.editClicked(dataRow);
                        } else if (key == "delete") {
                            let confirmResult = await DialogUtils.showConfirmDialogEx(
                                this.deletePromptTitle || AppState.resources.remove,
                                this.deletePromptMessage || AppState.resources.deletePromptSingular,
                                null,
                                null,
                                DialogIcons.Warning
                            );

                            if (confirmResult.result == DialogResult.Confirm) {
                                this.deleteClicked(dataRow, confirmResult);
                            } else {
                                confirmResult.hideModal();
                            }
                        }
                    },
                    items: itemArr,
                };
            },
        });
    }

    unbdindContextMenu(currentSettings: boolean) {
        ContextMenuBinder.destroyMenu(this.getContextMenuSelector(currentSettings));
    }

    getContextMenuSelector(currentSettings: boolean): string {
        let displayType = currentSettings ? this.viewType : this._lastOptions.defaultView;
        if (displayType == "resourceTimeline") {
            return "#" + this.instanceId + " .tg-has-menu, #" + this.instanceId + " .fc-scroller-canvas tr[data-resource-id] .fc-widget-content";
        } else {
            return "#" + this.instanceId + " .tg-has-menu, #" + this.instanceId + " .fc-slats tr";
        }
    }

    transformToDateWrapper(d: Date): DateWrapper {
        return new DateWrapper(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 0, 0);
    }

    buildOptions(): OptionsInput {
        let retVal: OptionsInput = {
            height: this.height || "parent",
            //contentHeight: 100,
            schedulerLicenseKey: "0000000378-fcs-1583343526",
            plugins: [interaction, resourceTimeGridPlugin, resourceTimelinePlugin],
            timeZone: "UTC",
            editable: true,
            //slotEventOverlap: false,
            droppable: this.allowDrop != false,
            slotLabelInterval: "01:00",
            slotDuration: "00:15:00",
            defaultView: this.viewType || "resourceTimeGridDay",
            resources: this.resources.clone(),
            resourceGroupField: "building",
            events: this.getEvents(),
            eventRender: (args) => {
                console.log("rendering");
                args.el.classList.add("tg-has-menu");
                args.el.setAttribute("data-uuid", args.event.extendedProps.uuid);
                args.el.setAttribute("data-event-id", args.event.id);

                if (args.event && args.event.extendedProps && args.event.extendedProps.isDragger == true) {
                    args.event.extendedProps.dragElemHolder["_el"] = args.el;
                }
            },
            eventDrop: (args) => {
                this.eventChanged(this.getEventChangedArgs(args));
            },
            eventResize: (args) => {
                this.eventChanged(this.getEventChangedArgs(args as any));
            },
            drop: (args) => {
                if (args["resource"] != null) {
                    args.draggedEl.setAttribute("data-resource-id", args["resource"].id);
                }
            },
            eventReceive: (args) => {
                //Most inconsistent API ever probably..
                let el = args.event.extendedProps.dragElemHolder._el;
                let resourceId = args.draggedEl.getAttribute("data-resource-id");

                if (el != null) {
                    delete args.event.extendedProps.dragElemHolder._el;
                }

                let endTime = args.event.end;
                let startTimeWrapper = this.transformToDateWrapper(args.event.start);
                let endTimeConstructed: DateWrapper;

                if (endTime == null) {
                    let duration = args.event.extendedProps.durationMinutes;
                    if (duration == null) {
                        let calEvent = args.event.extendedProps.dataRow;
                        if (calEvent != null && calEvent.StartTime != null && calEvent.EndTime != null) {
                            duration = Math.round((calEvent.EndTime.getTime() - calEvent.StartTime.getTime()) / 1000 / 60);
                        }
                    }

                    if (duration == null) {
                        duration = 60;
                    }

                    endTimeConstructed = new DateWrapper(startTimeWrapper.getTime() + duration * 60 * 1000);
                }

                this.eventChanged({
                    el: el,
                    calEvent: args.event.extendedProps.dataRow,
                    startTime: startTimeWrapper,
                    endTime: endTime != null ? this.transformToDateWrapper(endTime) : endTimeConstructed,
                    newResource: resourceId != null ? this.resources.filter((p) => p.id == resourceId)[0] : null,
                    blockElem: () => {
                        this.blockCalendarElement(el);
                    },
                    unblockElem: () => {
                        this.unblockCalendarElement(el);
                    },
                    prevResouce: null,
                    revertChange: null,
                });
            },
        };

        if (this.maxDate != null || this.minDate != null) {
            retVal.validRange = {
                start: this.minDate != null ? this.minDate.toWire(true) : null,
                end: this.maxDate != null ? this.maxDate.toWire(true) : null,
            };
        }

        let defaultDate = this.getDefaultDate();
        if (defaultDate != null) {
            retVal.defaultDate = defaultDate.toWire(true);
            retVal.scrollTime = defaultDate.toWire(true).split("T")[1];
        }

        return retVal;
    }

    getDefaultDate(): DateWrapper {
        if (this.defaultDate != null) {
            return this.defaultDate;
        } else if (this.minDate != null) {
            return this.minDate;
        }

        return null;
    }

    getEventChangedArgs?(args: { el: HTMLElement; event: EventApi; oldEvent: EventApi; delta: Duration; revert: () => void; jsEvent: Event; view: View }): TimegridCalendarEventChangedArgs {
        let retObj: TimegridCalendarEventChangedArgs;
        retObj = {
            el: this.$el.querySelector('a.fc-timeline-event[data-uuid="' + args.event.extendedProps.uuid + '"]') as HTMLElement, //el property didnt seem to work, hackaround
            revertChange: args.revert,
            calEvent: args.event != null ? args.event.extendedProps.dataRow : null,
            startTime: args.event != null ? this.transformToDateWrapper(args.event.start) : null,
            endTime: args.event != null ? this.transformToDateWrapper(args.event.end) : null,
            prevResouce: args["oldResource"] != null ? this.resources.filter((p) => p.id == args["oldResource"].id)[0] : null,
            newResource: args["newResource"] != null ? this.resources.filter((p) => p.id == args["newResource"].id)[0] : null,
            blockElem: () => {
                this.blockCalendarElement(retObj.el);
            },
            unblockElem: () => {
                this.unblockCalendarElement(retObj.el);
            },
        };

        return retObj;
    }

    blockCalendarElement(el: HTMLElement) {
        el.classList.add("fc-isloading");
        el.addEventListener("mousedown", this.blockCalendarElementMouseHandler);
        $(el).append(AppConfig.blockerHtml);
    }

    blockCalendarElementMouseHandler(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }

    unblockCalendarElement(el: HTMLElement) {
        el.classList.remove("fc-isloading");
        el.removeEventListener("mousedown", this.blockCalendarElementMouseHandler);
        $(el).find(AppConfig.blockerSelector).remove();
    }

    getEvents() {
        return (this.events || ([] as TimegridCalendarEvent[])).map((p) => ({
            id: p.id,
            resourceId: p.resourceId,
            title: p.title,
            start: p.start != null ? p.start.toWire(true) : null,
            end: p.end != null ? p.end.toWire(true) : null,
            extendedProps: {
                uuid: portalUtils.randomString(10),
                dataRow: p.dataRow,
            },
        }));
    }

    handleChanges() {
        let events: TimegridCalendarEvent[] = this.events || ([] as TimegridCalendarEvent[]);
        events.forEach((ev) => {
            let startEv = ev.start != null ? ev.start.getTime() : null;
            let endEv = ev.end != null ? ev.end.getTime() : null;
            let eventId = ev.id;

            if (startEv != null && endEv != null && eventId != null) {
                let hasOverlap =
                    events.find((evRef) => {
                        if (evRef.resourceId != ev.resourceId || evRef.id == eventId) {
                            return false;
                        }

                        let startRef = evRef.start != null ? evRef.start.getTime() : 0;
                        let endRef = evRef.end != null ? evRef.end.getTime() : 0;

                        if (startEv < startRef && startRef < endEv) return true; // b starts in a
                        if (startEv < endRef && endRef < endEv) return true; // b ends in a
                        if (startRef < startEv && endEv < endRef) return true; // a in b
                        return false;
                    }) != null;

                //Lift this condition if needed...now performance-savy
                if (this.hasOverlappingEvents != null && hasOverlap) {
                    hasOverlap = this.hasOverlappingEvents(ev, events, hasOverlap);
                }

                let evElem = this.$el.querySelector('[data-event-id="' + eventId);
                if (evElem != null) {
                    if (hasOverlap == true) {
                        evElem.classList.add("fc-has-overlap");
                        evElem.setAttribute("data-overlap", "yup");
                    } else {
                        evElem.classList.remove("fc-has-overlap");
                        evElem.removeAttribute("data-overlap");
                    }
                }
            }
        });
    }

    render(h) {
        return <div id={this.instanceId} class={"tg-root"} data-events={(this.events || []).length} data-resources={(this.resources || []).length} data-viewtype={this.viewType}></div>;
    }
}

export default toNative(TimegridCalendar);
