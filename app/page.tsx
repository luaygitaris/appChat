"use client"

import { useId, useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function SignupDialogOpen() {
  const id = useId()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isRegister) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to register")
        }

        setIsRegister(false) // Setelah register, ganti ke mode login
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/chat",
        })

        if (result?.error) {
          throw new Error("Invalid credentials")
        }

        window.location.href = result?.url || "/"
      }
    } catch (err) {
      setError("Something went wrong")
      console.error("Authentication error:", err)
    }

    setLoading(false)
  }

  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <div className="font-bold text-lg">MyApp</div>
          <div>
            <Link href="/" className="mr-4">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Sign in / Sign up</Button>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border">
                <svg className="stroke-zinc-800 dark:stroke-zinc-100" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
                </svg>
              </div>
              <DialogHeader>
                <DialogTitle className="sm:text-center">
                  {isRegister ? "Create an account" : "Welcome back"}
                </DialogTitle>
                <DialogDescription className="sm:text-center">
                  {isRegister ? "Enter details to register." : "Login to your account."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form className="space-y-5" onSubmit={handleAuth}>
              <div className="space-y-4">
                {isRegister && (
                  <div>
                    <Label htmlFor={`${id}-name`}>Full name</Label>
                    <Input
                      id={`${id}-name`}
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor={`${id}-email`}>Email</Label>
                  <Input
                    id={`${id}-email`}
                    type="email"
                    placeholder="hi@yourcompany.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${id}-password`}>Password</Label>
                  <Input
                    id={`${id}-password`}
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {!isRegister && (
                <div className="flex justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id={`${id}-remember`} />
                    <Label htmlFor={`${id}-remember`} className="text-muted-foreground font-normal">
                      Remember me
                    </Label>
                  </div>
                  <a className="text-sm underline hover:no-underline" href="#">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? isRegister
                    ? "Registering..."
                    : "Logging in..."
                  : isRegister
                  ? "Sign up"
                  : "Sign in"}
              </Button>
            </form>

            <div className="text-center text-sm mt-2">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                className="text-blue-600 underline hover:no-underline"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Login" : "Register"}
              </button>
            </div>

            <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1 mt-4">
              <span className="text-muted-foreground text-xs">Or</span>
            </div>

            <Button
              variant="outline"
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
              className="w-full"
            >
              Continue with Google
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
