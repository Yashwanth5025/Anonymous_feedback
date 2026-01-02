import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Response from '@/models/Response'

// GET responses - optionally filtered by formId
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const formId = searchParams.get('formId')
    
    const query = formId ? { formId } : {}
    const responses = await Response.find(query).sort({ submittedAt: -1 })
    
    return NextResponse.json(responses, { status: 200 })
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    )
  }
}

// POST create a new response
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { formId, answers } = body
    
    if (!formId || !answers) {
      return NextResponse.json(
        { error: 'formId and answers are required' },
        { status: 400 }
      )
    }
    
    const response = new Response({
      formId,
      answers,
    })
    
    await response.save()
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating response:', error)
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    )
  }
}

