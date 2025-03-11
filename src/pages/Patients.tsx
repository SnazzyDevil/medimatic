
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
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Patients</h1>
            <Button className="btn-hover" onClick={handleAddNewPatient}>
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
