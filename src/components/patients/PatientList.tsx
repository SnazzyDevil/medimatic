
import { useState } from "react";
import { 
  Calendar, 
  ChevronDown, 
  Filter, 
  Mail, 
  MoreHorizontal, 
  Phone, 
  Plus, 
  Search, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample patient data
const patients = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 123-4567",
    lastVisit: "10 May 2023",
    nextAppointment: "15 Jun 2023",
    status: "active",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "(555) 234-5678",
    lastVisit: "23 Apr 2023",
    nextAppointment: "Today",
    status: "active",
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "wilson.e@example.com",
    phone: "(555) 345-6789",
    lastVisit: "2 May 2023",
    nextAppointment: "Tomorrow",
    status: "pending",
    avatar: "EW",
  },
  {
    id: 4,
    name: "David Miller",
    email: "david.m@example.com",
    phone: "(555) 456-7890",
    lastVisit: "12 Mar 2023",
    nextAppointment: "28 Jun 2023",
    status: "inactive",
    avatar: "DM",
  },
  {
    id: 5,
    name: "Olivia Davis",
    email: "o.davis@example.com",
    phone: "(555) 567-8901",
    lastVisit: "30 Apr 2023",
    nextAppointment: "20 Jun 2023",
    status: "active",
    avatar: "OD",
  },
];

export function PatientList() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search patients..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="btn-hover">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button size="sm" className="btn-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Next Appointment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id} className="group hover:bg-healthcare-secondary">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-healthcare-primary text-white flex items-center justify-center">
                      {patient.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-healthcare-accent group-hover:text-healthcare-primary transition-colors">
                        {patient.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-healthcare-gray" />
                      <span className="text-healthcare-accent">{patient.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-healthcare-gray" />
                      <span className="text-healthcare-accent">{patient.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-healthcare-gray" />
                    <span>{patient.lastVisit}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-healthcare-gray" />
                    <span 
                      className={
                        patient.nextAppointment === "Today" || patient.nextAppointment === "Tomorrow" 
                          ? "text-healthcare-primary font-medium" 
                          : ""
                      }
                    >
                      {patient.nextAppointment}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      patient.status === "active" 
                        ? "default" 
                        : patient.status === "pending" 
                          ? "outline" 
                          : "secondary"
                    }
                  >
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
