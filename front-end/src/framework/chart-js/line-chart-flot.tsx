import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { LineChartDataArgs, LineChartArgs, LineChartDataSet, LineChartTicksX } from "./ts/line-chart-contracts";

import "./thirdparty/flot/jquery.flot-patched.js";
import "./thirdparty/flot/jquery.flot.pie.js";
import "./thirdparty/flot/jquery.flot.stack.js";
import "./thirdparty/flot/jquery.flot.crosshair.js";
import "./thirdparty/flot/jquery.flot.resize.js";
import "./thirdparty/flot/jquery.flot.categories.js";
import "./thirdparty/flot/jquery.flot.navigate.js";
import "./css/line-chart-flot.css";

@Component
class LineChartFlot extends TsxComponent<LineChartArgs> implements LineChartArgs {
    @Prop() cssClasses!: string;
    @Prop() chartData: LineChartDataArgs;
    @Prop() height!: number;
    @Prop() showLegend!: boolean;
    @Prop() tickLimit!: number;
    @Prop() emptyText?: string;
    @Prop() itemClicked?: (uuid: any) => void;
    @Prop() customTickFormatX?: (value?: any, index?: number, values?: any) => any | any[];
    plot_statistics: any;

    mounted() {
        this.bindFlot();
    }

    updated() {
        this.bindFlot();
    }

    created() {
        window.addEventListener("resize", this.resizeFlot);
    }

    destroyed() {
        window.removeEventListener("resize", this.resizeFlot);
    }

    resizeFlot() {
        setTimeout(() => {
            this.plot_statistics.resize();
            this.plot_statistics.setupGrid();
            this.plot_statistics.draw();
        }, 150);
    }

