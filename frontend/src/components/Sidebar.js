import React from "react";
import { FaCalendarAlt, FaPlus, FaUsers, FaChartLine, FaCog } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">📅 EventManager</h2>

      <ul>
        <li className="active"><FaCalendarAlt /> Dashboard</li>
        <li><FaPlus /> Create Event</li>
        <li><FaUsers /> Participants</li>
        <li><FaChartLine /> Analytics</li>
        <li><FaCog /> Settings</li>
      </ul>

      <div className="logout">Logout</div>
    </div>
  );
};

export default Sidebar;
