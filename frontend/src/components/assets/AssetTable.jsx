import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Pencil,
  CalendarPlus,
  Wrench,
  UserPlus,
  FileBarChart,
  History,
  Download,
  QrCode,
  Trash2,
} from "lucide-react";
import Badge from "../ui/Badge.jsx";

const categoryLabels = {
  fire_alarm: "Fire Alarm",
  smoke_detector: "Smoke Detector",
  fire_extinguisher: "Fire Extinguisher",
  sprinkler_system: "Sprinkler System",
  emergency_lights: "Emergency Lights",
  exit_signage: "Exit Signage",
  lift: "Lift",
  generator: "Generator",
  electrical_panel: "Electrical Panel",
  cctv: "CCTV",
  access_control: "Access Control",
  gas_detector: "Gas Detector",
  water_pump: "Water Pump",
  hvac: "HVAC",
  emergency_exit_door: "Emergency Exit Door",
  medical_equipment: "Medical Equipment",
  structural_sensors: "Structural Sensors",
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

const AssetTable = ({ assets, onDelete }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-xs uppercase text-text-secondary">
            <th className="px-4 py-3 font-semibold">Asset ID</th>
            <th className="px-4 py-3 font-semibold">Equipment</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Building / Floor</th>
            <th className="px-4 py-3 font-semibold">Condition</th>
            <th className="px-4 py-3 font-semibold">Next Inspection</th>
            <th className="px-4 py-3 font-semibold">Technician</th>
            <th className="px-4 py-3 font-semibold">Compliance</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset._id} className="border-b border-border last:border-0 hover:bg-surface/60">
              <td className="px-4 py-3 font-mono text-xs text-text-secondary">{asset.assetCode}</td>
              <td className="px-4 py-3">
                <Link to={`/assets/${asset._id}`} className="font-semibold text-text hover:underline">
                  {asset.name}
                </Link>
                {asset.serialNumber && (
                  <p className="text-xs text-text-secondary">S/N: {asset.serialNumber}</p>
                )}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {categoryLabels[asset.category] || asset.category}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {asset.building?.name || "—"}
                {asset.floor && <span className="block text-xs">Floor {asset.floor}</span>}
              </td>
              <td className="px-4 py-3">
                <Badge value={asset.condition} />
              </td>
              <td className="px-4 py-3 text-text-secondary">{formatDate(asset.nextInspectionDate)}</td>
              <td className="px-4 py-3 text-text-secondary">{asset.assignedTechnician?.name || "Unassigned"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${asset.complianceScore ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text">{asset.complianceScore ?? 0}%</span>
                </div>
              </td>
              <td className="relative px-4 py-3 text-right">
                <button
                  onClick={() => setOpenMenuId(openMenuId === asset._id ? null : asset._id)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-surface"
                  aria-label="More actions"
                >
                  <MoreVertical size={16} />
                </button>
                {openMenuId === asset._id && (
                  <div className="absolute right-4 top-10 z-10 w-56 rounded-xl border border-border bg-card py-1 text-left shadow-card">
                    <MenuItem icon={Eye} label="View Details" to={`/assets/${asset._id}`} />
                    <MenuItem icon={Pencil} label="Edit Asset" />
                    <MenuItem icon={CalendarPlus} label="Schedule Inspection" />
                    <MenuItem icon={Wrench} label="Schedule Maintenance" />
                    <MenuItem icon={UserPlus} label="Assign Technician" />
                    <MenuItem icon={FileBarChart} label="Generate Service Report" />
                    <MenuItem icon={History} label="View History" />
                    <MenuItem icon={Download} label="Download Certificate" />
                    <MenuItem icon={QrCode} label="Generate QR Code" />
                    <div className="my-1 border-t border-border" />
                    <MenuItem icon={Trash2} label="Delete" danger onClick={() => onDelete(asset)} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, to, onClick, danger }) => {
  const className = `flex w-full items-center gap-2 px-3.5 py-2 text-sm ${
    danger ? "text-danger hover:bg-danger/5" : "text-text hover:bg-surface"
  }`;
  if (to) {
    return (
      <Link to={to} className={className}>
        <Icon size={15} /> {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      <Icon size={15} /> {label}
    </button>
  );
};

export default AssetTable;