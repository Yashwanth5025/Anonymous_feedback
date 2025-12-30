"use client"

import type React from "react"

import { use } from "react"
import { useStore } from "@/lib/store"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function FeedbackFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const form = useStore((state) => state.getFormById(id))
  const addResponse = useStore((state) => state.addResponse)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all questions are answered
    const newErrors: Record<string, boolean> = {}
    let hasErrors = false

    form.questions.forEach((question) => {
      if (!answers[question.id]) {
        newErrors[question.id] = true
        hasErrors = true
      }
    })

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    // Submit the response
    addResponse({
      formId: form.id,
      answers,
    })

    setSubmitted(true)
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
                <Button type="submit" size="lg" className="w-full">
                  Submit Feedback
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
