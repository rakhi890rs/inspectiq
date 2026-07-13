import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import api from "../../api/axios.js";
import { resetPasswordSchema } from "../../utils/validationSchemas.js";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, {
        password: values.password,
      });
      localStorage.setItem("sb_token", data.token);
      toast.success("Password reset successfully");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is invalid or expired");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong, unique password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="New password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          register={register}
          error={errors.password}
        />
        <FormInput
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your new password"
          register={register}
          error={errors.confirmPassword}
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Reset password
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
