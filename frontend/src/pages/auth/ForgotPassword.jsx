import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, MailCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import api from "../../api/axios.js";
import { forgotPasswordSchema } from "../../utils/validationSchemas.js";

const ForgotPassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", values);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-card">
          <div className="rounded-full bg-success/10 p-3 text-success">
            <MailCheck size={28} />
          </div>
          <p className="text-sm text-text-secondary">
            If an account exists for that email, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Send reset link
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Remembered your password?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
