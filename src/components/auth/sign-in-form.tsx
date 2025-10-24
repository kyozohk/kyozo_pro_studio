"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { handleSignIn } from "@/firebase/auth/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function SignInForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
  
    const form = useForm<SignInInput>({
      resolver: zodResolver(signInSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });
  
    const onSubmit = (data: SignInInput) => {
        setError(null);
        startTransition(async () => {
            try {
                await handleSignIn(data);
                toast({
                    title: "Signed In",
                    description: "You have been successfully signed in.",
                });
                router.push('/dashboard');
            } catch (e: any) {
                switch (e.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        setError("Invalid email or password.");
                        break;
                    default:
                        setError("An unexpected error occurred. Please try again.");
                        break;
                }
            }
        });
    };
  
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6" noValidate>
        <div className="relative input-container">
          <Input
            id="email"
            type="email"
            placeholder=" "
            {...form.register("email")}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={cn(
                'peer',
                form.formState.errors.email ? 'border-destructive' : '',
                emailFocused && 'gradient-border'
            )}
          />
          <Label htmlFor="email">Your Email</Label>
          {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
        </div>
        <div className="relative input-container">
          <Input
            id="password"
            type="password"
            placeholder=" "
            {...form.register("password")}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={cn(
                'peer',
                form.formState.errors.password ? 'border-destructive' : '',
                passwordFocused && 'gradient-border'
            )}
          />
          <Label htmlFor="password">Password</Label>
          {form.formState.errors.password && <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>}
        </div>
        
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
  
        <Button type="submit" className="w-full font-bold uppercase" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    );
  }
  