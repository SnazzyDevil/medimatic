
// Separate types into their own file for better organization
export interface DatabaseAppointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  doctor?: string | null;
  user_id?: string;
}

export interface DatabasePatient {
  id: string;
  first_name: string;
  last_name: string;
}

export interface FormattedAppointment {
  id: string;
  patient_id: string;
  patientName: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  displayDate?: string;
  avatar?: string;
}
