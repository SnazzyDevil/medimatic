import { AlertTriangle, Clock, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const medications = [
  {
    id: 1,
    name: "Amoxicillin",
    category: "Antibiotic",
    stock: 253,
    threshold: 50,
    expiryDate: "2024-12-15",
    status: "normal",
  },
  {
    id: 2,
    name: "Ibuprofen",
    category: "Pain Relief",
    stock: 42,
    threshold: 50,
    expiryDate: "2024-08-30",
    status: "low",
  },
  {
    id: 3,
    name: "Lisinopril",
    category: "Blood Pressure",
    stock: 124,
    threshold: 30,
    expiryDate: "2024-07-05",
    status: "expiring",
  },
  {
    id: 4,
    name: "Metformin",
    category: "Diabetes",
    stock: 76,
    threshold: 40,
    expiryDate: "2025-03-10",
    status: "normal",
  },
  {
    id: 5,
    name: "Salbutamol Inhaler",
    category: "Respiratory",
    stock: 18,
    threshold: 25,
    expiryDate: "2024-11-22",
    status: "low",
  },
];

const supplies = [
  {
    id: 1,
    name: "Nitrile Gloves (M)",
    category: "PPE",
    stock: 450,
    threshold: 100,
    expiryDate: "2025-06-30",
    status: "normal",
  },
  {
    id: 2,
    name: "Surgical Masks",
    category: "PPE",
    stock: 120,
    threshold: 150,
    expiryDate: "2025-05-15",
    status: "low",
  },
  {
    id: 3,
    name: "IV Catheters",
    category: "Equipment",
    stock: 65,
    threshold: 50,
    expiryDate: "2026-02-28",
    status: "normal",
  },
];

const equipment = [
  {
    id: 1,
    name: "Blood Pressure Monitor",
    category: "Diagnostic",
    stock: 8,
    threshold: 3,
    lastService: "2023-11-10",
    nextService: "2024-11-10",
    status: "normal",
  },
  {
    id: 2,
    name: "Stethoscope",
    category: "Diagnostic",
    stock: 12,
    threshold: 5,
    lastService: "2023-09-05",
    nextService: "2024-09-05",
    status: "normal",
  },
  {
    id: 3,
    name: "Thermometer",
    category: "Diagnostic",
    stock: 4,
    threshold: 5,
    lastService: "2023-12-20",
    nextService: "2024-12-20",
    status: "low",
  },
];

const Inventory = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("medications");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stock: "",
    threshold: "",
    expiryDate: "",
  });
  
  const [medicationsData, setMedicationsData] = useState(medications);
  const [suppliesData, setSuppliesData] = useState(supplies);
  const [equipmentData, setEquipmentData] = useState(equipment);
  
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.stock || !newItem.threshold) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const stock = parseInt(newItem.stock);
    const threshold = parseInt(newItem.threshold);
    const status = stock < threshold ? "low" : "normal";
    
    const itemToAdd = {
      id: Date.now(),
      name: newItem.name,
      category: newItem.category,
      stock,
      threshold,
      expiryDate: newItem.expiryDate || new Date().toISOString().split('T')[0],
      status,
      ...(activeTab === "equipment" && {
        lastService: new Date().toISOString().split('T')[0],
        nextService: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      }),
    };
    
    if (activeTab === "medications") {
      setMedicationsData([...medicationsData, itemToAdd]);
    } else if (activeTab === "supplies") {
      setSuppliesData([...suppliesData, itemToAdd]);
    } else if (activeTab === "equipment") {
      setEquipmentData([...equipmentData, itemToAdd]);
    }
    
    setNewItem({
      name: "",
      category: "",
      stock: "",
      threshold: "",
      expiryDate: "",
    });
    setOpenAddDialog(false);
    
    toast({
      title: "Item added",
      description: `${itemToAdd.name} has been added to inventory.`,
    });
  };
  
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Inventory Management</h1>
            <Button className="btn-hover" onClick={() => setOpenAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-healthcare-primary/30">
              <CardContent className="p-4 flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <span className="text-blue-500 text-xl font-bold">32</span>
                </div>
                <div>
                  <p className="text-sm text-healthcare-gray">Low Stock Items</p>
                  <p className="font-medium">Needs Attention</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-healthcare-primary/30">
              <CardContent className="p-4 flex items-center">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <span className="text-amber-500 text-xl font-bold">8</span>
                </div>
                <div>
                  <p className="text-sm text-healthcare-gray">Expiring Soon</p>
                  <p className="font-medium">Within 30 Days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-healthcare-primary/30">
              <CardContent className="p-4 flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <span className="text-green-500 text-xl font-bold">5</span>
                </div>
                <div>
                  <p className="text-sm text-healthcare-gray">On Order</p>
                  <p className="font-medium">Arriving Soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search inventory..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" className="btn-hover">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <Tabs defaultValue="medications" className="w-full" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="supplies">Supplies</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="medications" className="animate-fade-in">
              <div className="border rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicationsData.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-healthcare-secondary">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`mr-2 ${item.stock < item.threshold ? "text-red-500" : ""}`}>
                              {item.stock}
                            </span>
                            {item.stock < item.threshold && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span>{item.expiryDate}</span>
                            {item.status === "expiring" && (
                              <Clock className="h-4 w-4 text-amber-500 ml-2" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              item.status === "normal" 
                                ? "default" 
                                : item.status === "low" 
                                  ? "outline" 
                                  : "secondary"
                            }
                            className={
                              item.status === "low" 
                                ? "border-amber-500 text-amber-700 bg-amber-50" 
                                : item.status === "expiring"
                                  ? "border-red-500 text-red-700 bg-red-50"
                                  : ""
                            }
                          >
                            {item.status === "normal" ? "Normal" : item.status === "low" ? "Low Stock" : "Expiring Soon"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="supplies" className="animate-fade-in">
              <div className="border rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliesData.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-healthcare-secondary">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`mr-2 ${item.stock < item.threshold ? "text-red-500" : ""}`}>
                              {item.stock}
                            </span>
                            {item.stock < item.threshold && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.expiryDate}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.status === "normal" ? "default" : "outline"}
                            className={
                              item.status === "low" 
                                ? "border-amber-500 text-amber-700 bg-amber-50" 
                                : ""
                            }
                          >
                            {item.status === "normal" ? "Normal" : "Low Stock"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="equipment" className="animate-fade-in">
              <div className="border rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Service</TableHead>
                      <TableHead>Next Service</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentData.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-healthcare-secondary">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`mr-2 ${item.stock < item.threshold ? "text-red-500" : ""}`}>
                              {item.stock}
                            </span>
                            {item.stock < item.threshold && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.lastService}</TableCell>
                        <TableCell>{item.nextService}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.status === "normal" ? "default" : "outline"}
                            className={
                              item.status === "low" 
                                ? "border-amber-500 text-amber-700 bg-amber-50" 
                                : ""
                            }
                          >
                            {item.status === "normal" ? "Operational" : "Maintenance Required"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
          
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Item to Inventory</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Current Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="threshold" className="text-right">Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newItem.threshold}
                    onChange={(e) => setNewItem({...newItem, threshold: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                {activeTab !== "equipment" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Inventory;
