import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const data = [
  { name: "Jan", events: 2 },
  { name: "Feb", events: 5 },
  { name: "Mar", events: 8 }
];

const Analytics = () => {
  return (
    <div>
      <h2>Analytics</h2>

      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="events" stroke="#8884d8" />
      </LineChart>

    </div>
  );
};

export default Analytics;
