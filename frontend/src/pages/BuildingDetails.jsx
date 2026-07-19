import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import {
  ArrowLeft,
  Building2,
  Layers,
  DoorOpen,
  Users,
  MapPin,
  QrCode,
  Sparkles,
} from "lucide-react";
import api from "../api/axios.js";
import Badge from "../components/ui/Badge.jsx";

const typeLabels = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  hospital: "Hospital",
  school: "School",
  government: "Government",
};

const BuildingDetails = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery(["building", id], async () => {
    const { data } = await api.get(`/buildings/${id}`);
    return data.building;
  });

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading building profile...</p>;
  }

  if (!data) {
    return <p className="text-sm text-text-secondary">Building not found.</p>;
  }

  const compliance = Math.max(0, 100 - (data.riskScore || 0));

  return (
    <div className="space-y-6">
      <Link to="/buildings" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text">
        <ArrowLeft size={16} /> Back to Buildings
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{data.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <MapPin size={14} />
                {[data.address?.line1, data.address?.city, data.address?.state].filter(Boolean).join(", ") || "No address on file"}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Building code: <span className="font-medium text-text">{data.buildingCode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge value={data.certificateStatus} />
            <Badge value={data.riskLevel} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat icon={Layers} label="Floors" value={data.numberOfFloors ?? "—"} />
          <MiniStat icon={DoorOpen} label="Emergency Exits" value={data.emergencyExits ?? "—"} />
          <MiniStat icon={Users} label="Occupancy" value={data.occupancy ?? "—"} />
          <MiniStat icon={Building2} label="Type" value={typeLabels[data.type] || data.type} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Overall compliance</span>
            <span className="font-semibold text-text">{compliance}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${compliance}%` }} />
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Owner Information">
            <p className="text-sm text-text">{data.owner?.name}</p>
            <p className="text-xs text-text-secondary">{data.owner?.email}</p>
            <p className="text-xs text-text-secondary">{data.owner?.phone}</p>
          </Section>

          <Section title="Construction Details">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Year built" value={data.yearBuilt || "—"} />
              <Detail label="Total area" value={data.totalArea ? `${data.totalArea} sq ft` : "—"} />
              <Detail label="Safety status" value={data.safetyStatus?.replace("_", " ") || "—"} />
              <Detail label="Risk score" value={`${data.riskScore ?? 0}/100`} />
            </dl>
          </Section>

          <UpcomingSection
            title="Inspection Timeline & Safety Audit History"
            note="Will populate once the Safety Audits module is connected — showing each inspection, checklist scores, and auditor remarks in order."
          />
          <UpcomingSection
            title="Uploaded Documents & Issued Certificates"
            note="Will list documents and certificates tied to this building once the Documents and Certificates modules are built."
          />
          <UpcomingSection
            title="AI Risk Analysis & Predictive Maintenance"
            icon={Sparkles}
            note="Will surface AI-generated risk factors and maintenance recommendations once the AI features are wired up."
          />
        </div>

        <div className="space-y-6">
          <Section title="QR Verification">
            {data.qrCode ? (
              <img src={data.qrCode} alt="Building QR code" className="mx-auto h-36 w-36" />
            ) : (
              <div className="flex h-36 items-center justify-center rounded-lg bg-surface text-text-secondary">
                <QrCode size={28} />
              </div>
            )}
            <p className="mt-2 text-center text-xs text-text-secondary">
              Scan to verify this building's registration.
            </p>
          </Section>

          <UpcomingSection title="Location Map" note="Will embed a Google Maps view once coordinates are captured for this building." />
          <UpcomingSection title="NOC Applications" note="Will list every NOC application filed for this building and its status." />
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl bg-surface p-3">
    <Icon size={16} className="text-text-secondary" />
    <p className="mt-1.5 text-sm font-bold text-text">{value}</p>
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

const UpcomingSection = ({ title, note, icon: Icon = Layers }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card p-5">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-primary" />
      <h3 className="text-sm font-semibold text-text">{title}</h3>
    </div>
    <p className="mt-2 text-xs text-text-secondary">{note}</p>
  </div>
);

export default BuildingDetails;