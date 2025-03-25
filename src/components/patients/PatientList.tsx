
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  ChevronDown, 
  Filter, 
  Mail, 
  MoreHorizontal, 
  Phone, 
  Plus, 
  Search, 
  User,
  X 
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function PatientList({ onPatientSelect }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showActiveFilters, setShowActiveFilters] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      if (error) {
        throw error;
      }

      // Transform the data to match our UI needs
      const transformedPatients = data.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        email: patient.email || 'N/A',
        phone: patient.contact_number,
        lastVisit: 'N/A', // Could fetch from visits table in a future enhancement
        nextAppointment: 'N/A', // Could fetch from appointments table in a future enhancement
        status: 'active', // Default status, could be part of patient record in future
        avatar: `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`,
      }));
      
      setPatients(transformedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setShowActiveFilters(status !== "all");
    setFilterDialogOpen(false);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setShowActiveFilters(false);
  };

  const filteredPatients = patients.filter(patient => {
    // Status filter
    if (statusFilter !== "all" && patient.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
      patient.phone.includes(searchQuery)
    );
  });

  if (isLoading) {
    return <div className="py-8 text-center">Loading patients...</div>;
  }

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
          <Button 
            variant="outline" 
            size="sm" 
            className="btn-hover"
            onClick={() => setFilterDialogOpen(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button 
            size="sm" 
            className="btn-hover"
            onClick={handleAddPatient}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {showActiveFilters && (
        <div className="border rounded-lg p-4 mb-2 bg-slate-50 flex flex-wrap gap-2 items-center">
          <p className="text-sm text-muted-foreground mr-2">Active filters:</p>
          {statusFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1 bg-white">
              Status: {statusFilter}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0" 
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs ml-auto"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {patients.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No patients found</p>
          <Button onClick={handleAddPatient}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Patient
          </Button>
        </div>
      ) : (
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
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No patients match your search or filter criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow 
                    key={patient.id} 
                    className="group hover:bg-healthcare-secondary cursor-pointer"
                    onClick={() => onPatientSelect(patient.id)}
                  >
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onPatientSelect(patient.id)}>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Patients</DialogTitle>
            <DialogDescription>
              Filter patients by status
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button onClick={clearFilters}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
