import { NextResponse } from 'next/server';
import { z } from 'zod';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * Validates request data against a Zod schema.
 * If validation succeeds, returns `{ success: true, data }`.
 * If validation fails, returns `{ success: false, response: NextResponse }` with HTTP 400 status.
 */
export async function validatePayload<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  const result = await schema.safeParseAsync(data);
  if (!result.success) {
    const formattedErrors = result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid request payload',
          details: formattedErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Basic HTML/Script tag sanitizer for text inputs.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:[^\s"]+/gi, '');
}
