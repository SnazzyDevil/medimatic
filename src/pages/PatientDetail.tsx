
import { useState, useEffect } from "react";
import { 
  AlertCircle,
  Calendar, 
  FileText, 
  Heart, 
  HistoryIcon, 
  Pill, 
  Plus, 
  User, 
  Users,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { AddMedicationDialog } from "@/components/patients/AddMedicationDialog";
import { AddVisitDialog } from "@/components/patients/AddVisitDialog";
import { ScheduleAppointmentDialog } from "@/components/patients/ScheduleAppointmentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SecureDataService } from "@/services/secureDataService";

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id: patientId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [medications, setMedications] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isAddMedicationDialogOpen, setIsAddMedicationDialogOpen] = useState(false);
  const [isAddVisitDialogOpen, setIsAddVisitDialogOpen] = useState(false);
  const [isScheduleAppointmentDialogOpen, setIsScheduleAppointmentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        // Fetch the patient's basic information
        const { data: patientInfo, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (patientError) throw patientError;
        if (!patientInfo) throw new Error('Patient not found');
        
        // Process allergies from text to array if it exists
        const allergiesArray = patientInfo.allergies 
          ? patientInfo.allergies.split(',').map((item: string) => item.trim()) 
          : [];

        // Create formatted patient object
        const formattedPatient = {
          id: patientInfo.id,
          name: `${patientInfo.first_name} ${patientInfo.last_name}`,
          email: patientInfo.email || '',
          phone: patientInfo.contact_number || '',
          address: patientInfo.address || '',
          dob: '', // Will fetch from additional data if available
          gender: '', // Will fetch from additional data if available
          age: 0, // Will calculate if DOB is available
          bloodType: '', // Will fetch from additional data if available
          allergies: allergiesArray,
          conditions: [], // Will fetch from additional data if available
        };
        
        setPatientData(formattedPatient);
        
        // Fetch medications
        const { data: medicationData, error: medicationError } = await supabase
          .from('medications')
          .select('*')
          .eq('patient_id', patientId);

        if (medicationError) throw medicationError;
        
        if (medicationData && medicationData.length > 0) {
          const formattedMedications = medicationData.map(med => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            startDate: med.start_date,
            endDate: med.end_date || "",
            status: med.status,
            prescribedBy: med.prescribed_by,
          }));
          setMedications(formattedMedications);
        }

        // Fetch appointments
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId);

        if (appointmentError) throw appointmentError;
        
        if (appointmentData && appointmentData.length > 0) {
          const formattedAppointments = appointmentData.map(appt => ({
            date: appt.appointment_date,
            time: appt.appointment_time,
            type: appt.appointment_type,
            doctor: appt.doctor || "",
            notes: "",
          }));
          setAppointments(formattedAppointments);
        }

        // Fetch visits with vitals
        const { data: visitData, error: visitError } = await supabase
          .from('visits')
          .select('*, visit_vitals(*)')
          .eq('patient_id', patientId);

        if (visitError) throw visitError;
        
        if (visitData && visitData.length > 0) {
          const formattedVisits = visitData.map(visit => {
            const vitals = visit.visit_vitals && visit.visit_vitals[0] ? {
              bp: visit.visit_vitals[0].bp || "",
              hr: visit.visit_vitals[0].hr || "",
              temp: visit.visit_vitals[0].temp || "",
              weight: visit.visit_vitals[0].weight || ""
            } : {
              bp: "",
              hr: "",
              temp: "",
              weight: ""
            };
            
            return {
              date: visit.date,
              type: visit.type,
              doctor: visit.doctor,
              notes: visit.notes || "",
              vitals
            };
          });
          setVisits(formattedVisits);
        }

      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast({
          title: "Error",
          description: "Failed to load patient data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, toast]);

  const handleAddMedication = async (newMedication: any) => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert({
          patient_id: patientId,
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          start_date: newMedication.startDate,
          end_date: newMedication.endDate || null,
          status: newMedication.status || "active",
          prescribed_by: newMedication.prescribedBy,
          notes: newMedication.notes || null,
        });
      
      if (error) throw error;
      
      const medicationToAdd = {
        ...newMedication,
        endDate: newMedication.endDate || "",
        status: newMedication.status || "active",
      };
      
      setMedications([medicationToAdd, ...medications]);
      
      toast({
        title: "Medication added",
        description: `${newMedication.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding medication:", error);
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddVisit = async (newVisit: any) => {
    try {
      const { data: visitData, error: visitError } = await supabase
        .from('visits')
        .insert({
          patient_id: patientId,
          date: newVisit.date,
          type: newVisit.type,
          doctor: newVisit.doctor,
          notes: newVisit.notes || null,
        })
        .select();
      
      if (visitError) throw visitError;
      
      if (visitData && visitData.length > 0) {
        const { error: vitalsError } = await supabase
          .from('visit_vitals')
          .insert({
            visit_id: visitData[0].id,
            bp: newVisit.vitals.bp || null,
            hr: newVisit.vitals.hr || null,
            temp: newVisit.vitals.temp || null,
            weight: newVisit.vitals.weight || null,
          });
        
        if (vitalsError) throw vitalsError;
      }
      
      setVisits([newVisit, ...visits]);
      
      toast({
        title: "Visit added",
        description: `Visit on ${newVisit.date} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding visit:", error);
      toast({
        title: "Error",
        description: "Failed to add visit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleAppointment = async (newAppointment: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          appointment_date: newAppointment.date,
          appointment_time: newAppointment.time,
          appointment_type: newAppointment.type,
          doctor: newAppointment.doctor || null,
        });
      
      if (error) throw error;
      
      setAppointments([newAppointment, ...appointments]);
      
      toast({
        title: "Appointment scheduled",
        description: `Appointment on ${newAppointment.date} at ${newAppointment.time} has been scheduled.`,
      });
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 ml-16">
          <Header />
          <main className="page-container">
            <div className="flex justify-center items-center h-64">
              <p>Loading patient data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 ml-16">
          <Header />
          <main className="page-container">
            <div className="flex justify-center items-center h-64">
              <p>Patient not found.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Get patient initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate("/patients")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Patients
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="md:w-1/3">
              <Card className="border border-healthcare-gray-light">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-healthcare-primary text-white flex items-center justify-center text-xl font-semibold mr-4">
                      {getInitials(patientData.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{patientData.name}</h2>
                      <p className="text-healthcare-gray">{patientData.gender} {patientData.age ? `${patientData.age} years` : ''}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {patientData.dob && (
                      <div>
                        <p className="text-sm text-healthcare-gray">Date of Birth</p>
                        <p className="font-medium">{patientData.dob}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-healthcare-gray">Contact</p>
                      <p className="font-medium">{patientData.phone}</p>
                      <p className="font-medium">{patientData.email}</p>
                    </div>
                    {patientData.address && (
                      <div>
                        <p className="text-sm text-healthcare-gray">Address</p>
                        <p className="font-medium">{patientData.address}</p>
                      </div>
                    )}
                    {patientData.bloodType && (
                      <div>
                        <p className="text-sm text-healthcare-gray">Blood Type</p>
                        <p className="font-medium">{patientData.bloodType}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-healthcare-gray">Allergies</p>
                      {patientData.allergies && patientData.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patientData.allergies.map((allergy: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-red-50 border-red-200 text-red-700">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="font-medium">None recorded</p>
                      )}
                    </div>
                    {patientData.conditions && patientData.conditions.length > 0 && (
                      <div>
                        <p className="text-sm text-healthcare-gray">Medical Conditions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patientData.conditions.map((condition: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:w-2/3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="visits">Visit History</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="border border-healthcare-gray-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium flex items-center">
                            <Pill className="h-4 w-4 mr-2 text-healthcare-primary" />
                            Current Medications
                          </h3>
                          <Badge className="bg-blue-500">
                            {medications.filter(m => m.status === 'active').length}
                          </Badge>
                        </div>
                        {medications.filter(med => med.status === 'active').length > 0 ? (
                          <ul className="space-y-2">
                            {medications
                              .filter(med => med.status === 'active')
                              .map((med, index) => (
                                <li key={index} className="text-sm flex justify-between">
                                  <span>{med.name} ({med.dosage})</span>
                                  <span className="text-healthcare-gray">{med.frequency}</span>
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-healthcare-gray">No active medications</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="border border-healthcare-gray-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-healthcare-primary" />
                            Upcoming Appointments
                          </h3>
                          <Badge className="bg-green-500">{appointments.length}</Badge>
                        </div>
                        {appointments.length > 0 ? (
                          <ul className="space-y-2">
                            {appointments.map((appt, index) => (
                              <li key={index} className="text-sm">
                                <div className="flex justify-between">
                                  <span>{appt.date}</span>
                                  <span>{appt.time}</span>
                                </div>
                                <div className="text-healthcare-gray">
                                  {appt.type} {appt.doctor ? `with ${appt.doctor}` : ''}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-healthcare-gray">No upcoming appointments</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {visits.length > 0 && (
                    <Card className="border border-healthcare-gray-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium flex items-center">
                            <HistoryIcon className="h-4 w-4 mr-2 text-healthcare-primary" />
                            Recent Visit
                          </h3>
                          <span className="text-sm text-healthcare-gray">{visits[0].date}</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                            <div className="text-sm text-healthcare-gray">BP</div>
                            <div className="font-medium">{visits[0].vitals.bp || 'N/A'}</div>
                          </div>
                          <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                            <div className="text-sm text-healthcare-gray">HR</div>
                            <div className="font-medium">{visits[0].vitals.hr ? `${visits[0].vitals.hr} bpm` : 'N/A'}</div>
                          </div>
                          <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                            <div className="text-sm text-healthcare-gray">Temp</div>
                            <div className="font-medium">{visits[0].vitals.temp || 'N/A'}</div>
                          </div>
                          <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                            <div className="text-sm text-healthcare-gray">Weight</div>
                            <div className="font-medium">{visits[0].vitals.weight || 'N/A'}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Notes:</h4>
                          <p className="text-sm">{visits[0].notes || 'No notes recorded'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="medications" className="animate-fade-in">
                  <Card className="border border-healthcare-gray-light">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="font-medium">Medication History</h3>
                        <Button size="sm" onClick={() => setIsAddMedicationDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Medication
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Prescribed By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medications.length > 0 ? (
                            medications.map((med, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{med.name}</TableCell>
                                <TableCell>{med.dosage}</TableCell>
                                <TableCell>{med.frequency}</TableCell>
                                <TableCell>{med.startDate}</TableCell>
                                <TableCell>
                                  <Badge variant={med.status === 'active' ? 'default' : 'outline'}>
                                    {med.status === 'active' ? 'Active' : 'Discontinued'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{med.prescribedBy}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                No medications recorded
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="visits" className="animate-fade-in">
                  <Card className="border border-healthcare-gray-light">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="font-medium">Visit History</h3>
                        <Button size="sm" onClick={() => setIsAddVisitDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Visit
                        </Button>
                      </div>
                      {visits.length > 0 ? (
                        visits.map((visit, index) => (
                          <div key={index} className={`p-4 ${index < visits.length - 1 ? 'border-b' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{visit.type}</h4>
                                <p className="text-sm text-healthcare-gray">{visit.doctor}</p>
                              </div>
                              <span className="text-sm">{visit.date}</span>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 mb-3">
                              <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                                <div className="text-xs text-healthcare-gray">BP</div>
                                <div className="text-sm font-medium">{visit.vitals.bp || 'N/A'}</div>
                              </div>
                              <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                                <div className="text-xs text-healthcare-gray">HR</div>
                                <div className="text-sm font-medium">
                                  {visit.vitals.hr ? `${visit.vitals.hr} bpm` : 'N/A'}
                                </div>
                              </div>
                              <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                                <div className="text-xs text-healthcare-gray">Temp</div>
                                <div className="text-sm font-medium">{visit.vitals.temp || 'N/A'}</div>
                              </div>
                              <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                                <div className="text-xs text-healthcare-gray">Weight</div>
                                <div className="text-sm font-medium">{visit.vitals.weight || 'N/A'}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Notes:</h4>
                              <p className="text-sm">{visit.notes || 'No notes recorded'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-healthcare-gray">
                          No visit history recorded
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appointments" className="animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Appointments</h3>
                    <Button 
                      size="sm"
                      onClick={() => setIsScheduleAppointmentDialogOpen(true)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule Appointment
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-healthcare-gray-light">
                      <CardContent className="p-4">
                        <h4 className="font-medium flex items-center mb-3">
                          <Calendar className="h-4 w-4 mr-2 text-healthcare-primary" />
                          Upcoming Appointments
                        </h4>
                        {appointments.length > 0 ? (
                          <ul className="space-y-3">
                            {appointments.map((appt, index) => (
                              <li key={index} className="p-3 bg-healthcare-secondary rounded-md">
                                <div className="flex justify-between">
                                  <div className="font-medium">{appt.date}</div>
                                  <div>{appt.time}</div>
                                </div>
                                <div className="text-sm">{appt.type}</div>
                                <div className="text-sm text-healthcare-gray">{appt.doctor}</div>
                                <div className="text-xs mt-1">{appt.notes}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-healthcare-gray">No upcoming appointments</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-healthcare-gray-light">
                      <CardContent className="p-4">
                        <h4 className="font-medium flex items-center mb-3">
                          <HistoryIcon className="h-4 w-4 mr-2 text-healthcare-primary" />
                          Past Appointments
                        </h4>
                        {visits.length > 0 ? (
                          <ul className="space-y-3">
                            {visits.map((visit, index) => (
                              <li key={index} className="p-3 bg-healthcare-secondary rounded-md">
                                <div className="flex justify-between">
                                  <div className="font-medium">{visit.date}</div>
                                  <Badge variant="outline">Completed</Badge>
                                </div>
                                <div className="text-sm">{visit.type}</div>
                                <div className="text-sm text-healthcare-gray">{visit.doctor}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-healthcare-gray">No past appointments</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <AddMedicationDialog
            isOpen={isAddMedicationDialogOpen}
            onClose={() => setIsAddMedicationDialogOpen(false)}
            onAddMedication={handleAddMedication}
            patientId={patientId}
          />
          
          <AddVisitDialog
            isOpen={isAddVisitDialogOpen}
            onClose={() => setIsAddVisitDialogOpen(false)}
            onAddVisit={handleAddVisit}
            patientId={patientId}
          />
          
          <ScheduleAppointmentDialog
            isOpen={isScheduleAppointmentDialogOpen}
            onClose={() => setIsScheduleAppointmentDialogOpen(false)}
            onScheduleAppointment={handleScheduleAppointment}
            patientId={patientId}
          />
        </main>
      </div>
    </div>
  );
};

export default PatientDetail;
