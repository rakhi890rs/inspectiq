import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import {
  ArrowLeft,
  Wrench,
  Building2,
  CalendarClock,
  ShieldCheck,
  Sparkles,
  FileText,
  QrCode,
} from "lucide-react";
import api from "../api/axios.js";
import Badge from "../components/ui/Badge.jsx";

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

const AssetDetails = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(["asset", id], async () => {
    const { data } = await api.get(`/assets/${id}`);
    return data.asset;
  });

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading asset profile...</p>;
  }
  if (!data) {
    return <p className="text-sm text-text-secondary">Asset not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/assets" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text">
        <ArrowLeft size={16} /> Back to Assets & Safety Equipment
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Wrench size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{data.name}</h1>
              <p className="mt-1 text-xs text-text-secondary">
                {data.assetCode} · {categoryLabels[data.category] || data.category}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <Building2 size={14} />
                {data.building?.name}
                {data.floor && ` · Floor ${data.floor}`}
                {data.location && ` · ${data.location}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge value={data.condition} />
            <Badge value={data.riskLevel} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat label="Manufacturer" value={data.manufacturer || "—"} />
          <MiniStat label="Model" value={data.model || "—"} />
          <MiniStat label="Serial number" value={data.serialNumber || "—"} />
          <MiniStat label="Installed" value={formatDate(data.installationDate)} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Compliance score</span>
            <span className="font-semibold text-text">{data.complianceScore ?? 0}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${data.complianceScore ?? 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Installation & Warranty Details">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Installation date" value={formatDate(data.installationDate)} />
              <Detail label="Warranty expiry" value={formatDate(data.warrantyExpiry)} />
              <Detail label="Last inspection" value={formatDate(data.lastInspectionDate)} />
              <Detail label="Next inspection" value={formatDate(data.nextInspectionDate)} />
            </dl>
          </Section>

          <Section title="Assigned Technician">
            {data.assignedTechnician ? (
              <>
                <p className="text-sm text-text">{data.assignedTechnician.name}</p>
                <p className="text-xs text-text-secondary">{data.assignedTechnician.email}</p>
              </>
            ) : (
              <p className="text-sm text-text-secondary">No technician assigned yet.</p>
            )}
          </Section>

          <UpcomingSection
            title="Maintenance History & Repair Logs"
            icon={CalendarClock}
            note="Will show a timeline of maintenance visits and repair logs once the maintenance workflow is built."
          />
          <UpcomingSection
            title="Inspection Reports & Compliance Certificates"
            icon={FileText}
            note="Will list inspection reports and certificates tied to this asset once Documents and Certificates modules connect here."
          />
          <UpcomingSection
            title="AI Health Analysis"
            icon={Sparkles}
            note="Equipment health score, failure risk prediction, remaining useful life, and replacement recommendations will appear here once AI features are built."
          />
        </div>

        <div className="space-y-6">
          <Section title="QR Verification">
            {data.qrCode ? (
              <img src={data.qrCode} alt="Asset QR code" className="mx-auto h-36 w-36" />
            ) : (
              <div className="flex h-36 items-center justify-center rounded-lg bg-surface text-text-secondary">
                <QrCode size={28} />
              </div>
            )}
            <p className="mt-2 text-center text-xs text-text-secondary">
              Scan to verify this asset's registration and inspection status.
            </p>
          </Section>

          <Section title="Safety Status">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <Badge value={data.safetyStatus} />
            </div>
          </Section>

          <UpcomingSection title="Uploaded Manuals" note="Will list uploaded equipment manuals and spec sheets once file uploads are wired up." />
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-xl bg-surface p-3">
    <p className="text-sm font-bold text-text">{value}</p>
    <p className="text-xs text-text-secondary">{label}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <h3 className="text-sm font-semibold text-text">{title}</h3>
    <div className="mt-3">{children}</div>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs text-text-secondary">{label}</dt>
    <dd className="font-medium capitalize text-text">{value}</dd>
  </div>
);

const UpcomingSection = ({ title, note, icon: Icon = FileText }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card p-5">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-primary" />
      <h3 className="text-sm font-semibold text-text">{title}</h3>
    </div>
    <p className="mt-2 text-xs text-text-secondary">{note}</p>
  </div>
);

export default AssetDetails;