import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data?.user) {
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  return <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-50 to-cyan-50 p-6 md:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Sign In</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-left block">
                  Email
                </Label>
                <div className="relative">
                  <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md bg-white" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-left block">
                  Password
                </Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md bg-white pr-10" required />
                  <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked as boolean)} />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </a>
              </div>
              
              <Button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-md transition-all duration-200 font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Log In"}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button type="button" onClick={handleSignUp} className="text-blue-600 hover:text-blue-800 font-medium">
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex md:flex-1 bg-gradient-to-r from-blue-50 to-cyan-50 items-center justify-center p-10">
        <div className="max-w-lg">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-200 rounded-full opacity-50"></div>
            <div className="relative z-10 bg-white rounded-xl shadow-lg p-8 overflow-hidden">
              <div className="flex flex-col items-center space-y-6">
                <img 
                  src="/public/lovable-uploads/8cdd7fd3-3b66-4bea-b8e3-a55c48362786.png" 
                  alt="Medryx" 
                  className="max-w-[250px] mb-4 object-contain"
                />
                <h2 className="text-2xl font-bold text-gray-800 text-center">Welcome to Medryx</h2>
                <p className="text-gray-600 text-center mb-6">
                  Your comprehensive healthcare management system, designed to streamline your practice and improve patient care.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Efficient Management</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">HIPAA Compliant</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default Index;
