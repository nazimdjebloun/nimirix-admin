"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserFormValues } from "@/lib/validations/auth";
import { Plus, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ROLES, ROLE_LABELS } from "@/lib/auth/roles";


interface CreateUserDialogProps {
  disabled?: boolean;
}

export function CreateUserDialog({ disabled }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema as never),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit: SubmitHandler<CreateUserFormValues> = async (values) => {
    setIsPending(true);
    try {
        const { error } = await authClient.admin.createUser({
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
        });
      if (error) {
        if (error.message?.toLowerCase().includes("already exist") || error.code === "USER_ALREADY_EXISTS") {
          throw new Error("A user with this email already exists.");
        }
        throw new Error(error.message || "Something went wrong");
      }
      toast.success("User created successfully");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (disabled) return;
        setOpen(val);
        if (!val) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={disabled}>
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-bold font-heading">Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col px-2">
          <ScrollArea className="h-[40vh] max-h-[60vh] px-1 py-2 overflow-hidden">
            <div className="space-y-4 py-2 px-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className={`text-sm font-bold px-1 ${errors.name ? "text-destructive" : ""}`}
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    autoComplete="name"
                    className={`rounded-xl ${errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-bold px-1">
                    Role
                  </Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="role" className="w-full rounded-xl">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl" position="popper">
                          <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role} className="rounded-lg">
                                {ROLE_LABELS[role] ?? role}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={`text-sm font-bold px-1 ${errors.email ? "text-destructive" : ""}`}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  className={`rounded-xl ${errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={`text-sm font-bold px-1 ${errors.password ? "text-destructive" : ""}`}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 12 characters"
                    autoComplete="new-password"
                    className={`pr-11 rounded-xl ${errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3.5 hover:bg-transparent text-muted-foreground hover:text-foreground rounded-r-xl"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); setOpen(false); }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-xl">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}