    bindFlot() {
        var elem = $(this.$el as HTMLElement);
        var dataParam = this.chartData.dataSets;
        var itemData = new Array();
        var performCreation = true;
        var hasData = false;
        var self = this;

        if (dataParam != null && dataParam.length > 0) {
            dataParam.forEach((currItem) => {
                var dataArr = [];
                itemData.push({
                    data: dataArr,
                    label: currItem.label,
                });

                var ciData = currItem.items;
                if (ciData != null && ciData.length > 0) {
                    hasData = true;
                }

                ciData.forEach((dataItem) => {
                    dataArr.push([(dataItem.caption as DateWrapper).toDisplayString(true), Math.max(dataItem.value, 0), dataItem.tooltipSuffix, dataItem.uuid]);
                });
            });
        }

        if (!hasData) {
            elem.html('<span style="width: 100%; text-align: center; font-style: italic; font-size: 18px; font-weight: 200; display: block;">' + this.emptyText + "</span>");
            return;
        }

        if (itemData.length == 1) {
            itemData[0].lines = {
                fill: 0.6,
                lineWidth: 1,
            };
            itemData[0].color = ["#f89f9f"];
            delete itemData[0].label;

            itemData.push({
                data: itemData[0].data,
                points: {
                    show: true,
                    fill: true,
                    radius: 3.5,
                    fillColor: "#f89f9f",
                    lineWidth: 0,
                },
                color: "#fff",
                shadowSize: 0,
            });
        }

        if (performCreation && itemData[0].data.length > 0) {
            var itemCount = this.tickLimit;
            var firstItemData = itemData[0].data;
            var winLetterSpacing = null;
            var winWidth = $(window).width();

            if (winWidth < 650 && winWidth >= 580) {
                winLetterSpacing = "-1px";
            } else if (winWidth < 580 && winWidth >= 480) {
                itemCount = this.tickLimit - 2;
                winLetterSpacing = "-1px";
            } else if (winWidth < 480 && winWidth >= 420) {
                itemCount = this.tickLimit - 3;
                winLetterSpacing = "-1px";
            } else if (winWidth < 420 && winWidth >= 350) {
                itemCount = this.tickLimit - 4;
                winLetterSpacing = "-1px";
            } else if (winWidth < 350) {
                itemCount = this.tickLimit - 5;
                winLetterSpacing = "-1px";
            }

            if (itemCount > firstItemData.length) {
                itemCount = firstItemData.length - 1;
            }

            //var tickOffsets = Math.floor(firstItemData.length / itemCount);
            var tickArr = [];
            for (var i = 0; i < firstItemData.length; i++) {
                var currSelIndex = i;
                var currSelItem = firstItemData[currSelIndex];
                if (currSelItem == null) {
                    currSelIndex -= 1;
                    currSelItem = firstItemData[currSelIndex];
                }

                var itemText = currSelItem[0];
                var splitTextArr = itemText.split(", ");
                if (splitTextArr.length == 2) {
                    itemText = '<div style="font-size:9px;">' + splitTextArr[0] + "<br>" + splitTextArr[1] + "</div>";
                }

                tickArr.push(itemText);
            }

            var showChartTooltip = function (x, y, xValue, yValue) {
                $('<div class="flot-linechart-tooltip">' + yValue + "<br>" + xValue + "</div>")
                    .css({
                        position: "absolute",
                        display: "none",
                        top: y - 60,
                        left: x - 40,
                        border: "0px solid #ccc",
                        padding: "2px 6px",
                        "background-color": "#fff",
                    })
                    .appendTo("body")
                    .fadeIn(200);
            };

            this.plot_statistics = $["plot"](elem, itemData, {
                legend: {
                    position: "nw",
                },
                xaxis: {
                    ticks: itemCount,
                    tickFormatter: function (val, axis) {
                        var retVal = tickArr[val];
                        if (retVal != null) {
                            return retVal;
                        } else {
                            return "";
                        }
                    },
                    tickLength: 0,
                    tickDecimals: 0,
                    mode: "categories",
                    min: 0,
                    font: {
                        letterSpacing: winLetterSpacing,
                        lineHeight: 14,
                        style: "normal",
                        variant: "small-caps",
                        color: "#6F7B8A",
                    },
                },
                yaxis: {
                    zoomRange: false,
                    panRange: false,
                    ticks: 5,
                    tickDecimals: 0,
                    tickColor: "#eee",
                    font: {
                        lineHeight: 14,
                        style: "normal",
                        variant: "small-caps",
                        color: "#6F7B8A",
                    },
                },
                zoom: {
                    interactive: true,
                },
                pan: {
                    interactive: true,
                },
                grid: {
                    hoverable: true,
                    clickable: true,
                    tickColor: "#eee",
                    borderColor: "#eee",
                    borderWidth: 1,
                },
            });
            var plot_statistics = this.plot_statistics;

            var previousPoint = null;
            elem.bind("plothover", function (event, pos, item) {
                if (item) {
                    document.body.style.cursor = "pointer";
                } else {
                    document.body.style.cursor = "default";
                }

                $("#x").text(pos.x.toFixed(2));
                $("#y").text(pos.y.toFixed(2));
                if (item) {
                    if (previousPoint != item.dataIndex) {
                        previousPoint = item.dataIndex;

                        $(".flot-linechart-tooltip").remove();
                        var x = item.datapoint[0].toFixed(2),
                            y = item.datapoint[1].toFixed(2);

                        var currentItem = item.series.data[item.dataIndex];
                        var itemSuffix = !isNullOrEmpty(currentItem[2] ? " " + currentItem[2] : "");
                        showChartTooltip(item.pageX, item.pageY, currentItem[0], currentItem[1] + itemSuffix);
                    }
                } else {
                    $(".flot-linechart-tooltip").remove();
                    previousPoint = null;
                }
            });

            elem.bind("plotclick", function (event, pos, item) {
                if (dataParam.length == 1) {
                    if (item && self.itemClicked != null) {
                        self.itemClicked(item.series.data[item.dataIndex][3]);
                    }
                }
            });

            $(".plot-button").remove();
            let addArrow = (dir, right, top, offset) => {
                $(
                    '<img class="plot-button" src="https://inviton-cdn.azureedge.net/assets/img/arrow-' +
                        dir +
                        '.gif" style="position: absolute;cursor: pointer;right:' +
                        right +
                        "px;top:" +
                        top +
                        'px">'
                )
                    .appendTo(elem)
                    .click(function (e) {
                        e.preventDefault();
                        plot_statistics.pan(offset);
                    });
            };

            $(
                '<div class="plot-button" style="text-align: center;width:20px;font-weight: bold;font-size: 20px;color: #999;background-color: #eee;padding: 2px;position: absolute;cursor: pointer;right:25px;top:0px"> + </div>'
            )
                .appendTo(elem)
                .click(function (e) {
                    e.preventDefault();
                    plot_statistics.zoom();
                });
            $(
                '<div class="plot-button" style="text-align: center;width:20px;font-weight: bold;font-size: 20px;color: #999;background-color: #eee;padding: 2px;position: absolute;cursor: pointer;right:0px;top:0px"> - </div>'
            )
                .appendTo(elem)
                .click(function (e) {
                    e.preventDefault();
                    plot_statistics.zoomOut();
                });

            addArrow("left", 30, 40, { left: -100 });
            addArrow("right", 0, 40, { left: 100 });
            addArrow("up", 15, 25, { top: -100 });
            addArrow("down", 15, 55, { top: 100 });
        }
    }

    render(h) {
        return (
            <div class={this.cssClasses || ""} data-has-data={this.chartData != null}>
                <div style={"height:" + this.height + "px"}></div>
            </div>
        );
    }
}

export default toNative(LineChartFlot);
