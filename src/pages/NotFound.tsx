
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md px-4 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-healthcare-secondary flex items-center justify-center">
                <FileQuestion className="h-10 w-10 text-healthcare-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-healthcare-gray mb-6">
              Oops! The page you're looking for doesn't exist.
            </p>
            <Button asChild className="btn-hover">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFound;
