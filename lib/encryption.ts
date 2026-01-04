import crypto from 'crypto'

// Get encryption key from environment variable
// Generate a key with: openssl rand -base64 32
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // Standard IV length for GCM
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

// Derive a key from the encryption key using PBKDF2
function getKeyFromPassword(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512')
}

/**
 * Encrypts a string (email address) using AES-256-GCM
 * @param text - The text to encrypt
 * @returns Encrypted string in format: salt:iv:tag:encryptedData (all base64)
 */
export function encryptEmail(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  if (!text) {
    return text
  }

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  // Derive key from password
  const key = getKeyFromPassword(ENCRYPTION_KEY, salt)
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  // Encrypt
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  
  // Get auth tag
  const tag = cipher.getAuthTag()
  
  // Return: salt:iv:tag:encryptedData (all base64 encoded)
  return `${salt.toString('base64')}:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`
}

/**
 * Decrypts an encrypted string (email address) using AES-256-GCM
 * @param encryptedText - The encrypted text in format: salt:iv:tag:encryptedData
 * @returns Decrypted string
 */
export function decryptEmail(encryptedText: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  if (!encryptedText) {
    return encryptedText
  }

  // Check if the text is already encrypted (has the format)
  if (!encryptedText.includes(':')) {
    // Legacy: if it's not encrypted, return as is (for backward compatibility)
    return encryptedText
  }

  try {
    // Split the encrypted text
    const parts = encryptedText.split(':')
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted format')
    }

    const [saltBase64, ivBase64, tagBase64, encrypted] = parts
    
    // Decode from base64
    const salt = Buffer.from(saltBase64, 'base64')
    const iv = Buffer.from(ivBase64, 'base64')
    const tag = Buffer.from(tagBase64, 'base64')
    
    // Derive key from password
    const key = getKeyFromPassword(ENCRYPTION_KEY, salt)
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Error decrypting email:', error)
    // If decryption fails, return empty string or throw
    throw new Error('Failed to decrypt email')
  }
}

