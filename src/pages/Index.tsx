
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDoctorSettings } from '@/components/layout/Header';

const Index = () => {
  const navigate = useNavigate();
  const { doctorSettings } = useDoctorSettings();

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-6">
                <img 
                  src={doctorSettings.practiceImage} 
                  alt={doctorSettings.practiceName} 
                  className="h-24 w-24 rounded-full border-4 border-violet-100 mb-2"
                />
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome to {doctorSettings.practiceName}
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Medimatic is your all-in-one medical practice management solution. 
                  Manage patients, appointments, inventory, billing, and more from one intuitive dashboard.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-4">
                  <Button 
                    className="h-24 bg-violet-600 hover:bg-violet-700 flex flex-col items-center justify-center text-lg"
                    onClick={() => navigate('/dashboard')}
                  >
                    <span className="text-xl font-semibold">Dashboard</span>
                    <span className="text-sm text-white/80">Overview & Stats</span>
                  </Button>
                  <Button 
                    className="h-24 bg-indigo-600 hover:bg-indigo-700 flex flex-col items-center justify-center text-lg"
                    onClick={() => navigate('/patients')}
                  >
                    <span className="text-xl font-semibold">Patients</span>
                    <span className="text-sm text-white/80">Manage Records</span>
                  </Button>
                  <Button 
                    className="h-24 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center text-lg"
                    onClick={() => navigate('/scheduler')}
                  >
                    <span className="text-xl font-semibold">Schedule</span>
                    <span className="text-sm text-white/80">Appointments</span>
                  </Button>
                </div>
                <div className="mt-6 text-sm text-gray-500">
                  <p>Need help? Contact support at {doctorSettings.email}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
