import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "../../api/axios.js";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        {status === "loading" && (
          <>
            <Loader2 size={32} className="mx-auto animate-spin text-primary" />
            <p className="mt-4 text-sm text-text-secondary">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={40} className="mx-auto text-success" />
            <h2 className="mt-4 text-lg font-bold text-text">Email verified</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Your account is now fully active.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Go to dashboard
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={40} className="mx-auto text-danger" />
            <h2 className="mt-4 text-lg font-bold text-text">Verification failed</h2>
            <p className="mt-1 text-sm text-text-secondary">
              This link is invalid or has expired.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
