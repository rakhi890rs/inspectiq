import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { registerSchema } from "../../utils/validationSchemas.js";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as a Building Owner to start managing safety audits and NOC applications"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Full name"
          name="name"
          placeholder="Jane Doe"
          register={register}
          error={errors.name}
        />
        <FormInput
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
        />
        <FormInput
          label="Phone number"
          name="phone"
          placeholder="+91 98765 43210"
          register={register}
          error={errors.phone}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          register={register}
          error={errors.password}
        />
        <FormInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          register={register}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
