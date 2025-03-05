import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import ReactECharts from "echarts-for-react";

const PlotComponent = ({ data, selectedColumns, indexColumn }) => {
  const chartRef = useRef(null);
  const [zoomRange, setZoomRange] = useState(null);

  // Memoize index column data to prevent unnecessary recalculations
  const xAxisData = useMemo(
    () => (data ? data.map((row) => row[indexColumn]) : []),
    [data, indexColumn]
  );

  // Memoize Y-axis configuration
  const yAxisConfig = useMemo(() => {
    return selectedColumns.map((col, index) => ({
      type: "value",
      name: col,
      position: index % 2 === 0 ? "left" : "right",
      alignTicks: true,
      offset: index * 50,
      axisLine: { show: true },
      splitLine: { show: index === 0 },
    }));
  }, [selectedColumns]);

  // Memoize Series Data
  const series = useMemo(() => {
    return selectedColumns.map((col, index) => ({
      name: col,
      type: "line",
      data: data ? data.map((row) => row[col]) : [],
      yAxisIndex: index,
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      showSymbol: true, // Ensure symbols are shown even when toggled
    }));
  }, [data, selectedColumns]);

  // Optimize Chart Options with useMemo
  const options = useMemo(() => {
    return {
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
        containLabel: true,
        left: "12%",
        right: "12%",
        bottom: "20%",
        top: "22%",
      },
      xAxis: {
        type: "category",
        name: indexColumn,
        data: xAxisData, // Using memoized xAxisData
      },
      yAxis: yAxisConfig, // Using memoized Y-axis configuration
      series: series, // Using memoized Series Data
      dataZoom: [
        { type: "inside", xAxisIndex: 0 },
        { type: "slider", xAxisIndex: 0, bottom: 30 },
      ],
      animationDuration: 500, // Reduce animation time for faster rendering
    };
  }, [xAxisData, selectedColumns, indexColumn, yAxisConfig, series]);

  // Optimize Zoom Handling with useCallback
  const saveZoomState = useCallback(() => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      const option = echartsInstance.getOption();
      const zoom = option.dataZoom?.[0];
      if (zoom) {
        setZoomRange({ start: zoom.start, end: zoom.end });
      }
    }
  }, []);

  // Efficiently Apply Zoom Without Re-renders
  useEffect(() => {
    if (chartRef.current && zoomRange) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.dispatchAction({
        type: "dataZoom",
        start: zoomRange.start,
        end: zoomRange.end,
      });
    }
  }, [zoomRange]);

  // Handle Reset Button Click
  const handleResetZoom = useCallback(() => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
      setZoomRange(null); // Reset the zoom range state
    }
  }, []);

  if (!data || !indexColumn || data.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>
        📉 No data to plot.
      </div>
    );
  }

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
        onEvents={{ dataZoom: saveZoomState }}
      />
      <button onClick={handleResetZoom}>Reset Zoom</button>
    </div>
  );
};

export default PlotComponent;
