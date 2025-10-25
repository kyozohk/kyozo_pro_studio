"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { useAuth } from "@/firebase/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function SignInForm() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const { signIn, authError } = useAuth();
  
    const form = useForm<SignInInput>({
      resolver: zodResolver(signInSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });
  
    const onSubmit = (data: SignInInput) => {
        startTransition(async () => {
            try {
                await signIn(data);
                toast({
                    title: "Signed In",
                    description: "You have been successfully signed in.",
                });
                router.push('/dashboard');
            } catch (e: any) {
              // error is handled by useAuth hook and displayed
            }
        });
    };
  
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="relative input-container flex items-center">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="email"
            type="email"
            placeholder=" "
            {...form.register("email")}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={cn(
                'peer pl-10',
                form.formState.errors.email ? 'border-destructive' : '',
                emailFocused && 'gradient-border'
            )}
          />
          <Label htmlFor="email">Your Email</Label>
          {form.formState.errors.email && <p className="text-xs text-destructive mt-1 absolute -bottom-5">{form.formState.errors.email.message}</p>}
        </div>
        <div className="relative input-container flex items-center">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder=" "
            {...form.register("password")}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={cn(
                'peer pl-10',
                form.formState.errors.password ? 'border-destructive' : '',
                passwordFocused && 'gradient-border'
            )}
          />
          <Label htmlFor="password">Password</Label>
           {form.formState.errors.password && <p className="text-xs text-destructive mt-1 absolute -bottom-5">{form.formState.errors.password.message}</p>}
        </div>

        <a href="#" className="block text-right text-sm text-primary hover:underline">Forgot Password?</a>
        
        {authError && <p className="text-sm text-destructive text-center">{authError}</p>}
  
        <Button type="submit" className="w-full font-bold uppercase" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    );
  }
  
