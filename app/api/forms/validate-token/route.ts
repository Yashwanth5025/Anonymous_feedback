import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import AccessToken from '@/models/AccessToken'

// POST validate access token
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { formId, uid } = body
    
    if (!formId || !uid) {
      return NextResponse.json(
        { error: 'formId and uid are required' },
        { status: 400 }
      )
    }
    
    // Find the access token
    const accessToken = await AccessToken.findOne({ formId, uid })
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 404 }
      )
    }
    
    if (accessToken.used) {
      return NextResponse.json(
        { error: 'This access token has already been used' },
        { status: 403 }
      )
    }
    
    // Mark as used
    accessToken.used = true
    accessToken.usedAt = new Date()
    await accessToken.save()
    
    return NextResponse.json({
      success: true,
      message: 'Access granted',
    }, { status: 200 })
  } catch (error) {
    console.error('Error validating token:', error)
    return NextResponse.json(
      { error: 'Failed to validate access token' },
      { status: 500 }
    )
  }
}

