"use client"

import * as React from "react"
import { useState } from "react"
import { 
  LifeBuoy, 
  User, 
  Mail, 
  Send,
  ShieldAlert,
  Lock,
  HelpCircle
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent, FieldDescription } from "@/components/ui/field"
import { toast } from "sonner"
import { ROLES } from "@/lib/auth/roles"

export default function SupportPage() {
  const { data: session } = authClient.useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const user = session?.user

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitted(true)
    toast.success("Request submitted successfully!")
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Request Received</CardTitle>
            <CardDescription className="text-muted-foreground">
              We&apos;ve received your request for role assignment. Our administrators will review it and update your account soon.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Send another request
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 lg:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="mb-8 w-full max-w-4xl space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ShieldAlert className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Account Setup Required</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Welcome to the Nimirix Admin Dashboard. Your account is currently in the <span className="font-semibold text-foreground">default user role</span>. 
          To access specific dashboard features, please request a departmental role assignment below.
        </p>
      </div>

      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2">
        {/* Help/Info Card */}
        <div className="flex flex-col gap-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <HelpCircle className="h-5 w-5 text-primary" />
                Why am I seeing this?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Access Control</p>
                  <p className="text-sm text-muted-foreground">Our dashboard uses Role-Based Access Control (RBAC) to ensure data security and departmental focus.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Role Assignment</p>
                  <p className="text-sm text-muted-foreground">Each department (Sales, Dev, QA, etc.) has its own tailored dashboard and permission set.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <LifeBuoy className="mt-1 h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Need urgent help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you require immediate access for a production issue, please contact your team lead or reach out to the IT support desk directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <Card className="border-border/40 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Request Role Assignment
            </CardTitle>
            <CardDescription>
              Provide your details and the role you need to access your departmental tools.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <FieldContent>
                    <Input 
                      disabled 
                      defaultValue={user?.name || ""} 
                      placeholder="Your full name"
                      className="bg-muted/50"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldContent>
                    <Input 
                      disabled 
                      defaultValue={user?.email || ""} 
                      placeholder="work@email.com"
                      className="bg-muted/50"
                    />
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel>Departmental Role</FieldLabel>
                <FieldContent>
                  <Select name="role" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select the role you're requesting" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.filter(r => r !== 'user' && r !== 'admin').map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
                <FieldDescription>Choose the role that best matches your daily responsibilities.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Justification / Message</FieldLabel>
                <FieldContent>
                  <Textarea 
                    placeholder="Briefly describe why you need this role assignment..." 
                    className="min-h-30 resize-none"
                    required
                  />
                </FieldContent>
              </Field>
            </CardContent>
            <CardFooter className="pt-5 ">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
