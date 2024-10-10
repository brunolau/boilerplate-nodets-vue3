import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Chart, { ChartData, ChartOptions } from "chart.js";
import { hexToRGB } from "./utils";

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
};

export const enum PlotBackground {
    gradientSolid = 0,
    gradientTransparent = 1,
}

//TODO: Turn into approperiate types
interface PlotArgs {
    id?: string;
    cssClasses?: string;
    chartType?: string;
    labels?: string[];
    datasets?: any[];
    color?: string;
    chartData?: any[];
    plugins?: any[];
    title?: string;
    height?: number;
    extraOptions?: any[];
    backgroundColor?: PlotBackground;
}

@Component
class Plot extends TsxComponent<PlotArgs> implements PlotArgs {
    @Prop() id!: string;
    @Prop() cssClasses!: string;
    @Prop() chartType!: string;
    @Prop() labels!: string[];
    @Prop() datasets!: any[];
    @Prop() color!: string;
    @Prop() chartData!: any[];
    @Prop() plugins!: any[];
    @Prop() title!: string;
    @Prop() height!: number;
    @Prop() extraOptions: any[];
    @Prop() backgroundColor: PlotBackground;

    _chart: Chart | null = null;
    _plugins = this.plugins;

    addPlugin(plugin: any) {
        this._plugins.push(plugin);
    }

    renderChart(data: any, options: any) {
        this.destroyChart();

        this._chart = new Chart(this.getCanvasContext(), {
            type: this.chartType,
            data: data,
            options: options,
            plugins: this._plugins,
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

        if (this.backgroundColor == PlotBackground.gradientSolid || this.backgroundColor == null) {
            var purple_orange_gradient = canvasContext.createLinearGradient(0, 0, 0, 600);
            purple_orange_gradient.addColorStop(0, "orange");
            purple_orange_gradient.addColorStop(1, "purple");
            return purple_orange_gradient;
        } else if (this.backgroundColor == PlotBackground.gradientTransparent) {
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
        return Object.assign(defaultOptions, this.extraOptions || {});
    }

    bindChart() {
        let color = this.getBaseColor();
        let background = this.getGrandientFill();

        this.renderChart(
            {
                labels: this.labels || [],
                datasets: this.datasets
                    ? this.datasets
                    : [
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
                              data: this.chartData || [],
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
        if (this.id == null || this.id.length == 0) {
            this.id = "chrt-" + (Math.floor(Math.random() * 999999999) + 1).toString();
        }

        if (this.height == null || this.height == null) {
            this.height = 400;
        }

        return (
            <div class={this.cssClasses || ""}>
                <canvas id={this.id} height={this.height} ref="canvas" />
            </div>
        );
    }
}

export default toNative(Plot);
