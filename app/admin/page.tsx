"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, FileText, Users, BarChart3, Loader2, ChevronRight, ChevronDown } from "lucide-react"

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

interface Response {
  _id: string
  id?: string
  formId: string
  answers: Record<string, string>
  submittedAt: string
}

export default function AdminPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [expandedTextQuestions, setExpandedTextQuestions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all forms
        const formsResponse = await fetch("/api/forms")
        if (formsResponse.ok) {
          const formsData = await formsResponse.json()
          setForms(formsData)
        }

        // Fetch all responses
        const responsesResponse = await fetch("/api/responses")
        if (responsesResponse.ok) {
          const responsesData = await responsesResponse.json()
          setResponses(responsesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getResponsesByFormId = (formId: string) => {
    return responses.filter((response) => {
      return response.formId === formId
    })
  }

  const getSelectedForm = () => {
    if (!selectedFormId) return null
    return forms.find((form) => (form._id || form.id) === selectedFormId)
  }

  const calculateMCQStats = (questionId: string, questionOptions: string[]) => {
    const formResponses = getResponsesByFormId(selectedFormId || "")
    const totalResponses = formResponses.length
    if (totalResponses === 0) return {}

    const optionCounts: Record<string, number> = {}
    questionOptions.forEach((option) => {
      optionCounts[option] = 0
    })

    formResponses.forEach((response) => {
      const answer = response.answers[questionId]
      if (answer && optionCounts.hasOwnProperty(answer)) {
        optionCounts[answer]++
      }
    })

    const percentages: Record<string, number> = {}
    questionOptions.forEach((option) => {
      percentages[option] = totalResponses > 0 ? (optionCounts[option] / totalResponses) * 100 : 0
    })

    return percentages
  }

  const getTextResponses = (questionId: string) => {
    const formResponses = getResponsesByFormId(selectedFormId || "")
    return formResponses
      .map((response) => response.answers[questionId])
      .filter((answer) => answer && answer.trim() !== "")
  }

  const toggleTextExpansion = (questionId: string) => {
    setExpandedTextQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Manage feedback forms and view responses</p>
            </div>
            <Link href="/admin/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading admin data...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{forms.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{responses.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Responses per Form</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {forms.length > 0 ? (responses.length / forms.length).toFixed(1) : "0"}
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Forms</CardTitle>
            <CardDescription>Click on a form to view responses</CardDescription>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No forms created yet</p>
                <Link href="/admin/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Form
                  </Button>
                </Link>
              </div>
            ) : selectedFormId === null ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {forms.map((form) => {
                  const formId = form._id || form.id || ""
                  const formResponses = getResponsesByFormId(formId)
                  return (
                    <button
                      key={formId}
                      onClick={() => setSelectedFormId(formId)}
                      className="w-full text-left"
                    >
                      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                              <FileText className="h-5 w-5 text-primary" />
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
                              <Users className="h-4 w-4" />
                              <span>
                                {formResponses.length} response{formResponses.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Back button */}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFormId(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forms
                </Button>

                {/* Form details */}
                {(() => {
                  const selectedForm = getSelectedForm()
                  if (!selectedForm) return null

                  const formResponses = getResponsesByFormId(selectedFormId)
                  
                  return (
                    <>
                      <div className="border-l-4 border-primary pl-4">
                        <h3 className="font-semibold text-lg">{selectedForm.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedForm.description}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {formResponses.length} response{formResponses.length !== 1 ? "s" : ""} received
                        </p>
                      </div>

                      {formResponses.length === 0 ? (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No responses yet</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-6">
                          {selectedForm.questions.map((question) => (
                            <Card key={question.id}>
                              <CardHeader>
                                <CardTitle className="text-base">{question.question}</CardTitle>
                                <CardDescription>
                                  {question.type === "mcq" ? "Multiple Choice Question" : "Text Response"}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {question.type === "mcq" && question.options ? (
                                  <div className="space-y-3">
                                    {question.options.map((option) => {
                                      const percentages = calculateMCQStats(question.id, question.options || [])
                                      const percentage = percentages[option] || 0
                                      const formResponses = getResponsesByFormId(selectedFormId)
                                      const count = formResponses.filter(
                                        (r) => r.answers[question.id] === option
                                      ).length
                                      
                                      return (
                                        <div key={option} className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{option}</span>
                                            <span className="text-sm text-muted-foreground">
                                              {count} ({percentage.toFixed(1)}%)
                                            </span>
                                          </div>
                                          <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                              className="bg-primary h-2 rounded-full transition-all"
                                              style={{ width: `${percentage}%` }}
                                            />
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {(() => {
                                      const textResponses = getTextResponses(question.id)
                                      const isExpanded = expandedTextQuestions[question.id] || false
                                      const displayResponses = isExpanded ? textResponses : textResponses.slice(0, 5)
                                      
                                      return (
                                        <>
                                          <ul className="space-y-2 list-disc list-inside">
                                            {displayResponses.map((response, idx) => (
                                              <li key={idx} className="text-sm text-muted-foreground">
                                                {response}
                                              </li>
                                            ))}
                                          </ul>
                                          {textResponses.length > 5 && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => toggleTextExpansion(question.id)}
                                              className="mt-2"
                                            >
                                              {isExpanded ? (
                                                <>
                                                  <ChevronDown className="h-4 w-4 mr-2" />
                                                  Show Less
                                                </>
                                              ) : (
                                                <>
                                                  <ChevronRight className="h-4 w-4 mr-2" />
                                                  Read More ({textResponses.length - 5} more)
                                                </>
                                              )}
                                            </Button>
                                          )}
                                          {textResponses.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No responses yet</p>
                                          )}
                                        </>
                                      )
                                    })()}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </main>
    </div>
  )
}
