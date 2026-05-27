// ShadowProfileChart.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@mui/material";

export default function ShadowProfileChart({
  nivelSombra16,
  setNivelSombra16,
  selectedLayer,
  guardarEnSessionStorage,
  drawnItemsRef
}) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const svgRef = useRef(null);

  const width = 800;
  const height = 350;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const localData = Array.isArray(nivelSombra16)
    ? nivelSombra16.slice(0, 16)
    : Array(16).fill(0);

  const labels = Array.from({ length: 16 }, (_, i) =>
    Math.round(-180 + (i * 360) / 15)
  );

  const barWidth = chartWidth / 16;
  const referenceCurve1 = [0, 0, .15, 33, 55, 68, 73, 75, 75, 73, 68, 55, 33, .15, 0, 0];
  const referenceCurve2 = [0, 0, 0, 0, 0, .14, 18, 25, 25, 18, .14, 0, 0, 0, 0, 0];

  const getYPosition = (value) =>
    padding.top + chartHeight - (value / 90) * chartHeight;

  const getValueFromY = (y) =>
    Math.max(
      1,
      Math.min(90, Math.round(90 - ((y - padding.top) / chartHeight) * 90))
    );

  const updateValue = (index, newValue) => {
    const newData = [...localData];
    newData[index] = newValue;
    setNivelSombra16(newData);

    if (selectedLayer) {
      selectedLayer._myData = selectedLayer._myData || {};
      selectedLayer._myData.nivelSombra = newData.slice(0, 16);
      if (drawnItemsRef?.current) guardarEnSessionStorage(drawnItemsRef.current);
    }
  };

  const handleMouseDown = (index) => setDraggingIndex(index);
  const handleMouseUp = () => setDraggingIndex(null);

  const handleMouseMove = (e) => {
    if (draggingIndex === null || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    updateValue(draggingIndex, getValueFromY(svgP.y));
  };

  const handleTouchMove = (e) => {
    if (draggingIndex === null || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.touches[0].clientX;
    pt.y = e.touches[0].clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    updateValue(draggingIndex, getValueFromY(svgP.y));
  };

  const handleClick = (e) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    const x = svgP.x;
    const y = svgP.y;

    const index = Math.floor((x - padding.left) / barWidth);
    if (index >= 0 && index < 16) {
      updateValue(index, getValueFromY(y));
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggingIndex(null);

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, []);

  const generateCurvePath = (curveData) => {
    const points = curveData
      .map((value, i) => ({
        x: padding.left + i * barWidth + barWidth / 2,
        y: getYPosition(value),
        value,
      }))
      .filter((p) => p.value > 0);

    if (points.length === 0) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  return (
    <Card elevation={3}
      sx={{
        maxWidth: "100%",
        overflowX: "auto",
        borderRadius: 2,
        padding: 1,
      }}
    >
      <CardContent
        sx={{
          minWidth: "fit-content",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            maxWidth: 800,
            height: "auto",
            touchAction: "none",
            userSelect: "none",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onClick={handleClick}
        >
          {/* Grid lines */}
          {[0, 15, 30, 45, 60, 75, 90].map((value) => {
            const y = getYPosition(value);
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="lightgrey"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="20"
                  fill="black"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Vertical grid */}
          {labels.map((label, i) => {
            const x = padding.left + i * barWidth + barWidth / 2;
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke="lightgrey"
                strokeWidth={1}
                strokeDasharray="4"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* X-axis labels */}
          {labels.map((label, i) => {
            const x = padding.left + i * barWidth + barWidth / 2;
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={height - padding.bottom + 25}
                textAnchor="middle"
                style={{ fontSize: 20 }}
                fill="black"
              >
                {label}
              </text>
            );
          })}

          {/* Reference curves */}
          <path
            d={generateCurvePath(referenceCurve1)}
            fill="none"
            stroke="gray"
            strokeWidth="1"
          />
          <path
            d={generateCurvePath(referenceCurve2)}
            fill="none"
            stroke="gray"
            strokeWidth="1"
          />

          {/* Bars */}
          {localData.map((value, i) => {
            const x = padding.left + i * barWidth;
            const y = getYPosition(value);
            const barHeight = chartHeight - (y - padding.top);
            const isActive = draggingIndex === i;

            return (
              <g key={i}>
                <rect
                  x={x + 1}
                  y={y}
                  width={barWidth - 2}
                  height={barHeight}
                  fill={isActive ? "orange" : "gray"}
                  rx="3"
                  style={{ cursor: "pointer" }}
                  onMouseDown={() => handleMouseDown(i)}
                  onTouchStart={() => handleMouseDown(i)}
                />
                {(value > 10 || isActive) && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="bold"
                    fill="black"
                  >
                    {value}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis titles */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="black"
          >
            Azimut (°)
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            fontSize="20"
            fontWeight="bold"
            fill="black"
          >
            Elevación (°)
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}
