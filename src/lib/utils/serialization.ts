/**
 * Utility functions for serializing data to/from database
 * Handles Prisma Decimal objects and other serialization needs
 */

/**
 * Recursively converts Prisma Decimal objects to regular JavaScript numbers
 * Handles nested objects, arrays, and preserves null/undefined values
 */
export function serializeDecimalObjects(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (typeof obj !== 'object') {
    return obj
  }

  // Handle Prisma Decimal objects
  if (obj && typeof obj === 'object' && 's' in obj && 'e' in obj && 'd' in obj) {
    // Prisma Decimal format: { s: 1, e: 3, d: [3909] }
    return obj.toNumber ? obj.toNumber() : Number(obj)
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDecimalObjects(item))
  }

  // Handle plain objects recursively
  const serialized: Record<string, any> = {}
  for (const key in obj) {
    // Ensure it's an own property to avoid prototype chain issues
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      // Only serialize if it's not a function
      if (typeof value !== 'function') {
        serialized[key] = serializeDecimalObjects(value)
      }
    }
  }
  return serialized
}

/**
 * Safely converts a value to a number, handling null/undefined
 */
export function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

