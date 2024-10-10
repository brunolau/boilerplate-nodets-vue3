import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Chart from "chart.js";
import "chartjs-plugin-zoom";
import { hexToRGB } from "./ts/utils";

let defaultOptions = {
    maintainAspectRatio: false,
    tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10,
    },
    responsive: 1,
    scales: {
        yAxes: [
            {
                gridLines: {
                    zeroLineColor: "transparent",
                    drawBorder: false,
                },
                ticks: {
                    beginAtZero: true,
                    userCallback: function (label, index, labels) {
                        // when the floored value is the same as the value we have a whole number
                        if (Math.floor(label) === label) {
                            return label;
                        }
                    },
                },
            },
        ],
        xAxes: [
            {
                gridLines: {
                    zeroLineColor: "transparent",
                    drawTicks: false,
                    display: false,
                    drawBorder: false,
                },
            },
        ],
    },
    layout: {
        padding: { left: 0, right: 0, top: 15, bottom: 15 },
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
};

export const enum BarChartBackground {
    gradientSolid = 0,
    gradientTransparent = 1,
}

export interface BarChartData {
    title: string;
    value: number;
}

//TODO: Turn into approperiate types
interface BarChartArgs {
    id?: string;
    cssClasses?: string;
    labels?: string[];
    datasets?: any[];
    color?: string;
    chartData: BarChartData[];
    plugins?: any[];
    title?: string;
    height?: number;
    extraOptions?: any[];
    backgroundColor?: BarChartBackground;
}

@Component
class BarChart extends TsxComponent<BarChartArgs> implements BarChartArgs {
    @Prop() cssClasses!: string;
    @Prop() color!: string;
    @Prop() chartData!: BarChartData[];
    @Prop() title!: string;
    @Prop() height!: number;
    @Prop() backgroundColor: BarChartBackground;
    _chart: Chart | null = null;

    renderChart(data: any, options: any) {
        this.destroyChart();

        this._chart = new Chart(this.getCanvasContext(), {
            type: "bar",
            data: data,
            options: options,
        });
    }

    destroyChart() {
        if (this._chart) {
            try {
                this._chart.destroy();
            } catch (e) {}

            this._chart = null;
        }
    }

    getGrandientFill() {
        var color = this.getBaseColor();
        var canvasContext = this.getCanvasContext();

        if (this.backgroundColor == BarChartBackground.gradientSolid || this.backgroundColor == null) {
            var purple_orange_gradient = canvasContext.createLinearGradient(0, 0, 0, 600);
            purple_orange_gradient.addColorStop(0, "orange");
            purple_orange_gradient.addColorStop(1, "purple");
            return purple_orange_gradient;
        } else if (this.backgroundColor == BarChartBackground.gradientTransparent) {
            var gradientFill = canvasContext.createLinearGradient(0, this.height, 0, 50);
            gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
            gradientFill.addColorStop(0.6, hexToRGB(color, 0.8));
            return gradientFill;
        }
    }

    getBaseColor(): string {
        let fallBackColor = "#f96332";
        let color = this.color || fallBackColor;
        return color;
    }

    getCanvasContext(): CanvasRenderingContext2D {
        return (this.$refs.canvas as HTMLCanvasElement).getContext("2d");
    }

    getChartOptions() {
        return Object.assign(defaultOptions, {});
    }

    bindChart() {
        let color = this.getBaseColor();
        let background = this.getGrandientFill();
        let labels = (this.chartData || []).map((p) => p.title);
        let values = (this.chartData || []).map((p) => p.value);

        this.renderChart(
            {
                labels: labels,
                datasets: [
                    {
                        label: this.title || "",
                        backgroundColor: background,
                        borderColor: color,
                        pointBorderColor: "#FFF",
                        pointBackgroundColor: color,
                        pointBorderWidth: 2,
                        pointHoverRadius: 4,
                        pointHoverBorderWidth: 1,
                        pointRadius: 4,
                        fill: true,
                        borderWidth: 1,
                        data: values,
                    },
                ],
            },
            this.getChartOptions()
        );
    }

    mounted() {
        this.bindChart();
    }

    updated() {
        this.bindChart();
    }

    beforeDestroy() {
        this.destroyChart();
    }

    render(h) {
        if (this.height == null || this.height == null) {
            this.height = 400;
        }

        if (this.chartData == null) {
            this.height = 400;
        }

        return (
            <div class={this.cssClasses || ""}>
                <canvas height={this.height} ref="canvas" />
            </div>
        );
    }
}

export default toNative(BarChart);
