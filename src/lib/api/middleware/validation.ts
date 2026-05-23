import type { z } from "zod";
import { ValidationError } from "./errors";

export async function validateBody<TSchema extends z.ZodType>(
  body: unknown,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const result = await schema.safeParseAsync(body);

  if (!result.success) {
    throw new ValidationError("Validation Error", result.error.flatten());
  }

  return result.data;
}
