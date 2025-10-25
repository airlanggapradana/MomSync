import prisma from '../../prisma/prisma';
import {Request, Response, NextFunction} from "express";
import {HealthSummaryResponse} from "../types/health-summary-response.type";
import {
  CreateHealthMonitoringInput,
  createHealthMonitoringSchema,
  CreateMotherInput,
  createMotherSchema
} from "../zod/zod.validation.schema";

export const getMotherById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {motherId} = req.params;

    // Validasi motherId
    if (!motherId) {
      return res.status(400).json({
        success: false,
        message: 'Mother ID is required'
      });
    }

    // Cek apakah mother exists
    const mother = await prisma.mother.findUnique({
      where: {id: motherId},
      select: {
        id: true,
        full_name: true,
        email: true,
        phone_number: true,
        location: true,
        date_of_birth: true,
      }
    });

    if (!mother) {
      return res.status(404).json({
        success: false,
        message: 'Mother not found'
      });
    }

    // Get latest health signs monitoring
    const latestHealthSigns = await prisma.healthSignsMonitoring.findFirst({
      where: {motherId},
      orderBy: {created_at: 'desc'},
      select: {
        id: true,
        heart_rate: true,
        blood_pressure: true,
        o2_saturation: true,
        stress_level: true,
        created_at: true,
      }
    });

    // Get recent journal entries (last 5)
    const recentJournalEntries = await prisma.journalEntry.findMany({
      where: {motherId},
      orderBy: {created_at: 'desc'},
      take: 5,
      select: {
        id: true,
        mood: true,
        symptoms: true,
        nutritions: true,
        notes: true,
        created_at: true,
      }
    });

    // Get upcoming appointments
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        motherId,
        appointment_date: {
          gte: new Date()
        }
      },
      orderBy: {appointment_date: 'asc'},
      select: {
        id: true,
        appointment_date: true,
        doctor_name: true,
        purpose: true,
        location: true,
      }
    });

    // Get recent appointments (past appointments, last 5)
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        motherId,
        appointment_date: {
          lt: new Date()
        }
      },
      orderBy: {appointment_date: 'desc'},
      take: 5,
      select: {
        id: true,
        appointment_date: true,
        doctor_name: true,
        purpose: true,
        location: true,
      }
    });

    // Get recent lab results (last 5)
    const recentLabResults = await prisma.labResult.findMany({
      where: {motherId},
      orderBy: {test_date: 'desc'},
      take: 5,
      select: {
        id: true,
        test_name: true,
        result_value: true,
        normal_range: true,
        test_date: true,
      }
    });

    // Get summary counts
    const [totalAppointments, totalJournalEntries, totalLabResults, totalHealthMonitoring] =
      await Promise.all([
        prisma.appointment.count({where: {motherId}}),
        prisma.journalEntry.count({where: {motherId}}),
        prisma.labResult.count({where: {motherId}}),
        prisma.healthSignsMonitoring.count({where: {motherId}})
      ]);

    // Build response
    const healthSummary: HealthSummaryResponse = {
      mother: {
        id: mother.id,
        fullName: mother.full_name,
        email: mother.email,
        phoneNumber: mother.phone_number,
        location: mother.location,
        dateOfBirth: mother.date_of_birth,
      },
      latestHealthSigns: latestHealthSigns ? {
        id: latestHealthSigns.id,
        heartRate: latestHealthSigns.heart_rate,
        bloodPressure: latestHealthSigns.blood_pressure,
        o2Saturation: latestHealthSigns.o2_saturation,
        stressLevel: latestHealthSigns.stress_level,
        recordedAt: latestHealthSigns.created_at,
      } : null,
      recentJournalEntries: recentJournalEntries.map(entry => ({
        id: entry.id,
        mood: entry.mood as string,
        symptoms: entry.symptoms,
        nutritions: entry.nutritions,
        notes: entry.notes,
        createdAt: entry.created_at,
      })),
      upcomingAppointments: upcomingAppointments.map(appointment => ({
        id: appointment.id,
        appointmentDate: appointment.appointment_date,
        doctorName: appointment.doctor_name,
        purpose: appointment.purpose,
        location: appointment.location,
      })),
      recentAppointments: recentAppointments.map(appointment => ({
        id: appointment.id,
        appointmentDate: appointment.appointment_date,
        doctorName: appointment.doctor_name,
        purpose: appointment.purpose,
        location: appointment.location,
      })),
      recentLabResults: recentLabResults.map(result => ({
        id: result.id,
        testName: result.test_name,
        resultValue: result.result_value,
        normalRange: result.normal_range,
        testDate: result.test_date,
      })),
      summary: {
        totalAppointments,
        totalJournalEntries,
        totalLabResults,
        totalHealthMonitoring,
      }
    };

    return res.status(200).json({
      success: true,
      data: healthSummary
    });

  } catch (error) {
    next(error);
  }
}

export const createMother = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      email,
      location,
      phone_number,
      full_name,
      date_of_birth
    }: CreateMotherInput = createMotherSchema.parse(req.body);

    const isExistingMother = await prisma.mother.findUnique({
      where: {email}
    })
    if (isExistingMother) {
      return res.status(409).json({
        success: false,
        message: 'Mother with this email already exists'
      })
    }
    const newMother = await prisma.mother.create({
      data: {
        id: `mother_${crypto.randomUUID().slice(0, 8)}`,
        email,
        location,
        phone_number,
        full_name,
        date_of_birth: new Date(date_of_birth)
      }
    })
    return res.status(201).json({
      success: true,
      data: newMother
    })
  } catch (e) {
    next(e)
  }
}

export const addHealthRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    const {
      heart_rate,
      stress_level,
      o2_saturation,
      blood_pressure
    }: CreateHealthMonitoringInput = createHealthMonitoringSchema.parse(req.body);

    const checkMother = await prisma.mother.findUnique({
      where: {id: String(id)}
    })
    if (!checkMother) {
      return res.status(404).json({
        success: false,
        message: 'Mother not found'
      })
    }
    const newHealthMonitoring = await prisma.healthSignsMonitoring.create({
      data: {
        motherId: String(id),
        heart_rate,
        stress_level,
        o2_saturation,
        blood_pressure
      }
    })
    return res.status(201).json({
      success: true,
      data: newHealthMonitoring
    })
  } catch (e) {
    next(e);
  }
}