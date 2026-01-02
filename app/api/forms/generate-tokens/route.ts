import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import AccessToken from '@/models/AccessToken'
import { generateUID, sendAccessTokenEmail } from '@/lib/email'

// POST generate access tokens for private forms
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { formId, emails, formTitle } = body
    
    if (!formId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'formId and emails array are required' },
        { status: 400 }
      )
    }
    
    const results = []
    const errors = []
    
    // Generate UID for each email and send
    for (const email of emails) {
      try {
        // Generate unique UID (check for uniqueness)
        let uid = generateUID()
        let attempts = 0
        while (await AccessToken.findOne({ uid })) {
          uid = generateUID()
          attempts++
          if (attempts > 10) {
            throw new Error('Failed to generate unique UID')
          }
        }
        
        // Create access token
        const accessToken = new AccessToken({
          formId,
          email: email.trim(),
          uid,
          used: false,
        })
        
        await accessToken.save()
        
        // Send email
        const emailResult = await sendAccessTokenEmail(email.trim(), formTitle, uid, formId)
        
        if (emailResult.success) {
          results.push({ email, uid, sent: true })
        } else {
          // Token was created but email failed - still count as success since token exists
          results.push({ email, uid, sent: false, error: 'Email sending failed' })
          errors.push({ email, error: 'Email sending failed' })
        }
      } catch (error) {
        console.error(`Error processing email ${email}:`, error)
        errors.push({ email, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    return NextResponse.json({
      success: true,
      total: emails.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 200 })
  } catch (error) {
    console.error('Error generating tokens:', error)
    return NextResponse.json(
      { error: 'Failed to generate access tokens' },
      { status: 500 }
    )
  }
}

