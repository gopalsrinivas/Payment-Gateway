"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage } from "../../utils/errors";

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const { confirmPassword: _confirmPassword, ...payload } = values;
      await registerAccount(payload);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Register</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input id="name" label="Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
        <Input id="email" label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/, message: "Enter a valid email" } })} />
        <Input
          id="password"
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" } })}
        />
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", { validate: (value, values) => value === values.password || "Passwords must match" })}
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link className="font-medium text-brand" href="/login">Login</Link>
      </p>
    </div>
  );
}
