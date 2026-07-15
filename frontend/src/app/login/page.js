"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage } from "../../utils/errors";
import { getRoleName } from "../../utils/auth";

export default function LoginPage() {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(getRoleName(user) === "Admin" ? "/admin/dashboard" : "/dashboard");
  }, [isAuthenticated, isLoading, router, user]);

  const onSubmit = async (values) => {
    try {
      await login(values);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Login</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input id="email" label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/, message: "Enter a valid email" } })} />
        <Input id="password" label="Password" type="password" error={errors.password?.message} {...register("password", { required: "Password is required" })} />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Need an account? <Link className="font-medium text-brand" href="/register">Register</Link>
      </p>
    </div>
  );
}
