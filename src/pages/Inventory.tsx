import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase, findInventoryItem, findExactInventoryItemByName, updateInventoryItemStock, checkItemReferences } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [openUpdateStockDialog, setOpenUpdateStockDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicateItem, setDuplicateItem] = useState(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [stockUpdateAmount, setStockUpdateAmount] = useState(0);

  const [newItem, setNewItem] = useState({
    name: "",
    item_code: "",
    category: "",
    supplier_name: "",
    unit_cost: "",
    stock: 0,
    threshold: 0,
    expiry_date: null,
  });

  const handleUnitCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d.]/g, '');
    setNewItem({ ...newItem, unit_cost: inputValue });
  };

  const formatUnitCostForDisplay = (value: string): string => {
    if (!value || value === "") return "";
    
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return "";
    
    return numericValue.toFixed(2);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching inventory:", error);
        toast({
          title: "Error",
          description: "Failed to fetch inventory",
          variant: "destructive",
        });
        return;
      }

      setInventoryData(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = (item) => {
    setSelectedItem(item);
    setStockUpdateAmount(0);
    setOpenUpdateStockDialog(true);
  };

  const handleAddItem = () => {
    setOpenAddDialog(true);
    setNewItem({
      name: "",
      item_code: "",
      category: "",
      supplier_name: "",
      unit_cost: "",
      stock: 0,
      threshold: 0,
      expiry_date: null,
    });
    setDuplicateItem(null);
  };

  const handleSaveStockUpdate = async () => {
    if (!selectedItem) return;

    const updateAmount = parseInt(stockUpdateAmount.toString());
    if (isNaN(updateAmount)) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    try {
      const newStock = selectedItem.stock + updateAmount;
      if (newStock < 0) {
        toast({
          title: "Invalid stock amount",
          description: "Stock quantity cannot be negative",
          variant: "destructive",
        });
        return;
      }

      await updateInventoryItemStock(selectedItem.id, newStock);
      
      toast({
        title: "Stock Updated",
        description: `${selectedItem.name}'s stock has been updated to ${newStock}`,
      });
      
      fetchInventory();
      setOpenUpdateStockDialog(false);
      setSelectedItem(null);
      setStockUpdateAmount(0);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const checkForDuplicateItem = async () => {
    if (!newItem.name) return false;
    
    try {
      const existingItems = await findExactInventoryItemByName(newItem.name);
      if (existingItems && existingItems.length > 0) {
        setDuplicateItem(existingItems[0]);
        setShowDuplicateDialog(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking for duplicate item:", error);
      return false;
    }
  };

  const handleCreateItem = async () => {
    if (
      !newItem.name ||
      !newItem.item_code ||
      !newItem.category ||
      !newItem.supplier_name ||
      !newItem.unit_cost ||
      !newItem.stock ||
      !newItem.threshold
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const isDuplicate = await checkForDuplicateItem();
      if (isDuplicate) {
        return;
      }

      const numericUnitCost = parseFloat(newItem.unit_cost);
      
      const { data, error } = await supabase
        .from("inventory")
        .insert({
          name: newItem.name,
          item_code: newItem.item_code,
          category: newItem.category,
          supplier_name: newItem.supplier_name,
          unit_cost: numericUnitCost,
          stock: newItem.stock,
          threshold: newItem.threshold,
          expiry_date: newItem.expiry_date,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to inventory`,
      });

      fetchInventory();
      setOpenAddDialog(false);
      setNewItem({
        name: "",
        item_code: "",
        category: "",
        supplier_name: "",
        unit_cost: "",
        stock: 0,
        threshold: 0,
        expiry_date: null,
      });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDuplicateItem = async () => {
    if (!duplicateItem) return;
    
    try {
      const newStock = duplicateItem.stock + parseInt(newItem.stock.toString());
      
      await updateInventoryItemStock(duplicateItem.id, newStock);
      
      toast({
        title: "Stock Updated",
        description: `${duplicateItem.name}'s stock has been updated to ${newStock}`,
      });
      
      fetchInventory();
      setShowDuplicateDialog(false);
      setDuplicateItem(null);
      setOpenAddDialog(false);
    } catch (error) {
      console.error("Error updating duplicate item:", error);
      toast({
        title: "Error",
        description: "Failed to update existing item's stock",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewAnyway = () => {
    setShowDuplicateDialog(false);
    setDuplicateItem(null);
    
    const createNewItem = async () => {
      try {
        const numericUnitCost = parseFloat(newItem.unit_cost);
        
        const { data, error } = await supabase
          .from("inventory")
          .insert({
            name: newItem.name,
            item_code: newItem.item_code,
            category: newItem.category,
            supplier_name: newItem.supplier_name,
            unit_cost: numericUnitCost,
            stock: newItem.stock,
            threshold: newItem.threshold,
            expiry_date: newItem.expiry_date,
          })
          .select();

        if (error) throw error;

        toast({
          title: "Item Added",
          description: `${newItem.name} has been added to inventory`,
        });

        fetchInventory();
        setOpenAddDialog(false);
      } catch (error) {
        console.error("Error adding inventory item anyway:", error);
        toast({
          title: "Error",
          description: "Failed to add item",
          variant: "destructive",
        });
      }
    };
    
    createNewItem();
  };

  const filteredInventory = inventoryData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Inventory Management</h1>
            <Button className="btn-hover" onClick={handleAddItem}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <Card className="mb-6 border-healthcare-primary/30">
            <CardContent className="p-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <p>Loading inventory...</p>
            </div>
          ) : (
            <Card className="border-healthcare-primary/30">
              <CardContent className="p-0">
                <ScrollArea>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.item_code}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.supplier_name}</TableCell>
                          <TableCell>{formatUnitCostForDisplay(item.unit_cost)}</TableCell>
                          <TableCell>
                            {item.stock}
                            {item.stock <= item.threshold && (
                              <AlertTriangle className="inline-block h-4 w-4 ml-1 text-amber-500" />
                            )}
                          </TableCell>
                          <TableCell>{item.threshold}</TableCell>
                          <TableCell>
                            {item.expiry_date
                              ? new Date(item.expiry_date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleUpdateStock(item)}
                                className="btn-hover"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredInventory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">
                            No items found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Dialog open={openUpdateStockDialog} onOpenChange={setOpenUpdateStockDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Stock Quantity</DialogTitle>
                <DialogDescription>
                  Enter the amount to add or subtract from the current stock.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {selectedItem && (
                  <div className="grid gap-2">
                    <div className="p-3 bg-gray-50 rounded-md mb-2">
                      <p><span className="font-medium">Item:</span> {selectedItem.name}</p>
                      <p><span className="font-medium">Current stock:</span> {selectedItem.stock}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stockUpdate" className="text-right">
                        Update Amount
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="stockUpdate"
                          type="number"
                          value={stockUpdateAmount}
                          onChange={(e) => setStockUpdateAmount(parseInt(e.target.value) || 0)}
                          className="col-span-3"
                          placeholder="Enter positive value to add, negative to subtract"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          New stock will be: <span className="font-bold">{selectedItem.stock + (stockUpdateAmount || 0)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenUpdateStockDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSaveStockUpdate}>
                  Update Stock
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new item below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item_code" className="text-right">
                    Item Code
                  </Label>
                  <Input
                    id="item_code"
                    value={newItem.item_code}
                    onChange={(e) =>
                      setNewItem({ ...newItem, item_code: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier_name" className="text-right">
                    Supplier
                  </Label>
                  <Input
                    id="supplier_name"
                    value={newItem.supplier_name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, supplier_name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit_cost" className="text-right">
                    Unit Cost
                  </Label>
                  <Input
                    id="unit_cost"
                    type="text"
                    value={newItem.unit_cost}
                    onChange={handleUnitCostChange}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.stock}
                    onChange={(e) =>
                      setNewItem({ ...newItem, stock: parseInt(e.target.value) })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="threshold" className="text-right">
                    Threshold
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newItem.threshold}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        threshold: parseInt(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry_date" className="text-right">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={newItem.expiry_date || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, expiry_date: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" onClick={handleCreateItem}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Similar Item Found</DialogTitle>
                <DialogDescription>
                  An item with the same name already exists in inventory. Would you like to:
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {duplicateItem && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">Existing Item Details:</h3>
                    <p><span className="font-medium">Name:</span> {duplicateItem.name}</p>
                    <p><span className="font-medium">Code:</span> {duplicateItem.item_code}</p>
                    <p><span className="font-medium">Current stock:</span> {duplicateItem.stock}</p>
                    <p><span className="font-medium">Unit cost:</span> {duplicateItem.unit_cost}</p>
                    <p><span className="font-medium">New stock will be:</span> <span className="text-green-600 font-bold">{duplicateItem.stock + parseInt(newItem.stock.toString())}</span></p>
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={handleUpdateDuplicateItem}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> 
                    Update Existing Item's Stock
                  </Button>
                  <Button 
                    onClick={handleCreateNewAnyway}
                    variant="outline" 
                    className="w-full"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create as New Item Anyway
                  </Button>
                  <Button 
                    onClick={() => setShowDuplicateDialog(false)}
                    variant="ghost" 
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Inventory;
