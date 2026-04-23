"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)

    // Call login function and console values
    console.log("Login submitted with values:", data)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    toast.success("Welcome back to Lead Pilot!", {
      description: "You have successfully logged in.",
    })
    
    setIsLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-8 w-full max-w-md mx-auto", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
          <span className="text-primary-foreground font-bold text-xl tracking-tighter">LP</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Pilot</h1>
        <p className="text-muted-foreground font-medium">Welcome back! Please enter your details.</p>
      </div>

      <Card className="border-none shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={cn(errors.email && "border-destructive focus-visible:ring-destructive/20")}
                  disabled={isLoading}
                />
                {errors.email && <FieldError className="mt-1">{errors.email.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    {...register("password")}
                    className={cn(
                      "pr-10",
                      errors.password && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.password && <FieldError className="mt-1">{errors.password.message}</FieldError>}
              </Field>
              <Field className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-center text-sm text-muted-foreground">
        Secure login powered by Lead Pilot technology
      </p>
    </div>
  )
}
