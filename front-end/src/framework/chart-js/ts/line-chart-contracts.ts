export interface LineChartTicksX {
    maxTicksLimit: number;
    maxRotation: number;
    minRotation: number;
    callback?: (value?: any, index?: number, values?: any) => any | any[];
}

export interface LineChartDataArgs {
    dataSets: LineChartDataSet[];
}

export interface LineChartDataSet {
    label: string;
    items: LineChartDataItem[];
}

export interface LineChartDataItem {
    caption: DateWrapper | string;
    value: number;
    uuid?: string;
    tooltipSuffix?: string;
}

export interface LineChartArgs {
    chartData: LineChartDataArgs;
    cssClasses?: string;
    height?: number;
    showLegend?: boolean;
    tickLimit?: number;
    emptyText?: string;
    itemClicked?: (uuid: any) => void;
    customTickFormatX?: (value?: any, index?: number, values?: any) => any | any[];
}
