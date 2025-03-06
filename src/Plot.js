import React, { useRef, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";

const PlotComponent = ({ data, selectedColumns, indexColumn }) => {
  const chartRef = useRef(null);
  const isApplyingZoom = useRef(false);
  const zoomState = useRef({ startValue: null, endValue: null }); // Store zoom range
  const [zoomRange, setZoomRange] = useState({ start: "", end: "" });

  useEffect(() => {
    if (data.length > 0 && indexColumn) {
      const xValues = data
        .map((row) => row[indexColumn])
        .filter((val) => val !== null && val !== undefined && val !== "");

      if (xValues.length > 0) {
        setZoomRange((prev) => ({
          start: prev.start || xValues[0], // Preserve zoom or set first value
          end: prev.end || xValues[xValues.length - 1], // Preserve zoom or set last value
        }));

        if (!zoomState.current.startValue || !zoomState.current.endValue) {
          zoomState.current = {
            startValue: xValues[0],
            endValue: xValues[xValues.length - 1],
          };
        }
      }
    }
  }, [data, indexColumn]);

  useEffect(() => {
    if (chartRef.current && zoomState.current.startValue && zoomState.current.endValue) {
      applyZoom(); // Reapply zoom on parameter change
    }
  }, [selectedColumns]); // Trigger when new parameters are added

  const handleZoomInputChange = (e) => {
    const { name, value } = e.target;
    setZoomRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyZoom = () => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      isApplyingZoom.current = true;

      echartsInstance.dispatchAction({
        type: "dataZoom",
        startValue: zoomRange.start,
        endValue: zoomRange.end,
      });

      zoomState.current = { startValue: zoomRange.start, endValue: zoomRange.end }; // Store applied zoom

      setTimeout(() => {
        isApplyingZoom.current = false;
      }, 200);
    }
  };

  if (!data || !indexColumn || data.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>
        📉 No data to plot.
      </div>
    );
  }

  const yAxisConfig = selectedColumns.length
    ? selectedColumns.map((col, index) => ({
        type: "value",
        name: col,
        position: index % 2 === 0 ? "left" : "right",
        alignTicks: true,
        offset: index * 50,
        axisLine: { show: true },
        splitLine: { show: index === 0 },
      }))
    : [{ type: "value", name: "Default Axis" }];

  const series = selectedColumns.map((col, index) => ({
    name: col,
    type: "line",
    data: data.map((row) => row[col]),
    yAxisIndex: index,
    smooth: true,
    symbol: "circle",
    symbolSize: 6,
  }));

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
      show: true,
      containLabel: true,
      left: "12%",
      right: "12%",
      bottom: "20%",
      top: "22%",
      backgroundColor: "transparent",
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
      { type: "inside", xAxisIndex: [0] },
      { type: "slider", xAxisIndex: [0], bottom: 30 },
    ],
    animationDuration: 800,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "750px",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Zoom Controls */}
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Custom Zooming with X-Axis:</span>
        <input
          type="text"
          name="start"
          value={zoomRange.start || ""}
          onChange={handleZoomInputChange}
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100px",
          }}
        />
        <span>to</span>
        <input
          type="text"
          name="end"
          value={zoomRange.end || ""}
          onChange={handleZoomInputChange}
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100px",
          }}
        />
        <button
          onClick={applyZoom}
          style={{
            padding: "8px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Apply Zoom
        </button>
      </div>

      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ height: "650px", width: "100%" }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

export default PlotComponent;
