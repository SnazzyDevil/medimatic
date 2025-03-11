
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PatientList } from "@/components/patients/PatientList";
import { useNavigate } from "react-router-dom";

const Patients = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Patients</h1>
          </div>
          
          <PatientList onPatientSelect={(id) => navigate(`/patients/${id}`)} />
        </main>
      </div>
    </div>
  );
};

export default Patients;
