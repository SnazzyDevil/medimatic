
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PatientForm } from "@/components/patients/PatientForm";

const AddPatient = () => {
  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
            <h1 className="font-bold text-3xl mb-2">Add New Patient</h1>
            <p className="text-violet-100">Enter patient details to create a new record</p>
          </div>
          
          <div className="animate-fade-in">
            <PatientForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddPatient;
