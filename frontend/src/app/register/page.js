"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormField from "../../components/ui/FormField";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await registerAccount(values);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Register</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
        <FormField label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Email is required" })} />
        <FormField
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" } })}
        />
        <button className="w-full rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link className="font-medium text-brand" href="/login">Login</Link>
      </p>
    </div>
  );
}

