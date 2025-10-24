'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useTransition } from 'react';
import { handleSignUp } from '@/firebase/auth/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Mail, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  const onSubmit = (data: SignUpInput) => {
    setError(null);
    startTransition(async () => {
      try {
        await handleSignUp(data);
        toast({
          title: 'Account Created',
          description: "You're all set! Welcome to Kyozo.",
        });
        router.push('/dashboard');
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
          setError("An account with this email already exists.");
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative input-container flex items-center">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="firstName"
            placeholder=" "
            {...form.register('firstName')}
            onFocus={() => setFirstNameFocused(true)}
            onBlur={() => setFirstNameFocused(false)}
            className={cn(
                'peer pl-10', 
                form.formState.errors.firstName ? 'border-destructive' : 'border-input',
                firstNameFocused && 'gradient-border'
              )}
          />
          <Label htmlFor="firstName">First Name</Label>
          {form.formState.errors.firstName && <p className="text-xs text-destructive mt-1 absolute -bottom-5">{form.formState.errors.firstName.message}</p>}
        </div>
        <div className="relative input-container flex items-center">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="lastName"
            placeholder=" "
            {...form.register('lastName')}
            onFocus={() => setLastNameFocused(true)}
            onBlur={() => setLastNameFocused(false)}
            className={cn(
                'peer pl-10', 
                form.formState.errors.lastName ? 'border-destructive' : 'border-input',
                lastNameFocused && 'gradient-border'
              )}
          />
          <Label htmlFor="lastName">Last Name</Label>
          {form.formState.errors.lastName && <p className="text-xs text-destructive mt-1 absolute -bottom-5">{form.formState.errors.lastName.message}</p>}
        </div>
      </div>

      <div className="relative input-container flex items-center">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          id="email"
          type="email"
          placeholder=" "
          {...form.register('email')}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          className={cn(
              'peer pl-10', 
              form.formState.errors.email ? 'border-destructive' : 'border-input',
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
          {...form.register('password')}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          className={cn(
            'peer pl-10', 
            form.formState.errors.password ? 'border-destructive' : 'border-input',
            passwordFocused && 'gradient-border'
            )}
        />
        <Label htmlFor="password">Create a password</Label>
        {form.formState.errors.password && <p className="text-xs text-destructive mt-1 absolute -bottom-5">{form.formState.errors.password.message}</p>}
      </div>


      <div className="relative input-container flex items-center">
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder=" "
          {...form.register('confirmPassword')}
          onFocus={() => setConfirmPasswordFocused(true)}
          onBlur={() => setConfirmPasswordFocused(false)}
          className={cn(
            'peer pl-10', 
            form.formState.errors.confirmPassword ? 'border-destructive' : 'border-input',
            confirmPasswordFocused && 'gradient-border'
            )}
        />
        <Label htmlFor="confirmPassword">Please confirm your password</Label>
        {form.formState.errors.confirmPassword && <p className="text-xs text-destructive mt-1 absolute -bottom-5">{form.formState.errors.confirmPassword.message}</p>}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
            id="agree"
            onCheckedChange={(checked) => form.setValue('agree', !!checked)}
            checked={form.watch('agree')}
        />
        <Label htmlFor="agree" className="text-sm font-normal text-muted-foreground">
          I agree to the <a href="#" className="underline text-primary">Terms & Conditions</a>
        </Label>
      </div>
      {form.formState.errors.agree && <p className="text-xs text-destructive -mt-2 ml-1">{form.formState.errors.agree.message}</p>}
      
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="space-y-3 pt-3">
        <Button type="submit" className="w-full font-bold uppercase" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </div>
    </form>
  );
}
