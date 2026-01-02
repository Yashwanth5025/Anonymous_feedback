"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, FileText, Loader2, Lock } from "lucide-react"

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

export default function HomePage() {
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchForms() {
      try {
        // Fetch all forms (both public and private)
        const response = await fetch("/api/forms")
        if (response.ok) {
          const data = await response.json()
          setForms(data)
        }
      } catch (error) {
        console.error("Error fetching forms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForms()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Anonymous Feedback</h1>
            <p className="mt-1 text-sm text-muted-foreground">Share your honest thoughts and help us improve</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Available Courses</h2>
          <p className="text-muted-foreground">Select a course to provide feedback</p>
        </div>

        {isLoading ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
              <p className="text-lg text-muted-foreground text-center">Loading forms...</p>
            </CardContent>
          </Card>
        ) : forms.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">No feedback forms available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => {
              const formId = form._id || form.id || ""
              return (
                <Link key={formId} href={`/feedback/${formId}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight">{form.title}</CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">{form.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{form.questions.length} questions</span>
                        </div>
                        {form.type === "private" && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            <span>Private</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
