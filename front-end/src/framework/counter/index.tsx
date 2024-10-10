import { Vue } from "vue-facing-decorator";
import { toNative } from "vue-facing-decorator";
import { Component } from "../../app/vuetsx";
@Component
class CounterComponent extends Vue {
    currentAge: number = 5;
    name: string = "Justa Name";

    incrementCounter() {
        this.currentAge++;
    }

    getPlotData() {
        var rand = function (min, max) {
            var seed = 0;
            min = min === undefined ? 0 : min;
            max = max === undefined ? 1 : max;
            var _seed = (seed * 9301 + 49297) % 233280;
            return min + (_seed / 233280) * (max - min);
        };

        var chartColors = {
            red: "rgb(255, 99, 132)",
            orange: "rgb(255, 159, 64)",
            yellow: "rgb(255, 205, 86)",
            green: "rgb(75, 192, 192)",
            blue: "rgb(54, 162, 235)",
            purple: "rgb(153, 102, 255)",
            grey: "rgb(201, 203, 207)",
        };

        var randomScalingFactor = function () {
            return Math.round(rand(-100, 100));
        };

        var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var color = (window as any).Chart.helpers.color;
        var barChartData = {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [
                {
                    label: "Dataset 1",
                    backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
                    borderColor: chartColors.red,
                    borderWidth: 1,
                    data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()],
                },
                {
                    label: "Dataset 2",
                    backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
                    borderColor: chartColors.blue,
                    borderWidth: 1,
                    data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()],
                },
            ],
        };

        return barChartData;
    }

    getSampleArgs() {
        return {
            name: this.name,
            age: this.currentAge,
        };
    }

    render(h) {
        return (
            <div>
                <h1>Counter TSX</h1>
                <p>Counter done the TSX way</p>
                <p>
                    Current count: <strong>{this.currentAge}</strong>
                </p>
                <button
                    onClick={() => {
                        this.incrementCounter();
                    }}
                >
                    Increment
                </button>
                <input
                    type="text"
                    value={this.name}
                    onChange={(e) => {
                        this.name = e.target.value;
                    }}
                />
                <br />

                <br />
                <br />
                <br />
            </div>
        );
    }
}

export default toNative(CounterComponent);
