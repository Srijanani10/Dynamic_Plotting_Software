import React, { useRef, useState, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { saveAs } from "file-saver";

const PlotComponent = ({ data, selectedColumns, indexColumn }) => {
  const chartRef = useRef(null);
  const zoomState = useRef({ startValue: null, endValue: null }); // Stores zoom range only on parameter change
  const [zoomRange, setZoomRange] = useState({ start: "", end: "" });
  const [zoomedData, setZoomedData] = useState([]);

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
      }
    }
  }, [data, indexColumn]);

  // Function to apply zoom, wrapped in useCallback
  const applyZoom = useCallback(() => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.dispatchAction({
        type: "dataZoom",
        startValue: zoomRange.start,
        endValue: zoomRange.end,
      });

      // Store zoom state only if parameters are added/removed, not on reset
      zoomState.current = { startValue: zoomRange.start, endValue: zoomRange.end };
    }
  }, [zoomRange]);

  useEffect(() => {
    if (chartRef.current && zoomState.current.startValue && zoomState.current.endValue) {
      applyZoom();
    }
  }, [selectedColumns, applyZoom]);

  // Update zoomedData when zoom changes
  useEffect(() => {
    if (data && zoomRange) {
      const filteredData = data.filter(row => {
        const xValue = new Date(row["DATETIME"]).getTime();
        return xValue >= new Date(zoomRange.start).getTime() && xValue <= new Date(zoomRange.end).getTime();
      });

      setZoomedData(filteredData);
    }
  }, [data, zoomRange]);

  const handleZoomInputChange = (e) => {
    const { name, value } = e.target;
    setZoomRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const downloadCSV = (filteredData, fileName) => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const csvContent =
      Object.keys(filteredData[0]).join(",") +
      "\n" +
      filteredData.map((row) => Object.values(row).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, fileName);
    console.log(`CSV file saved as: ${fileName}`);
  };

  const downloadZoomedCSV = () => {
    downloadCSV(zoomedData, "zoomed_data.csv");
  };

  const downloadAllParametersInZoomedCSV = () => {
    const filteredData = data.filter((row) => {
      const xValue = new Date(row["DATETIME"]).getTime();
      return xValue >= new Date(zoomRange.start).getTime() && xValue <= new Date(zoomRange.end).getTime();
    });

    downloadCSV(filteredData, "all_parameters_zoomed.csv");
  };

  // Capture zoom event from ECharts
  const handleChartEvents = {
    dataZoom: (params) => {
      if (params.batch && params.batch.length > 0) {
        const { startValue, endValue } = params.batch[0];
        if (startValue !== undefined && endValue !== undefined) {
          setZoomRange({ start: startValue, end: endValue });
        }
      }
    },
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
      bottom: "25%",
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
      { type: "slider", xAxisIndex: [0], bottom: 60 },
    ],
    legend: {
      data: selectedColumns,
      bottom: 10,
    },
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
        <input type="text" name="start" value={zoomRange.start || ""} onChange={handleZoomInputChange} />
        <span>to</span>
        <input type="text" name="end" value={zoomRange.end || ""} onChange={handleZoomInputChange} />
        <button onClick={applyZoom} style={{ padding: "8px 15px", backgroundColor: "#28a745", color: "white" }}>
          Apply Zoom
        </button>
      </div>

      <button onClick={downloadZoomedCSV}>Download Zoomed CSV</button>
      <button onClick={downloadAllParametersInZoomedCSV}>Download All Parameters in Zoomed CSV</button>

      <ReactECharts ref={chartRef} option={options} style={{ height: "650px", width: "100%" }} onEvents={handleChartEvents} />
    </div>
  );
};

export default PlotComponent;
