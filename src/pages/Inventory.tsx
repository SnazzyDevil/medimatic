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
import { supabase, ilike } from "@/integrations/supabase/client";
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
    
    try {
      // Normalize input data
      const itemName = newItem.name.trim();
      const itemCode = newItem.itemCode.trim();
      const stock = parseInt(newItem.stock);
      const threshold = parseInt(newItem.threshold);
      const unitCost = parseFloat(newItem.unitCost);
      
      // First, check if an item with the same name AND code exists using case-insensitive search
      const { data: existingItems, error: searchError } = await supabase
        .from('inventory')
        .select('*')
        .or(`name.ilike.${itemName},item_code.ilike.${itemCode}`);
      
      if (searchError) {
        console.error("Error searching for existing item:", searchError);
        toast({
          title: "Error",
          description: `Failed to check for existing items: ${searchError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      // Find exact match for both name and code (case insensitive)
      const exactMatch = existingItems?.find(
        item => item.name.toLowerCase() === itemName.toLowerCase() && 
               item.item_code.toLowerCase() === itemCode.toLowerCase()
      );
      
      if (exactMatch) {
        // Item exists, update the stock and other fields
        console.log("Existing item found, updating stock:", exactMatch);
        
        const newStock = exactMatch.stock + stock;
        const newStatus = newStock < threshold ? "low" : "normal";
        
        const { data, error: updateError } = await supabase
          .from('inventory')
          .update({ 
            stock: newStock,
            status: newStatus,
            // Update other fields that might have changed
            threshold: threshold,
            expiry_date: newItem.expiryDate || exactMatch.expiry_date,
            unit_cost: unitCost,
            supplier_name: newItem.supplierName,
            updated_at: new Date().toISOString()
          })
          .eq('id', exactMatch.id)
          .select();
        
        if (updateError) {
          console.error("Error updating inventory item:", updateError);
          toast({
            title: "Error",
            description: `Failed to update item: ${updateError.message}`,
            variant: "destructive",
          });
          return;
        }
        
        console.log("Item updated successfully:", data);
        toast({
          title: "Item updated",
          description: `${itemName} stock has been updated to ${newStock}.`,
        });
      } else {
        // Item doesn't exist with both the same name AND code, create a new one
        const status = stock < threshold ? "low" : "normal";
        const itemToAdd = {
          name: itemName,
          category: newItem.category,
          stock: stock,
          threshold: threshold,
          expiry_date: newItem.expiryDate || null,
          status: status,
          item_code: itemCode,
          unit_cost: unitCost,
          supplier_name: newItem.supplierName,
        };
        
        console.log("Adding new item to inventory:", itemToAdd);
        const { data, error: insertError } = await supabase
          .from('inventory')
          .insert(itemToAdd)
          .select();
        
        if (insertError) {
          console.error("Error adding new item to inventory:", insertError);
          toast({
            title: "Error",
            description: `Failed to add item: ${insertError.message}`,
            variant: "destructive",
          });
          return;
        }
        
        console.log("New item added successfully:", data);
        toast({
          title: "Item added",
          description: `${itemToAdd.name} has been added to inventory.`,
        });
      }
      
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
      console.error("Exception processing inventory item:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while processing the item.",
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
              <p className="text-red-700">Please try refreshing the page or contact support.</p>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <Button onClick={() => setOpenAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Total Inventory Items</h3>
                  <span className="text-2xl font-bold">{inventoryData?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-amber-700">Low Stock Items</h3>
                  <span className="text-2xl font-bold text-amber-600">{getLowStockCount()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-red-700">Expiring Soon</h3>
                  <span className="text-2xl font-bold text-red-600">{getExpiringCount()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search inventory..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setOpenFilterDialog(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mb-4 p-3 border rounded-md bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Active filters:</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryFilter && (
                    <Badge variant="outline" className="bg-white">
                      Category: {categoryFilter}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => setCategoryFilter("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {statusFilter && (
                    <Badge variant="outline" className="bg-white">
                      Status: {statusFilter}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => setStatusFilter("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <Tabs defaultValue="medications" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="supplies">Supplies</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="medications">
                {isLoading ? (
                  <div className="text-center py-8">Loading medications inventory...</div>
                ) : (
                  <InventoryTable items={getMedicationsData()} />
                )}
              </TabsContent>
              
              <TabsContent value="supplies">
                {isLoading ? (
                  <div className="text-center py-8">Loading supplies inventory...</div>
                ) : (
                  <InventoryTable items={getSuppliesData()} />
                )}
              </TabsContent>
              
              <TabsContent value="equipment">
                {isLoading ? (
                  <div className="text-center py-8">Loading equipment inventory...</div>
                ) : (
                  <InventoryTable items={getEquipmentData()} />
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Add Item Dialog */}
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory management system.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Enter item name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="itemCode">Item Code</Label>
                    <Input
                      id="itemCode"
                      value={newItem.itemCode}
                      onChange={(e) => setNewItem({...newItem, itemCode: e.target.value})}
                      placeholder="e.g., MED-001"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemType">Item Type</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medications">Medication</SelectItem>
                        <SelectItem value="supplies">Supply</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({...newItem, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {newItem.type && ITEM_CATEGORIES[newItem.type]?.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Current Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Low Stock Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      value={newItem.threshold}
                      onChange={(e) => setNewItem({...newItem, threshold: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCost">Unit Cost (R)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.unitCost}
                      onChange={(e) => setNewItem({...newItem, unitCost: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier</Label>
                  <Input
                    id="supplierName"
                    value={newItem.supplierName}
                    onChange={(e) => setNewItem({...newItem, supplierName: e.target.value})}
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Filter Dialog */}
          <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Inventory</DialogTitle>
                <DialogDescription>
                  Filter inventory by category and status
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryFilter">Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger id="categoryFilter">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All categories</SelectItem>
                      {activeTab && ITEM_CATEGORIES[activeTab]?.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="statusFilter">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger id="statusFilter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-statuses">All statuses</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenFilterDialog(false)}>
                  Cancel
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

// Inventory Table Component
const InventoryTable = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No inventory items found</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Threshold</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.item_code}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.stock}</TableCell>
            <TableCell>{item.threshold}</TableCell>
            <TableCell>
              {item.expiry_date ? (
                new Date(item.expiry_date) < new Date() ? (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {new Date(item.expiry_date).toLocaleDateString()}
                  </div>
                ) : (
                  new Date(item.expiry_date).toLocaleDateString()
                )
              ) : (
                "N/A"
              )}
            </TableCell>
            <TableCell>
              <Badge 
                variant={item.status === "normal" ? "outline" : "destructive"} 
                className={item.status === "normal" ? "bg-green-50 text-green-700 border-green-200" : ""}
              >
                {item.status === "low" ? "Low Stock" : "Normal"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Inventory;
