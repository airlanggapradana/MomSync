export interface HealthSummaryResponse {
  mother: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    location: string;
    dateOfBirth: Date;
  };
  latestHealthSigns: {
    id: string;
    heartRate: number;
    bloodPressure: string;
    o2Saturation: number;
    stressLevel: number;
    recordedAt: Date;
  } | null;
  recentJournalEntries: Array<{
    id: string;
    mood: string;
    symptoms: string;
    nutritions: any;
    notes: string;
    createdAt: Date;
  }>;
  upcomingAppointments: Array<{
    id: string;
    appointmentDate: Date;
    doctorName: string;
    purpose: string;
    location: string;
  }>;
  recentAppointments: Array<{
    id: string;
    appointmentDate: Date;
    doctorName: string;
    purpose: string;
    location: string;
  }>;
  recentLabResults: Array<{
    id: string;
    testName: string;
    resultValue: string;
    normalRange: string;
    testDate: Date;
  }>;
  summary: {
    totalAppointments: number;
    totalJournalEntries: number;
    totalLabResults: number;
    totalHealthMonitoring: number;
  };
}