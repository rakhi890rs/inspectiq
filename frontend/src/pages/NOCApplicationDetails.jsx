import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  BadgeCheck,
  FolderOpen,
  History,
} from "lucide-react";
import api from "../api/axios.js";
import Badge from "../components/ui/Badge.jsx";
import StatusTimeline from "../components/noc/StatusTimeline.jsx";
import { useAuth, ROLES } from "../context/AuthContext.jsx";
import { ALLOWED_TRANSITIONS, NOC_STATUS } from "../utils/nocStatus.js";

const stageActionLabel = {
  [NOC_STATUS.VERIFICATION]: "Move to Verification",
  [NOC_STATUS.INSPECTION]: "Move to Inspection",
  [NOC_STATUS.APPROVED]: "Approve Application",
  [NOC_STATUS.CERTIFICATE_ISSUED]: "Mark Certificate Issued",
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

const NOCApplicationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: application, isLoading } = useQuery(["noc-application", id], async () => {
    const { data } = await api.get(`/noc-applications/${id}`);
    return data.application;
  });

  const statusMutation = useMutation(
    (payload) => api.put(`/noc-applications/${id}/status`, payload),
    {
      onSuccess: () => {
        toast.success("Status updated");
        setShowRejectForm(false);
        queryClient.invalidateQueries(["noc-application", id]);
      },
      onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
    }
  );

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading application...</p>;
  }
  if (!application) {
    return <p className="text-sm text-text-secondary">Application not found.</p>;
  }

  const canManage = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.AUDITOR;
  const nextSteps = ALLOWED_TRANSITIONS[application.status] || [];
  const advanceStep = nextSteps.find((s) => s !== NOC_STATUS.REJECTED);

  return (
    <div className="space-y-6">
      <Link
        to="/noc-applications"
        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text"
      >
        <ArrowLeft size={16} /> Back to NOC Applications
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{application.building?.name}</h1>
              <p className="mt-1 text-xs text-text-secondary">{application.applicationNumber}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <UserCog size={14} /> {application.applicant?.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} /> Submitted {formatDate(application.submittedAt)}
                </span>
              </div>
            </div>
          </div>
          <Badge value={application.status} />
        </div>

        {/* Timeline */}
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="min-w-[500px]">
            <StatusTimeline status={application.status} />
          </div>
        </div>

        {application.status === NOC_STATUS.REJECTED && application.rejectionReason && (
          <p className="mt-4 rounded-lg bg-danger/5 p-3 text-sm text-danger">
            Reason: {application.rejectionReason}
          </p>
        )}

        {/* Workflow controls */}
        {canManage && nextSteps.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            {advanceStep && (
              <button
                onClick={() => statusMutation.mutate({ status: advanceStep })}
                disabled={statusMutation.isLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {stageActionLabel[advanceStep] || `Move to ${advanceStep}`}
              </button>
            )}
            {nextSteps.includes(NOC_STATUS.REJECTED) && (
              <button
                onClick={() => setShowRejectForm((s) => !s)}
                className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/5"
              >
                Reject Application
              </button>
            )}
          </div>
        )}

        {showRejectForm && (
          <div className="mt-4 space-y-2">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() =>
                statusMutation.mutate({ status: NOC_STATUS.REJECTED, rejectionReason })
              }
              disabled={!rejectionReason.trim() || statusMutation.isLoading}
              className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
            >
              Confirm Rejection
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Status History" icon={History}>
            <div className="space-y-3">
              {[...(application.statusHistory || [])].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Badge value={entry.status} />
                  <div>
                    <p className="text-text-secondary">
                      {entry.changedBy?.name || "System"} · {formatDate(entry.changedAt)}
                    </p>
                    {entry.note && <p className="text-xs text-text-secondary">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <UpcomingSection
            title="Uploaded Documents"
            icon={FolderOpen}
            note="Will list documents attached to this application once the Documents module connects here."
          />
        </div>

        <div className="space-y-6">
          <Section title="Linked Safety Audit" icon={ClipboardCheck}>
            {application.audit ? (
              <Link to={`/audits/${application.audit._id}`} className="text-sm font-medium text-primary hover:underline">
                View inspection ({application.audit.status})
              </Link>
            ) : (
              <p className="text-sm text-text-secondary">No inspection linked yet.</p>
            )}
          </Section>

          <Section title="Certificate" icon={BadgeCheck}>
            {application.certificate ? (
              <div>
                <p className="text-sm font-medium text-text">{application.certificate.certificateNumber}</p>
                <p className="text-xs text-text-secondary">
                  Valid until {formatDate(application.certificate.validUntil)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">Not yet issued.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-primary" />}
      <h3 className="text-sm font-semibold text-text">{title}</h3>
    </div>
    <div className="mt-3">{children}</div>
  </div>
);

const UpcomingSection = ({ title, note, icon: Icon }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card p-5">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-primary" />}
      <h3 className="text-sm font-semibold text-text">{title}</h3>
    </div>
    <p className="mt-2 text-xs text-text-secondary">{note}</p>
  </div>
);

export default NOCApplicationDetails;