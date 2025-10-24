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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleIcon } from './google-icon';
import { Separator } from '../ui/separator';

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
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
      <div className="relative input-container">
        <Input
          id="name"
          placeholder=" "
          {...form.register('name')}
          className={`peer ${form.formState.errors.name ? 'border-destructive' : 'border-input'}`}
        />
        <Label htmlFor="name">Your Name</Label>
        {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
      </div>

      <div className="relative input-container">
        <Input
          id="email"
          type="email"
          placeholder=" "
          {...form.register('email')}
          className={`peer ${form.formState.errors.email ? 'border-destructive' : 'border-input'}`}
        />
        <Label htmlFor="email">Your Email</Label>
        {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
      </div>
      
      <div className="relative input-container">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder=" "
          {...form.register('password')}
          className={`peer ${form.formState.errors.password ? 'border-destructive' : 'border-input'}`}
        />
        <Label htmlFor="password">Create a password</Label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {form.formState.errors.password && <p className="text-xs text-destructive -mt-3 ml-1">{form.formState.errors.password.message}</p>}


      <div className="relative input-container">
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder=" "
          {...form.register('confirmPassword')}
          className={`peer ${form.formState.errors.confirmPassword ? 'border-destructive' : 'border-input'}`}
        />
        <Label htmlFor="confirmPassword">Please confirm your password</Label>
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {form.formState.errors.confirmPassword && <p className="text-xs text-destructive -mt-3 ml-1">{form.formState.errors.confirmPassword.message}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox 
            id="agree"
            onCheckedChange={(checked) => form.setValue('agree', !!checked)}
            checked={form.watch('agree')}
        />
        <Label htmlFor="agree" className="text-sm font-normal text-muted-foreground">
          I agree to the <a href="#" className="underline text-primary">Terms & Conditions</a>
        </Label>
      </div>
      {form.formState.errors.agree && <p className="text-xs text-destructive">{form.formState.errors.agree.message}</p>}
      
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="space-y-3 pt-3">
        <Button type="submit" className="w-full font-bold uppercase" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
        <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
        </div>
        <Button variant="outline" className="w-full">
          <GoogleIcon className="mr-2" />
          Continue with Google
        </Button>
      </div>
    </form>
  );
}
