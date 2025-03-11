
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PatientList } from "@/components/patients/PatientList";

const Patients = () => {
  const navigate = useNavigate();
  
  const handleAddNewPatient = () => {
    navigate("/patients/new");
  };
  
  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
            <h1 className="font-bold text-3xl mb-2">Patients Management</h1>
            <p className="text-violet-100">Manage your patients' records and information</p>
            <Button 
              className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/10" 
              onClick={handleAddNewPatient}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Patient
            </Button>
          </div>
          
          <PatientList onPatientSelect={(id) => navigate(`/patients/${id}`)} />
        </main>
      </div>
    </div>
  );
};

export default Patients;
