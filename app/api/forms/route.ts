import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Form from '@/models/Form'

// GET all forms
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'public' or 'private'
    
    const query = type ? { type } : {}
    const forms = await Form.find(query).sort({ createdAt: -1 })
    
    return NextResponse.json(forms, { status: 200 })
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    )
  }
}

// POST create a new form
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { title, description, questions, type = 'public' } = body
    
    if (!title || !description || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title, description, and at least one question are required' },
        { status: 400 }
      )
    }
    
    const form = new Form({
      title,
      description,
      questions,
      type,
    })
    
    await form.save()
    
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    )
  }
}

