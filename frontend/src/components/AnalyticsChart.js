import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Sun", value: 100 },
  { name: "Mon", value: 150 },
  { name: "Tue", value: 120 },
  { name: "Wed", value: 200 },
  { name: "Thu", value: 170 },
  { name: "Fri", value: 220 },
  { name: "Sat", value: 250 }
];

const AnalyticsChart = () => {
  return (
    <LineChart width={300} height={200} data={data}>
      <XAxis dataKey="name" stroke="#fff" />
      <YAxis stroke="#fff" />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#ff00ff" />
    </LineChart>
  );
};

export default AnalyticsChart;
