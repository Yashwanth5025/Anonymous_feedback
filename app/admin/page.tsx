"use client"

import { useStore } from "@/lib/store"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, FileText, Users, BarChart3 } from "lucide-react"

export default function AdminPage() {
  const forms = useStore((state) => state.forms)
  const responses = useStore((state) => state.responses)
  const getResponsesByFormId = useStore((state) => state.getResponsesByFormId)

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
            <CardDescription>View and manage all feedback forms</CardDescription>
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
            ) : (
              <Tabs defaultValue={forms[0]?.id} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                  {forms.map((form) => (
                    <TabsTrigger key={form.id} value={form.id} className="flex-shrink-0">
                      {form.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {forms.map((form) => {
                  const formResponses = getResponsesByFormId(form.id)
                  return (
                    <TabsContent key={form.id} value={form.id} className="space-y-6">
                      <div className="border-l-4 border-primary pl-4">
                        <h3 className="font-semibold text-lg">{form.title}</h3>
                        <p className="text-sm text-muted-foreground">{form.description}</p>
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
                        <div className="space-y-4">
                          {formResponses.map((response, idx) => (
                            <Card key={response.id}>
                              <CardHeader>
                                <CardTitle className="text-base">Response #{idx + 1}</CardTitle>
                                <CardDescription>
                                  Submitted on {new Date(response.submittedAt).toLocaleString()}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {form.questions.map((question) => (
                                  <div key={question.id} className="space-y-2">
                                    <p className="font-medium text-sm">{question.question}</p>
                                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border">
                                      {response.answers[question.id] || "No answer provided"}
                                    </p>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  )
                })}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
