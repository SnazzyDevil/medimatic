
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BillingOverview } from "@/components/billing/BillingOverview";

const Billing = () => {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Billing</h1>
            <div className="flex gap-2">
              <Button variant="outline" className="btn-hover">
                <Download className="h-4 w-4 mr-2" />
                Download Reports
              </Button>
              <Button className="btn-hover">
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
          
          <BillingOverview />
        </main>
      </div>
    </div>
  );
};

export default Billing;
