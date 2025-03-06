import React, { useRef, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";

const PlotComponent = ({ data, selectedColumns, indexColumn }) => {
  const chartRef = useRef(null);
  const [zoomRange, setZoomRange] = useState(null);
  const isApplyingZoom = useRef(false); // Prevents unnecessary re-renders

  // Store zoom state before updating
  const saveZoomState = () => {
    if (chartRef.current && !isApplyingZoom.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      const option = echartsInstance.getOption();
      
      if (option?.dataZoom?.[0]) {
        const zoomStart = option.dataZoom[0].start;
        const zoomEnd = option.dataZoom[0].end;
        
        setZoomRange({ start: zoomStart, end: zoomEnd });
  
        // Log the zoomed index range
        console.log(`Zoomed Index Range: Start = ${zoomStart}, End = ${zoomEnd}`);
      }
    }
  };
  

  // Restore zoom AFTER updating chart
  useEffect(() => {
    if (zoomRange && chartRef.current) {
      isApplyingZoom.current = true;
      const echartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.dispatchAction({
        type: "dataZoom",
        start: zoomRange.start,
        end: zoomRange.end,
      });

      // Prevent infinite loop
      setTimeout(() => {
        isApplyingZoom.current = false;
      }, 200);
    }
  }, [zoomRange, selectedColumns]); // 👈 Watch for selectedColumns too!

  // Handle Restore Button Click
  const handleRestore = () => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.dispatchAction({ type: "restore" });
      setZoomRange(null);
    }
  };

  // **Early return after Hooks to avoid ESLint errors**
  if (!data || !indexColumn || data.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>
        📉 No data to plot.
      </div>
    );
  }

  // Generate multiple Y-axis configuration
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
        }}
      />
      {/* Restore Button */}
      <button
        onClick={handleRestore}
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Restore Zoom
      </button>
    </div>
  );
};

export default PlotComponent;
