"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";


import { useLoginMutation } from "@/redux/hooks";

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

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [login, { isLoading: submitting }] = useLoginMutation();

  const form = useForm<UserFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      await login(values).unwrap();
      toast.success("Login successful", {
        description: `Welcome back, ${values.email}`,
      });
      router.push("/main");
      router.refresh();
    } catch {
      toast.error("Login failed", {
        description: "Invalid credentials",
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Your Password"
                        autoComplete="current-password"
                        className="h-11 rounded-lg border-slate-200 bg-slate-50/70 pl-10 pr-10 transition-colors focus:bg-white"
                        {...field}
                      />
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                        aria-label={showPassword ? "Hide password" : "Show password"}
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
              isLoading={submitting}
              text="Login"
            />




            <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800 hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
