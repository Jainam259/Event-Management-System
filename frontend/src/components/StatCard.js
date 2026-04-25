import React from "react";

const StatCard = ({ title, value, color }) => {
  return (
    <div className={`stat-card ${color}`}>
      <h2>{value}</h2>
      <p>{title}</p>
    </div>
  );
};

export default StatCard;
