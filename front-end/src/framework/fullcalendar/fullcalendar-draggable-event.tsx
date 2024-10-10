import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { Draggable } from "@fullcalendar/interaction";

interface FullCalendarDraggableEventArgs {
    dataRow: any;
    title: string;
    durationMinutes?: number;
    startDate?: DateWrapper;
    endDate?: DateWrapper;
}

@Component
class FullCalendarDraggableEvent extends TsxComponent<FullCalendarDraggableEventArgs> implements FullCalendarDraggableEventArgs {
    @Prop() dataRow: any;
    @Prop() title!: string;
    @Prop() durationMinutes!: number;
    @Prop() startDate!: DateWrapper;
    @Prop() endDate!: DateWrapper;

    mounted() {
        new Draggable(this.$el as HTMLElement, {
            eventData: (eventEl) => {
                return {
                    title: this.title || eventEl.innerText,
                    duration: this.getDurationParam(),
                    extendedProps: {
                        durationMinutes: this.durationMinutes,
                        uuid: portalUtils.randomString(10),
                        dataRow: this.dataRow,
                        isDragger: true,
                        dragElemHolder: new Object(),
                    },
                };
            },
        });
    }

    getDurationInMinutes(): number {
        let durationMinutes = this.durationMinutes;
        if (durationMinutes == null && this.startDate != null && this.endDate != null) {
            durationMinutes = Math.round((this.endDate.getTime() - this.startDate.getTime()) / 1000 / 60);
        }

        if (durationMinutes == null) {
            durationMinutes = 60;
        }

        return durationMinutes;
    }

    getDurationParam(): string {
        let durationMinutes = this.getDurationInMinutes();
        if (durationMinutes != null) {
            var hours = Math.floor(durationMinutes / 60);
            if (hours < 24) {
                var minutes = durationMinutes % 60;
                var padNum = function (num: number) {
                    var nums = num.toString();
                    if (nums.length == 1) {
                        nums = "0" + nums;
                    }

                    return nums;
                };

                return padNum(hours) + ":" + padNum(minutes);
            }
        }

        return null;
    }

    render(h) {
        return (
            <div class="fc-event fc-draggable" style="margin-bottom:1px">
                {this.title}
            </div>
        );
    }
}

export default toNative(FullCalendarDraggableEvent);
