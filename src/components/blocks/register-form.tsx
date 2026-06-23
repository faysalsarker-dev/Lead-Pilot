"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLoginMutation, useRegisterMutation } from "@/redux/hooks";

import {
  Card,
  CardContent,
  ActionButton,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";

import { Prisma } from "@/app/generated/prisma/client";

type UserFormValues = Prisma.UserCreateInput;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const form = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      service: "",
      password: "",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      const data = await register(values).unwrap();
      await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      toast.success("Account created", {
        description: `Welcome to Lead Pilot, ${data.user.name}`,
      });
      router.push("/main");
      router.refresh();
    } catch {
      toast.error("Registration failed", {
        description: "Unable to create your account",
      });
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl border  bg-white shadow-lg">
      <CardContent className="p-5 sm:p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Enter Your Name"
                        autoComplete="name"
                        className="h-11 rounded-lg border-slate-200 bg-slate-50/70 pl-10 transition-colors focus:bg-white"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Enter Your Email"
                        autoComplete="email"
                        className="h-11 rounded-lg border-slate-200 bg-slate-50/70 pl-10 transition-colors focus:bg-white"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Service</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Web development"
                        autoComplete="organization-title"
                        className="h-11 rounded-lg border-slate-200 bg-slate-50/70 pl-10 transition-colors focus:bg-white"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className="h-11 rounded-lg border-slate-200 bg-slate-50/70 pl-10 pr-10 transition-colors focus:bg-white"
                        {...field}
                      />
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ActionButton
              type="submit"
              isLoading={isRegistering || isLoggingIn}
              text="Create Account"
              loadingText="Creating Account..."
            />

            <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
