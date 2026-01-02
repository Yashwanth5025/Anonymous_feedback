"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface Question {
  id: string
  type: "mcq" | "text"
  question: string
  options?: string[]
}

interface Form {
  _id: string
  id?: string
  title: string
  description: string
  questions: Question[]
  type: "public" | "private"
  createdAt: string
}

export default function FeedbackFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [tokenError, setTokenError] = useState("")
  const [isValidatingToken, setIsValidatingToken] = useState(false)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user has already submitted this form
    const submittedForms = JSON.parse(localStorage.getItem("submittedForms") || "[]")
    if (submittedForms.includes(id)) {
      setHasSubmitted(true)
      setIsLoading(false)
      return
    }

    // Check if user has access to this form (for private forms)
    const formAccess = JSON.parse(localStorage.getItem("formAccess") || "{}")
    if (formAccess[id]) {
      setHasAccess(true)
    }

    // Fetch form from API
    async function fetchForm() {
      try {
        const response = await fetch(`/api/forms/${id}`)
        if (response.ok) {
          const data = await response.json()
          setForm(data)
          
          // If form is public, grant access automatically
          if (data.type === "public") {
            setHasAccess(true)
          } else if (formAccess[id]) {
            // Private form but user already has access
            setHasAccess(true)
          }
        } else {
          console.error("Failed to fetch form")
        }
      } catch (error) {
        console.error("Error fetching form:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForm()
  }, [id])

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTokenError("")
    
    if (!accessToken.trim()) {
      setTokenError("Please enter your access token")
      return
    }

    setIsValidatingToken(true)

    try {
      const formId = form?._id || form?.id || id
      const response = await fetch("/api/forms/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          uid: accessToken.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Invalid access token")
      }

      // Store access in localStorage
      const formAccess = JSON.parse(localStorage.getItem("formAccess") || "{}")
      formAccess[formId] = true
      localStorage.setItem("formAccess", JSON.stringify(formAccess))

      setHasAccess(true)
      setAccessToken("")
    } catch (error) {
      console.error("Error validating token:", error)
      setTokenError(error instanceof Error ? error.message : "Failed to validate access token")
    } finally {
      setIsValidatingToken(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading form...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Already Submitted</h2>
            <p className="text-muted-foreground mb-6">
              You have already submitted feedback for this form. Thank you for your participation!
            </p>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Feedback form not found</p>
            <Link href="/" className="block mt-4">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access token input for private forms without access
  if (form.type === "private" && !hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{form.title}</CardTitle>
                <CardDescription>This is a private form</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  value={accessToken}
                  onChange={(e) => {
                    setAccessToken(e.target.value)
                    setTokenError("")
                  }}
                  placeholder="Enter your access token"
                  className={tokenError ? "border-destructive" : ""}
                  disabled={isValidatingToken}
                />
                {tokenError && <p className="text-sm text-destructive">{tokenError}</p>}
                <p className="text-xs text-muted-foreground">
                  Enter the access token you received via email to access this form.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isValidatingToken}>
                {isValidatingToken ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Access Form"
                )}
              </Button>
            </form>
            <Link href="/" className="block mt-4">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all questions are answered
    const newErrors: Record<string, boolean> = {}
    let hasErrors = false

    form.questions.forEach((question) => {
      if (!answers[question.id] || answers[question.id].trim() === "") {
        newErrors[question.id] = true
        hasErrors = true
      }
    })

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const formId = form._id || form.id || id
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          answers,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit response")
      }

      // Mark form as submitted in localStorage
      const submittedForms = JSON.parse(localStorage.getItem("submittedForms") || "[]")
      if (!submittedForms.includes(formId)) {
        submittedForms.push(formId)
        localStorage.setItem("submittedForms", JSON.stringify(submittedForms))
      }

      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting response:", error)
      alert(error instanceof Error ? error.message : "Failed to submit response. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your anonymous feedback has been submitted successfully. Your input helps us improve the course.
            </p>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{form.title}</h1>
          <p className="mt-1 text-muted-foreground">{form.description}</p>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Feedback Form</CardTitle>
            <CardDescription>
              This feedback is completely anonymous. Please answer all questions honestly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {form.questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-medium">
                    {index + 1}. {question.question}
                    <span className="text-destructive ml-1">*</span>
                  </Label>

                  {question.type === "mcq" && question.options ? (
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => {
                        setAnswers({ ...answers, [question.id]: value })
                        setErrors({ ...errors, [question.id]: false })
                      }}
                    >
                      {question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Textarea
                      value={answers[question.id] || ""}
                      onChange={(e) => {
                        setAnswers({ ...answers, [question.id]: e.target.value })
                        setErrors({ ...errors, [question.id]: false })
                      }}
                      placeholder="Type your answer here..."
                      className="min-h-24"
                    />
                  )}

                  {errors[question.id] && <p className="text-sm text-destructive">This question is required</p>}
                </div>
              ))}

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
