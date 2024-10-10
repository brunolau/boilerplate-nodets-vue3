import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { LineChartDataArgs, LineChartArgs, LineChartDataSet, LineChartTicksX } from "./ts/line-chart-contracts";
import Chart from "chart.js";
import "chartjs-plugin-zoom";
import ChartColorHelper from "./ts/color-helper";

@Component
class LineChart extends TsxComponent<LineChartArgs> implements LineChartArgs {
    @Prop() cssClasses!: string;
    @Prop() chartData!: LineChartDataArgs;
    @Prop() height!: number;
    @Prop() showLegend!: boolean;
    @Prop() tickLimit!: number;
    @Prop() customTickFormatX?: (value?: any, index?: number, values?: any) => any | any[];
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

    getData(): LineChartDataSet[] {
        if (this.chartData == null || this.chartData.dataSets == null) {
            return [] as any;
        }

        return this.chartData.dataSets;
    }

    getColors(count: number): string[] {
        return ChartColorHelper.getColors(count);
    }

    bindChart() {
        this.destroyChart();
        let data = this.getData();
        let datasets: any[] = [];
        let labels: string[] = [];
        let colorArr = this.getColors(data.length);
        let showLegend = typeof this.showLegend === "undefined" ? false : this.showLegend;
        let ticksX: LineChartTicksX;

        data.forEach((dataset, i) => {
            let itemData: number[] = [];
            dataset.items.forEach((datasetItem) => {
                itemData.push(datasetItem.value);

                if (!labels.contains(datasetItem.caption as string)) {
                    labels.push(datasetItem.caption as string);
                }
            });

            datasets.push({
                label: dataset.label,
                data: itemData,
                fill: data.length < 2,
                borderColor: colorArr[0],
                backgroundColor: colorArr[0].slice(0, -1) + ",0.4)",
                pointBackgroundColor: colorArr[0],
                pointBorderColor: colorArr[0],
            });
        });

        ticksX = {
            maxTicksLimit: this.tickLimit,
            maxRotation: 0,
            minRotation: 0,
        };

        if (this.customTickFormatX != null) {
            ticksX.callback = (value) => {
                return this.customTickFormatX(value);
            };
        }

        this._chart = new Chart(this.getCanvasContext(), {
            type: "line",

            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                elements: {
                    line: {
                        tension: 0.2,
                    },
                },
                legend: {
                    display: showLegend,
                },
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: false,
                    text: "",
                },
                tooltips: {
                    mode: "index",
                    intersect: false,
                },
                hover: {
                    mode: "nearest",
                    intersect: true,
                },
                scales: {
                    xAxes: [
                        {
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "",
                            },
                            ticks: ticksX,
                        },
                    ],
                    yAxes: [
                        {
                            display: true,
                            scaleLabel: {
                                display: true,
                            },
                        },
                    ],
                },
                pan: {
                    enabled: true,
                    mode: "x",
                },
                zoom: {
                    enabled: true,
                    mode: "x",
                    speed: 75.5,
                    sensitivity: 0,
                },
            },
        });
    }

    updateChartInstance() {
        this.destroyChart();
        this.bindChart();

        let z = "z";

        //let newData = this.getData();
        //let chart = this._chart;
        //let dataset = chart.data.datasets[0];

        //chart.data.labels = [];
        //dataset.data = [];
        //dataset.backgroundColor = [];

        //newData.forEach((dataItem) => {
        //    chart.data.labels.push(dataItem.caption);
        //    dataset.data.push(dataItem.value);
        //});

        //this.getColors(newData.length).forEach((color) => {
        //    dataset.backgroundColor.push(color);
        //});

        //chart.update();
    }

    mounted() {
        this.bindChart();
        let z = "z";
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

    render(h) {
        if (this._uuid == null || this._uuid.length == 0) {
            this._uuid = "chrt-" + (Math.floor(Math.random() * 999999999) + 1).toString();
        }

        let height = this.height;
        if (height == null || height < 1) {
            height = 400;
        }

        if (this.chartData == null) {
            height = 400;
        }

        return (
            <div class={"chart-line-wrap " + (this.cssClasses || "")} data-has-data={this.chartData != null}>
                <div class="chart-line-inner">
                    <div>
                        <canvas id={this._uuid} height={height} ref="canvas" />
                    </div>
                </div>
            </div>
        );
    }
}

export default toNative(LineChart);
