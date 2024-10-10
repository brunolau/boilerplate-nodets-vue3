import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import ChartColorHelper from "./ts/color-helper";
import Chart from "chart.js";
import "./css/pie-chart.css";

export interface PieDataArgs {
    items: PieData[];
}

export interface PieData {
    caption: string;
    value: number;
}

interface PieDataOperational extends PieData {
    color: string;
}

export const enum PieChartType {
    Doughnut = "doughnut",
    Pie = "pie",
}

interface PieArgs {
    chartData: PieDataArgs;
    cssClasses?: string;
    type?: PieChartType;
    getSize?: (innerWidth?: number) => number;
}

@Component
class PieChart extends TsxComponent<PieArgs> implements PieArgs {
    @Prop() cssClasses!: string;
    @Prop() chartData!: PieDataArgs;
    @Prop() type!: PieChartType;
    @Prop() getSize?: (innerWidth?: number) => number;
    size = 220;

    _chart: Chart | null = null;
    _uuid: string = null;

    destroyChart() {
        if (this._chart) {
            try {
                this._chart.destroy();
            } catch (e) {}

            this._chart = null;
        }
    }

    getCanvasContext(): CanvasRenderingContext2D {
        return (this.$refs.canvas as HTMLCanvasElement).getContext("2d");
    }

    getData(): PieDataOperational[] {
        if (this.chartData == null || this.chartData.items == null) {
            return [] as any;
        }

        let colors = this.getColors(this.chartData.items.length);
        let retVal: PieDataOperational[] = [];

        this.chartData.items.forEach((dataItem, i) => {
            retVal.push({
                caption: dataItem.caption,
                value: dataItem.value,
                color: colors[i],
            });
        });

        return retVal;
    }

    getColors(count: number): string[] {
        return ChartColorHelper.getColors(count);
    }

    bindChart() {
        let data = this.getData();
        this.destroyChart();

        this._chart = new Chart(this.getCanvasContext(), {
            type: this.type || PieChartType.Doughnut,
            data: {
                labels: data.map((p) => p.caption),
                datasets: [
                    {
                        label: "",
                        data: data.map((p) => p.value),
                        backgroundColor: this.getColors(data.length),
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateRotate: false,
                    animateScale: false,
                },
                legend: {
                    display: false,
                },
            },
        });
    }

    updateChartInstance() {
        let newData = this.getData();
        let chart = this._chart;
        let dataset = chart.data.datasets[0];

        chart.data.labels = [];
        dataset.data = [];
        dataset.backgroundColor = [];

        newData.forEach((dataItem) => {
            chart.data.labels.push(dataItem.caption);
            dataset.data.push(dataItem.value);
        });

        this.getColors(newData.length).forEach((color) => {
            dataset.backgroundColor.push(color);
        });

        chart.update();
    }

    mounted() {
        this.bindChart();
    }

    updated() {
        if (this._chart != null) {
            this.updateChartInstance();
        } else {
            this.bindChart();
        }
    }

    beforeDestroy() {
        this.destroyChart();
    }

    created() {
        window.addEventListener("resize", this.setSize);
    }

    destroyed() {
        window.removeEventListener("resize", this.setSize);
    }

    setSize() {
        this.size = this.getSize(window.innerWidth);
    }

    render(h) {
        let chartPieInnerStyle = "width: " + this.size + "px; height: " + this.size;
        if (this._uuid == null || this._uuid.length == 0) {
            this._uuid = "chrt-" + (Math.floor(Math.random() * 999999999) + 1).toString();
        }

        let data = this.getData();
        if (this.chartData != null) {
            data.splice(0, 0, {
                caption: AppState.resources.allTogether,
                value: data.length > 0 ? data.reduce((ty, u) => ty + u.value, 0) : 0,
                color: "#ffffff",
            });
        }

        return (
            <div class={"chart-pie-wrap " + (this.cssClasses || "")}>
                <div class="chart-pie-inner">
                    <div style={chartPieInnerStyle}>
                        <canvas id={this._uuid} height="220" width="220" style="width:220px !important;" ref="canvas" />
                    </div>
                    <div class="chart-pie-legend">
                        {data.map((dataItem) => (
                            <div class="chart-pie-legenditem">
                                <span class="chart-pie-legendcolor">
                                    <div class="chart-pie-legendcolor-outer">
                                        <div class="chart-pie-legendcolor-inner" style={"background: " + dataItem.color + ""}></div>
                                    </div>
                                </span>
                                <span class="chart-pie-legendtext">
                                    {dataItem.caption}&nbsp;[{dataItem.value}]
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default toNative(PieChart);
