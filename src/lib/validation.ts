import { z } from "zod";

// Egyptian phone (11 digits starting with 01) or international (+xx...)
const phoneRegex = /^(\+?\d{8,15}|01\d{9})$/;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "الاسم طويل جداً (حد أقصى 100 حرف)" }),
  email: z
    .string()
    .trim()
    .email({ message: "بريد إلكتروني غير صالح" })
    .max(255)
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: "رقم جوال غير صالح" })
    .optional()
    .or(z.literal("")),
  activity: z.string().trim().max(100).optional().or(z.literal("")),
  mall: z.string().trim().max(100).optional().or(z.literal("")),
  area: z.string().trim().max(20).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(2000, { message: "الرسالة طويلة جداً (حد أقصى 2000 حرف)" })
    .optional()
    .or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, { message: "اسم العميل يجب أن يكون حرفين على الأقل" })
    .max(100),
  shopName: z
    .string()
    .trim()
    .min(2, { message: "اسم المحل مطلوب" })
    .max(100),
  activity: z.string().trim().max(100).optional().or(z.literal("")),
  mall: z.string().trim().max(100).optional().or(z.literal("")),
  shopNumber: z.string().trim().max(20).optional().or(z.literal("")),
  area: z.string().trim().max(20).optional().or(z.literal("")),
  shopStatus: z.string().trim().max(50).optional().or(z.literal("")),
  services: z.array(z.string().max(100)).max(20),
  budget: z.string().trim().max(50).optional().or(z.literal("")),
  openingDate: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(2000, { message: "الملاحظات طويلة جداً (حد أقصى 2000 حرف)" })
    .optional()
    .or(z.literal("")),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/** Extracts the first error message from a Zod validation result. */
export const firstZodError = (error: z.ZodError): string => {
  const issue = error.issues[0];
  return issue?.message ?? "بيانات غير صالحة";
};
