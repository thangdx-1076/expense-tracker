/**
 * Shared types for Server Actions
 * 
 * All Server Actions return ActionResult<T>, which is a discriminated union of success or error.
 * This provides type-safe handling on the client side.
 */

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError }

export type ActionError = {
  code: string
  message: string
  fieldErrors?: Record<string, string[]> // zod field-level validation errors
}

/**
 * Helper function to create a success result
 */
export const successResult = <T>(data: T): ActionResult<T> => ({
  success: true,
  data,
})

/**
 * Helper function to create an error result
 */
export const errorResult = (
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> => ({
  success: false,
  error: { code, message, fieldErrors },
})
