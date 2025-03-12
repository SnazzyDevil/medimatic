import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { AddMedicationDialog } from "@/components/patients/AddMedicationDialog";
import { AddVisitDialog } from "@/components/patients/AddVisitDialog";
import { ScheduleAppointmentDialog } from "@/components/patients/ScheduleAppointmentDialog";

const patientData = {
  id: 1,
  name: "Sarah Johnson",
  age: 42,
  dob: "1981-08-15",
  gender: "Female",
  address: "123 Main St, Anytown, CA 94568",
  phone: "(555) 123-4567",
  email: "sarah.j@example.com",
  bloodType: "A+",
  allergies: ["Penicillin", "Peanuts"],
  conditions: ["Hypertension", "Type 2 Diabetes"],
  medications: [
    { 
      name: "Lisinopril", 
      dosage: "10mg", 
      frequency: "Once daily", 
      startDate: "2022-05-10",
      endDate: "",
      status: "active",
      prescribedBy: "Dr. Michael Chen" 
    },
    { 
      name: "Metformin", 
      dosage: "500mg", 
      frequency: "Twice daily", 
      startDate: "2022-03-15",
      endDate: "",
      status: "active",
      prescribedBy: "Dr. Michael Chen" 
    },
    { 
      name: "Atorvastatin", 
      dosage: "20mg", 
      frequency: "Once daily at bedtime", 
      startDate: "2021-11-22",
      endDate: "2022-10-15",
      status: "discontinued",
      prescribedBy: "Dr. Emma Wilson" 
    }
  ],
  visits: [
    {
      date: "2023-06-15",
      type: "Regular Check-up",
      doctor: "Dr. Michael Chen",
      notes: "Patient's blood pressure is under control. Continue current medication regimen.",
      vitals: {
        bp: "128/82",
        hr: "72",
        temp: "98.6°F",
        weight: "165 lbs"
      }
    },
    {
      date: "2023-03-05",
      type: "Follow-up",
      doctor: "Dr. Emma Wilson",
      notes: "Diabetes management improving. Adjusted Metformin dosage.",
      vitals: {
        bp: "135/85",
        hr: "76",
        temp: "98.4°F",
        weight: "168 lbs"
      }
    },
    {
      date: "2022-12-10",
      type: "Urgent Care",
      doctor: "Dr. David Miller",
      notes: "Patient presented with acute bronchitis. Prescribed antibiotics and cough suppressant.",
      vitals: {
        bp: "142/88",
        hr: "88",
        temp: "100.2°F",
        weight: "170 lbs"
      }
    }
  ],
  upcomingAppointments: [
    {
      date: "2023-09-20",
      time: "10:30 AM",
      type: "Regular Check-up",
      doctor: "Dr. Michael Chen",
      notes: "3-month follow-up for hypertension and diabetes management."
    }
  ]
};

const PatientDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [medications, setMedications] = useState(patientData.medications);
  const [visits, setVisits] = useState(patientData.visits);
  const [appointments, setAppointments] = useState(patientData.upcomingAppointments);
  
  const [isAddMedicationDialogOpen, setIsAddMedicationDialogOpen] = useState(false);
  const [isAddVisitDialogOpen, setIsAddVisitDialogOpen] = useState(false);
  const [isScheduleAppointmentDialogOpen, setIsScheduleAppointmentDialogOpen] = useState(false);

  const handleAddMedication = (newMedication: any) => {
    const medicationToAdd = {
      ...newMedication,
      endDate: "",
      status: newMedication.status || "active",
    };
    
    setMedications([medicationToAdd, ...medications]);
  };

  const handleAddVisit = (newVisit: any) => {
    setVisits([newVisit, ...visits]);
  };

  const handleScheduleAppointment = (newAppointment: any) => {
    setAppointments([newAppointment, ...appointments]);
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
                      {patientData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{patientData.name}</h2>
                      <p className="text-healthcare-gray">{patientData.gender}, {patientData.age} years</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-healthcare-gray">Date of Birth</p>
                      <p className="font-medium">{patientData.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-healthcare-gray">Contact</p>
                      <p className="font-medium">{patientData.phone}</p>
                      <p className="font-medium">{patientData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-healthcare-gray">Address</p>
                      <p className="font-medium">{patientData.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-healthcare-gray">Blood Type</p>
                      <p className="font-medium">{patientData.bloodType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-healthcare-gray">Allergies</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientData.allergies.map((allergy, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50 border-red-200 text-red-700">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-healthcare-gray">Medical Conditions</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientData.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
                          <Badge className="bg-blue-500">{patientData.medications.filter(m => m.status === 'active').length}</Badge>
                        </div>
                        <ul className="space-y-2">
                          {patientData.medications
                            .filter(med => med.status === 'active')
                            .map((med, index) => (
                              <li key={index} className="text-sm flex justify-between">
                                <span>{med.name} ({med.dosage})</span>
                                <span className="text-healthcare-gray">{med.frequency}</span>
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border border-healthcare-gray-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-healthcare-primary" />
                            Upcoming Appointments
                          </h3>
                          <Badge className="bg-green-500">{patientData.upcomingAppointments.length}</Badge>
                        </div>
                        <ul className="space-y-2">
                          {patientData.upcomingAppointments.map((appt, index) => (
                            <li key={index} className="text-sm">
                              <div className="flex justify-between">
                                <span>{appt.date}</span>
                                <span>{appt.time}</span>
                              </div>
                              <div className="text-healthcare-gray">{appt.type} with {appt.doctor}</div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="border border-healthcare-gray-light">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium flex items-center">
                          <HistoryIcon className="h-4 w-4 mr-2 text-healthcare-primary" />
                          Recent Visit
                        </h3>
                        <span className="text-sm text-healthcare-gray">{patientData.visits[0].date}</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                          <div className="text-sm text-healthcare-gray">BP</div>
                          <div className="font-medium">{patientData.visits[0].vitals.bp}</div>
                        </div>
                        <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                          <div className="text-sm text-healthcare-gray">HR</div>
                          <div className="font-medium">{patientData.visits[0].vitals.hr} bpm</div>
                        </div>
                        <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                          <div className="text-sm text-healthcare-gray">Temp</div>
                          <div className="font-medium">{patientData.visits[0].vitals.temp}</div>
                        </div>
                        <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                          <div className="text-sm text-healthcare-gray">Weight</div>
                          <div className="font-medium">{patientData.visits[0].vitals.weight}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Notes:</h4>
                        <p className="text-sm">{patientData.visits[0].notes}</p>
                      </div>
                    </CardContent>
                  </Card>
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
                          {medications.map((med, index) => (
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
                          ))}
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
                      {visits.map((visit, index) => (
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
                              <div className="text-sm font-medium">{visit.vitals.bp}</div>
                            </div>
                            <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                              <div className="text-xs text-healthcare-gray">HR</div>
                              <div className="text-sm font-medium">{visit.vitals.hr} bpm</div>
                            </div>
                            <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                              <div className="text-xs text-healthcare-gray">Temp</div>
                              <div className="text-sm font-medium">{visit.vitals.temp}</div>
                            </div>
                            <div className="p-2 bg-healthcare-secondary rounded-md text-center">
                              <div className="text-xs text-healthcare-gray">Weight</div>
                              <div className="text-sm font-medium">{visit.vitals.weight}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Notes:</h4>
                            <p className="text-sm">{visit.notes}</p>
                          </div>
                        </div>
                      ))}
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
                        {patientData.upcomingAppointments.length > 0 ? (
                          <ul className="space-y-3">
                            {patientData.upcomingAppointments.map((appt, index) => (
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
                        <ul className="space-y-3">
                          {patientData.visits.map((visit, index) => (
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
          />
          
          <AddVisitDialog
            isOpen={isAddVisitDialogOpen}
            onClose={() => setIsAddVisitDialogOpen(false)}
            onAddVisit={handleAddVisit}
          />
          
          <ScheduleAppointmentDialog
            isOpen={isScheduleAppointmentDialogOpen}
            onClose={() => setIsScheduleAppointmentDialogOpen(false)}
            onScheduleAppointment={handleScheduleAppointment}
          />
        </main>
      </div>
    </div>
  );
};

export default PatientDetail;
