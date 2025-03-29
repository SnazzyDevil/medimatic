import { useState, useEffect } from "react";
import {
  Search,
  Edit,
  Trash2,
  PlusCircle,
  ArrowDown,
  ArrowUp,
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
import { supabase } from "@/integrations/supabase/client";
import { findInventoryItem } from "@/integrations/supabase/client";
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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    item_code: "",
    category: "",
    supplier_name: "",
    unit_cost: 0,
    stock: 0,
    threshold: 0,
    expiry_date: null,
  });

  const [editedItem, setEditedItem] = useState({
    id: "",
    name: "",
    item_code: "",
    category: "",
    supplier_name: "",
    unit_cost: 0,
    stock: 0,
    threshold: 0,
    expiry_date: null,
  });

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

  const handleEditItem = (item) => {
    setEditedItem({
      id: item.id,
      name: item.name,
      item_code: item.item_code,
      category: item.category,
      supplier_name: item.supplier_name,
      unit_cost: item.unit_cost,
      stock: item.stock,
      threshold: item.threshold,
      expiry_date: item.expiry_date,
    });
    setSelectedItem(item);
    setOpenEditDialog(true);
  };

  const handleDeleteItemConfirmation = (item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleAddItem = () => {
    setOpenAddDialog(true);
  };

  const handleUpdateItem = async () => {
    if (
      !editedItem.name ||
      !editedItem.item_code ||
      !editedItem.category ||
      !editedItem.supplier_name ||
      !editedItem.unit_cost ||
      !editedItem.stock ||
      !editedItem.threshold
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("inventory")
        .update({
          name: editedItem.name,
          item_code: editedItem.item_code,
          category: editedItem.category,
          supplier_name: editedItem.supplier_name,
          unit_cost: editedItem.unit_cost,
          stock: editedItem.stock,
          threshold: editedItem.threshold,
          expiry_date: editedItem.expiry_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editedItem.id)
        .select();

      if (error) throw error;

      toast({
        title: "Item Updated",
        description: `${editedItem.name} has been updated`,
      });

      fetchInventory();
      setOpenEditDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const checkItemReferences = async (itemId) => {
    try {
      const { data, error } = await supabase
        .from('dispensing')
        .select('id')
        .eq('medication_id', itemId);
      
      if (error) throw error;
      
      return data.length > 0;
    } catch (error) {
      console.error("Error checking item references:", error);
      return false;
    }
  };

  const handleDeleteItem = async (item) => {
    console.info("Deleting inventory item:", item);

    try {
      const isReferenced = await checkItemReferences(item.id);
      
      if (isReferenced) {
        setDeleteError(
          "Cannot delete this item because it is referenced in dispensing records. Please remove those references first or archive the item instead."
        );
        return;
      }

      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Item Deleted",
        description: `${item.name} has been removed from inventory`,
      });

      fetchInventory();
      setOpenDeleteDialog(false);
      setSelectedItem(null);
      setDeleteError("");
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      setDeleteError(
        "Failed to delete item. Please try again or contact support."
      );
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
      const existingItems = await findInventoryItem(newItem.name, newItem.item_code);
      if (existingItems && existingItems.length > 0) {
        toast({
          title: "Item Already Exists",
          description: "An item with the same name or item code already exists.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("inventory")
        .insert([
          {
            name: newItem.name,
            item_code: newItem.item_code,
            category: newItem.category,
            supplier_name: newItem.supplier_name,
            unit_cost: newItem.unit_cost,
            stock: newItem.stock,
            threshold: newItem.threshold,
            expiry_date: newItem.expiry_date,
          },
        ])
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
        unit_cost: 0,
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
                          <TableCell>{item.unit_cost}</TableCell>
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
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => handleEditItem(item)}
                                className="btn-hover"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteItemConfirmation(item)}
                                className="btn-hover"
                              >
                                <Trash2 className="h-4 w-4" />
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

          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Inventory Item</DialogTitle>
                <DialogDescription>
                  Make changes to the item details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editedItem.name}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, name: e.target.value })
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
                    value={editedItem.item_code}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, item_code: e.target.value })
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
                    value={editedItem.category}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, category: e.target.value })
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
                    value={editedItem.supplier_name}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
                        supplier_name: e.target.value,
                      })
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
                    type="number"
                    value={editedItem.unit_cost}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
                        unit_cost: parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editedItem.stock}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
                        stock: parseInt(e.target.value),
                      })
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
                    value={editedItem.threshold}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
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
                    value={editedItem.expiry_date || ""}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
                        expiry_date: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" onClick={handleUpdateItem}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Inventory Item</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this item? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedItem && (
                  <p className="text-sm">
                    You are about to delete <strong>{selectedItem.name}</strong> ({selectedItem.item_code}).
                  </p>
                )}
                {deleteError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {deleteError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => selectedItem && handleDeleteItem(selectedItem)}
                  disabled={!!deleteError}
                >
                  Delete
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
                    type="number"
                    value={newItem.unit_cost}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        unit_cost: parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
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
        </main>
      </div>
    </div>
  );
};

export default Inventory;
