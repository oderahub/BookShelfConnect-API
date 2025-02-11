import { z } from 'zod'

export const userSchemas = {
  register: z.object({
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    email: z.string().email(),
    password: z
      .string()
      .min(6)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),

  update: z.object({
    firstName: z.string().min(3).max(50).optional(),
    lastName: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    password: z
      .string()
      .min(6)
      .optional()
      .refine((pwd) => !pwd || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd), {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      })
  })
}

export const bookSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    author: z.string().min(1).max(100),
    isbn: z.string().regex(/^\d{10}|\d{13}$/, 'ISBN must be 10 or 13 digits'),
    description: z.string().min(1).max(2000)
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    author: z.string().min(1).max(100).optional(),
    isbn: z
      .string()
      .regex(/^\d{10}|\d{13}$/)
      .optional(),
    description: z.string().min(1).max(2000).optional()
  }),

  search: z
    .object({
      title: z.string().min(1).optional(),
      author: z.string().min(1).optional(),
      isbn: z
        .string()
        .regex(/^\d{10}|\d{13}$/)
        .optional()
    })
    .refine((data) => Object.values(data).some((val) => val !== undefined), {
      message: 'At least one search criterion must be provided'
    })
}
