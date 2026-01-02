"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Question } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CreateFormPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [formType, setFormType] = useState<"public" | "private">("public")
  const [emails, setEmails] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
    },
  ])
  const [errors, setErrors] = useState<{ title?: boolean; description?: boolean; emails?: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addQuestion = (type: "mcq" | "text") => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: "",
      options: type === "mcq" ? ["", "", "", ""] : undefined,
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: string, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return { ...q, [field]: value }
        }
        return q
      }),
    )
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, ""] }
        }
        return q
      }),
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 2) {
          return { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        }
        return q
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const newErrors: { title?: boolean; description?: boolean; emails?: boolean } = {}
    if (!title.trim()) newErrors.title = true
    if (!description.trim()) newErrors.description = true
    
    // Validate emails for private forms
    if (formType === "private") {
      if (!emails.trim()) {
        newErrors.emails = true
      } else {
        // Basic email validation (comma-separated)
        const emailList = emails.split(",").map((e) => e.trim()).filter((e) => e)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const invalidEmails = emailList.filter((email) => !emailRegex.test(email))
        if (invalidEmails.length > 0 || emailList.length === 0) {
          newErrors.emails = true
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Filter out empty questions and options
    const validQuestions = questions
      .filter((q) => q.question.trim())
      .map((q) => ({
        ...q,
        options: q.options?.filter((opt) => opt.trim()).length ? q.options.filter((opt) => opt.trim()) : undefined,
      }))
      .filter((q) => (q.type === "mcq" ? q.options && q.options.length >= 2 : true))

    if (validQuestions.length === 0) {
      alert("Please add at least one valid question")
      return
    }

    setIsSubmitting(true)

    try {
      // First, create the form
      const formResponse = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          questions: validQuestions,
          type: formType,
        }),
      })

      if (!formResponse.ok) {
        const error = await formResponse.json()
        throw new Error(error.error || "Failed to create form")
      }

      const formData = await formResponse.json()
      const formId = formData._id || formData.id

      // If private form, generate UIDs and send emails
      if (formType === "private" && emails.trim()) {
        const emailList = emails.split(",").map((e) => e.trim()).filter((e) => e)
        
        const tokenResponse = await fetch("/api/forms/generate-tokens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formId,
            emails: emailList,
            formTitle: title,
          }),
        })

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json()
          throw new Error(error.error || "Failed to generate and send access tokens")
        }
      }

      router.push("/admin")
    } catch (error) {
      console.error("Error creating form:", error)
      alert(error instanceof Error ? error.message : "Failed to create form. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create Feedback Form</h1>
          <p className="mt-1 text-muted-foreground">Build a new form to collect anonymous feedback</p>
        </div>
      </header>

      {/* Form Builder */}
      <main className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
              <CardDescription>Basic information about the feedback form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Course Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    setErrors({ ...errors, title: false })
                  }}
                  placeholder="e.g., Introduction to Computer Science"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">Title is required</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setErrors({ ...errors, description: false })
                  }}
                  placeholder="Describe what this feedback form is for..."
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-sm text-destructive">Description is required</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="formType">
                  Form Type <span className="text-destructive">*</span>
                </Label>
                <Select value={formType} onValueChange={(value) => setFormType(value as "public" | "private")}>
                  <SelectTrigger id="formType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can give feedback</SelectItem>
                    <SelectItem value="private">Private - Only specific users can give feedback</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formType === "public"
                    ? "Public forms are visible to everyone"
                    : "Private forms require email addresses to send access tokens"}
                </p>
              </div>

              {formType === "private" && (
                <div className="space-y-2">
                  <Label htmlFor="emails">
                    Gmail Addresses <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="emails"
                    value={emails}
                    onChange={(e) => {
                      setEmails(e.target.value)
                      setErrors({ ...errors, emails: false })
                    }}
                    placeholder="user1@gmail.com, user2@gmail.com, user3@gmail.com"
                    className={errors.emails ? "border-destructive" : ""}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter Gmail addresses separated by commas. Each user will receive a unique access token via email.
                  </p>
                  {errors.emails && (
                    <p className="text-sm text-destructive">
                      Please enter valid Gmail addresses separated by commas
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Questions</h2>
                <p className="text-sm text-muted-foreground">Add questions to your feedback form</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("mcq")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add MCQ
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("text")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </div>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Question {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          disabled={questions.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => {
                            const newQuestions = questions.map((q) => {
                              if (q.id === question.id) {
                                return {
                                  ...q,
                                  type: value as "mcq" | "text",
                                  options: value === "mcq" ? ["", "", "", ""] : undefined,
                                }
                              }
                              return q
                            })
                            setQuestions(newQuestions)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="text">Text Response</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                          placeholder="Enter your question..."
                        />
                      </div>

                      {question.type === "mcq" && question.options && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              {question.options && question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Form"
              )}
            </Button>
            <Link href="/admin" className="flex-1">
              <Button type="button" variant="outline" size="lg" className="w-full bg-transparent" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
