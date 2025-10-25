import {z} from 'zod';

export const createMotherSchema = z.object({
  email: z.email(),
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().regex(/^\+\d{10,15}$/, 'Phone number must start with + followed by country code and number'),
  location: z.string().min(1, 'Location is required'),
  date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
})

export const createHealthMonitoringSchema = z.object({
  heart_rate: z.number().min(30).max(200),
  blood_pressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Blood pressure must be in the format "systolic/diastolic"'),
  o2_saturation: z.number().min(70).max(100),
  stress_level: z.number().min(1).max(10),
})

export type CreateHealthMonitoringInput = z.infer<typeof createHealthMonitoringSchema>;
export type CreateMotherInput = z.infer<typeof createMotherSchema>;