import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Form from '@/models/Form'

// GET a form by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    
    const form = await Form.findById(id)
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(form, { status: 200 })
  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    )
  }
}

