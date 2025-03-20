
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Patient, PracticeInfo } from "./CustomerSection";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: string;
  amount: number;
}

interface InvoicePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceData: {
    patientName: string;
    patientId?: string;
    invoiceNumber: string;
    poNumber: string;
    invoiceDate: string;
    paymentDueDate: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
    notes: string;
    practiceInfo: PracticeInfo;
  };
  patient: Patient | null;
}

export const InvoicePreview = ({ open, onOpenChange, invoiceData, patient }: InvoicePreviewProps) => {
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "ZAR": 
      default: return "R";
    }
  };

  const currencySymbol = getCurrencySymbol(invoiceData.currency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Invoice Preview</DialogTitle>
          <Button 
            className="absolute right-4 top-4" 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 space-y-8 bg-white rounded-lg print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{invoiceData.practiceInfo.name}</h1>
              <address className="not-italic text-gray-600 mt-1">
                {invoiceData.practiceInfo.address}<br />
                Phone: {invoiceData.practiceInfo.phone}<br />
                Email: {invoiceData.practiceInfo.email}
              </address>
              <div className="text-sm text-gray-500 mt-1">
                Reg #: {invoiceData.practiceInfo.regNumber}<br />
                VAT #: {invoiceData.practiceInfo.vatNumber}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-primary">INVOICE</h2>
              <p className="text-gray-600 mt-1">#{invoiceData.invoiceNumber}</p>
              <div className="mt-3">
                <div className="text-gray-700">
                  <span className="font-medium">Date: </span>
                  {invoiceData.invoiceDate}
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Due: </span>
                  {invoiceData.paymentDueDate}
                </div>
                {invoiceData.poNumber && (
                  <div className="text-gray-700">
                    <span className="font-medium">PO #: </span>
                    {invoiceData.poNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Client Information */}
          <div className="border-t border-b py-4">
            <h3 className="font-medium text-gray-800 mb-2">Bill To:</h3>
            {patient ? (
              <div>
                <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                {patient.address && <div>{patient.address}</div>}
                {patient.contact_number && <div>Phone: {patient.contact_number}</div>}
                {patient.email && <div>Email: {patient.email}</div>}
                {patient.medical_aid_number && <div>Medical Aid #: {patient.medical_aid_number}</div>}
              </div>
            ) : (
              <div className="font-medium">{invoiceData.patientName}</div>
            )}
          </div>
          
          {/* Invoice Items */}
          <div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-gray-600">Description</th>
                  <th className="px-4 py-2 text-gray-600 text-center">Qty</th>
                  <th className="px-4 py-2 text-gray-600 text-right">Price</th>
                  <th className="px-4 py-2 text-gray-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoiceData.items.map((item) => (
                  item.description && (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{currencySymbol} {Number(item.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{currencySymbol} {item.amount.toFixed(2)}</td>
                    </tr>
                  )
                ))}
                {invoiceData.items.length === 0 || (invoiceData.items.length === 1 && !invoiceData.items[0].description) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-500">No items added</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{currencySymbol} {invoiceData.subtotal.toFixed(2)}</span>
              </div>
              
              {invoiceData.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span>- {currencySymbol} {invoiceData.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>{currencySymbol} {invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          {invoiceData.notes && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-800 mb-2">Notes:</h3>
              <p className="text-gray-700">{invoiceData.notes}</p>
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t pt-6">
            <p>Thank you for your business!</p>
            {invoiceData.practiceInfo.website && (
              <p className="mt-1">{invoiceData.practiceInfo.website}</p>
            )}
            <p className="mt-1">Generated on {format(new Date(), "yyyy-MM-dd")}</p>
          </div>
        </div>
        
        <div className="flex justify-end mt-4 gap-2 print:hidden">
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

