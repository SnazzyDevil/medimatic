
import { useState, useEffect } from "react";
import { AlertTriangle, Clock, Filter, Plus, Search, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ITEM_CATEGORIES = {
  medications: ["Antibiotic", "Pain Relief", "Blood Pressure", "Diabetes", "Respiratory", "Other"],
  supplies: ["PPE", "Equipment", "Consumables", "Other"],
  equipment: ["Diagnostic", "Surgical", "Monitoring", "Treatment", "Other"]
};

const Inventory = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("medications");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stock: "",
    threshold: "",
    expiryDate: "",
    itemCode: "",
    unitCost: "",
    supplierName: "",
    type: "medications",
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch inventory data from Supabase
  const fetchInventory = async () => {
    console.log("Fetching inventory data...");
    const { data, error } = await supabase
      .from('inventory')
      .select('*');
    
    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
    
    console.log("Inventory data fetched:", data);
    return data || [];
  };
  
  const { 
    data: inventoryData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory
  });
  
  // Filter helper function
  const filterItems = (items) => {
    if (!items) return [];
    
    return items.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
      
      // Status filter
      const matchesStatus = statusFilter === "" || item.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };
  
  // Process inventory data into medication, supplies and equipment categories
  const getMedicationsData = () => {
    if (!inventoryData) return [];
    const medicationItems = inventoryData.filter(item => item.category && 
      ITEM_CATEGORIES.medications.includes(item.category));
    
    return filterItems(medicationItems);
  };
  
  const getSuppliesData = () => {
    if (!inventoryData) return [];
    const suppliesItems = inventoryData.filter(item => item.category && 
      ITEM_CATEGORIES.supplies.includes(item.category));
    
    return filterItems(suppliesItems);
  };
  
  const getEquipmentData = () => {
    if (!inventoryData) return [];
    const equipmentItems = inventoryData.filter(item => item.category && 
      ITEM_CATEGORIES.equipment.includes(item.category));
    
    return filterItems(equipmentItems);
  };
  
  // Calculate statistics
  const getLowStockCount = () => {
    if (!inventoryData) return 0;
    return inventoryData.filter(item => item.stock < item.threshold).length;
  };
  
  const getExpiringCount = () => {
    if (!inventoryData) return 0;
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return inventoryData.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    }).length;
  };
  
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.stock || !newItem.threshold || !newItem.itemCode || !newItem.unitCost || !newItem.supplierName) {
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
      name: newItem.name,
      category: newItem.category,
      stock: stock,
      threshold: threshold,
      expiry_date: newItem.expiryDate || null,
      status: status,
      item_code: newItem.itemCode,
      unit_cost: parseFloat(newItem.unitCost),
      supplier_name: newItem.supplierName,
    };
    
    try {
      console.log("Adding item to inventory:", itemToAdd);
      const { data, error } = await supabase
        .from('inventory')
        .insert(itemToAdd)
        .select();
      
      if (error) {
        console.error("Error adding item to inventory:", error);
        toast({
          title: "Error",
          description: `Failed to add item: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Item added successfully:", data);
      toast({
        title: "Item added",
        description: `${itemToAdd.name} has been added to inventory.`,
      });
      
      // Reset form and close dialog
      setNewItem({
        name: "",
        category: "",
        stock: "",
        threshold: "",
        expiryDate: "",
        itemCode: "",
        unitCost: "",
        supplierName: "",
        type: "medications",
      });
      setOpenAddDialog(false);
      
      // Refresh inventory data
      refetch();
    } catch (err) {
      console.error("Exception adding item:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the item.",
        variant: "destructive",
      });
    }
  };
  
  const handleTypeChange = (type: string) => {
    setNewItem({
      ...newItem,
      type,
      category: "",
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    setShowFilters(false);
  };
  
  if (isError) {
    console.error("Error fetching data:", error);
    return (
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 ml-16">
          <Header />
          <main className="page-container">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h2 className="text-red-800 font-medium">Error loading inventory data</h2>
              <p className="text-red-700">Please try refreshing the page or contact support if the issue persists.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
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
                  <span className="text-blue-500 text-xl font-bold">{getLowStockCount()}</span>
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
                  <span className="text-amber-500 text-xl font-bold">{getExpiringCount()}</span>
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
                  <span className="text-green-500 text-xl font-bold">
                    {isLoading ? "..." : inventoryData?.length || 0}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-healthcare-gray">Total Items</p>
                  <p className="font-medium">In Inventory</p>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-hover"
              onClick={() => setOpenFilterDialog(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          {showFilters && (
            <div className="border rounded-lg p-4 mb-4 bg-slate-50 flex flex-wrap gap-2 items-center">
              <p className="text-sm text-muted-foreground mr-2">Active filters:</p>
              {categoryFilter && (
                <Badge variant="outline" className="flex items-center gap-1 bg-white">
                  Category: {categoryFilter}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0" 
                    onClick={() => setCategoryFilter("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="outline" className="flex items-center gap-1 bg-white">
                  Status: {statusFilter}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0" 
                    onClick={() => setStatusFilter("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs ml-auto"
                onClick={resetFilters}
              >
                Clear all
              </Button>
            </div>
          )}

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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p>Loading inventory data...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : getMedicationsData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No medication items found. Add some to get started.
                        </TableCell>
                      </TableRow>
                    ) : getMedicationsData().map((item) => (
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
                            <span>{item.expiry_date || "N/A"}</span>
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p>Loading inventory data...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : getSuppliesData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No supplies items found. Add some to get started.
                        </TableCell>
                      </TableRow>
                    ) : getSuppliesData().map((item) => (
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
                        <TableCell>{item.expiry_date || "N/A"}</TableCell>
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
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p>Loading inventory data...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : getEquipmentData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No equipment items found. Add some to get started.
                        </TableCell>
                      </TableRow>
                    ) : getEquipmentData().map((item) => (
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
                        <TableCell>{item.supplier_name}</TableCell>
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
          
          {/* Add Item Dialog */}
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Item to Inventory</DialogTitle>
                <DialogDescription>Fill in the details below to add a new item to your inventory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Item Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medications">Medication</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemCode" className="text-right">Item Code</Label>
                  <Input
                    id="itemCode"
                    value={newItem.itemCode}
                    onChange={(e) => setNewItem({...newItem, itemCode: e.target.value})}
                    className="col-span-3"
                  />
                </div>
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
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({...newItem, category: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_CATEGORIES[newItem.type as keyof typeof ITEM_CATEGORIES].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitCost" className="text-right">Unit Cost</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({...newItem, unitCost: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplierName" className="text-right">Supplier</Label>
                  <Input
                    id="supplierName"
                    value={newItem.supplierName}
                    onChange={(e) => setNewItem({...newItem, supplierName: e.target.value})}
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
                {newItem.type !== "equipment" && (
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
          
          {/* Filter Dialog */}
          <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Inventory</DialogTitle>
                <DialogDescription>
                  Filter inventory items by category and status
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="filterCategory">Category</Label>
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger id="filterCategory">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {ITEM_CATEGORIES[activeTab as keyof typeof ITEM_CATEGORIES].map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger id="filterStatus">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="expiring">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setCategoryFilter("");
                  setStatusFilter("");
                  setOpenFilterDialog(false);
                }}>
                  Reset
                </Button>
                <Button onClick={() => {
                  setShowFilters(categoryFilter !== "" || statusFilter !== "");
                  setOpenFilterDialog(false);
                }}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Inventory;
