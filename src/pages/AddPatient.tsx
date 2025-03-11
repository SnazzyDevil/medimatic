
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PatientForm } from "@/components/patients/PatientForm";

const AddPatient = () => {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="mb-8">
            <h1 className="font-semibold text-2xl">Add New Patient</h1>
          </div>
          
          <PatientForm />
        </main>
      </div>
    </div>
  );
};

export default AddPatient;
