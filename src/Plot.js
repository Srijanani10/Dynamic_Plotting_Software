import React, { useRef, useState } from "react";
import ReactECharts from "echarts-for-react";

const PlotComponent = ({ data, selectedColumns, indexColumn }) => {
  const chartRef = useRef(null);
  const [zoomRange, setZoomRange] = useState(null);

  if (!data || !indexColumn || data.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>
        📉 No data to plot.
      </div>
    );
  }

  // Capture zoom range before updating
  const saveZoomState = () => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      const option = echartsInstance.getOption();
      
      if (option?.dataZoom?.[0]) {
        setZoomRange({ start: option.dataZoom[0].start, end: option.dataZoom[0].end });
      }
    }
  };

  // Restore zoom after updating chart
  const applyZoomState = () => {
    if (zoomRange && chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.dispatchAction({
        type: "dataZoom",
        start: zoomRange.start,
        end: zoomRange.end,
      });
    }
  };

  // Generate multiple Y-axis configuration
  const yAxisConfig =
    selectedColumns.length > 0
      ? selectedColumns.map((col, index) => ({
          type: "value",
          name: col,
          position: index % 2 === 0 ? "left" : "right",
          alignTicks: true,
          offset: index * 50,
          axisLine: { show: true },
          splitLine: { show: index === 0 },
        }))
      : [{ type: "value", name: "Default Axis" }]; // Default Y-axis if none selected

  // Create series for each selected column
  const series = selectedColumns.map((col, index) => ({
    name: col,
    type: "line",
    data: data.map((row) => row[col]),
    yAxisIndex: index,
    smooth: true,
    symbol: "circle",
    symbolSize: 6,
  }));

  // Configure the chart
  const options = {
    title: { text: "📊 Interactive Data Plot", left: "center", top: "10px" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      confine: true,
      extraCssText: "z-index: 1000;",
    },
    legend: { data: selectedColumns, bottom: 10 },
    toolbox: {
      show: true,
      top: 40,
      feature: {
        saveAsImage: {},
        restore: { show: true },
        dataZoom: { yAxisIndex: "none" },
        magicType: { type: ["line", "bar"] },
      },
    },
    grid: {
      show: true, // Ensures grid is defined
      containLabel: true,
      left: "12%",
      right: "12%",
      bottom: "20%",
      top: "22%",
      backgroundColor: "transparent", // Prevents errors related to grid.master
      borderWidth: 1,
    },
    xAxis: {
      type: "category",
      name: indexColumn,
      data: data.map((row) => row[indexColumn]),
    },
    yAxis: yAxisConfig,
    series: series,
    dataZoom: [
      { type: "inside", xAxisIndex: [0] }, // Ensures correct x-axis indexing
      { type: "slider", xAxisIndex: [0], bottom: 30 },
    ],
    animationDuration: 800,
  };

  // Debugging logs
  console.log("Grid Config:", options.grid);
  console.log("Data Zoom Config:", options.dataZoom);

  return (
    <div
      style={{
        width: "100%",
        height: "700px",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ height: "650px", width: "100%" }}
        notMerge={true}
        lazyUpdate={true}
        onEvents={{
          dataZoom: saveZoomState,
          finished: applyZoomState,
        }}
      />
    </div>
  );
};

export default PlotComponent;
