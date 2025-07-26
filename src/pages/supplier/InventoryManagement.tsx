import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Download, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Calendar,
  DollarSign,
  Scale,
  Truck
} from "lucide-react";

interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  expiryDate?: string;
  shelfLife?: number;
  deliveryOptions: string[];
  notes?: string;
  isVisible: boolean;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  "Fruits", "Vegetables", "Grains", "Spices", "Dairy", "Meat", "Beverages", "Snacks", "Bakery", "Frozen Foods"
];

const units = ["kg", "liter", "pieces", "dozen", "pack", "box"];

const deliveryOptions = [
  "Door Delivery", "Bulk Pickup", "Warehouse Pickup", "Express Delivery", "Scheduled Delivery"
];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierProfile, setSupplierProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    productName: "",
    category: "",
    quantity: "",
    unit: "",
    unitPrice: "",
    expiryDate: "",
    shelfLife: "",
    deliveryOptions: [] as string[],
    notes: "",
    isVisible: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSupplierId(user.uid);
        // Fetch supplier profile
        const profileRef = doc(db, "supplier_profiles", user.uid);
        getDoc(profileRef).then((profileSnap) => {
          if (profileSnap.exists()) {
            setSupplierProfile(profileSnap.data());
          }
        });
      } else {
        setSupplierId(null);
        setSupplierProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch inventory items
  useEffect(() => {
    if (!supplierId) return;

    const q = query(collection(db, "inventory"), where("supplierId", "==", supplierId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });
      setInventory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [supplierId]);

  const resetForm = () => {
    setForm({
      productName: "",
      category: "",
      quantity: "",
      unit: "",
      unitPrice: "",
      expiryDate: "",
      shelfLife: "",
      deliveryOptions: [],
      notes: "",
      isVisible: true
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (value: string) => {
    setForm(prev => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(value)
        ? prev.deliveryOptions.filter(v => v !== value)
        : [...prev.deliveryOptions, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    if (!form.productName || !form.category || !form.quantity || !form.unit || !form.unitPrice) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (form.deliveryOptions.length === 0) {
      toast({
        title: "Missing Fields",
        description: "Please select at least one delivery option.",
        variant: "destructive"
      });
      return;
    }

    try {
      const itemData = {
        productName: form.productName,
        category: form.category,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        unitPrice: parseFloat(form.unitPrice),
        expiryDate: form.expiryDate || null,
        shelfLife: form.shelfLife ? parseInt(form.shelfLife) : null,
        deliveryOptions: form.deliveryOptions,
        notes: form.notes,
        isVisible: form.isVisible,
        supplierId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingItem) {
        await updateDoc(doc(db, "inventory", editingItem.id), {
          ...itemData,
          updatedAt: new Date().toISOString()
        });
        toast({ title: "Item Updated!", description: "Inventory item has been updated successfully." });
      } else {
        await addDoc(collection(db, "inventory"), itemData);
        toast({ title: "Item Added!", description: "New inventory item has been added successfully." });
      }

      setIsAddDialogOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save item.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      productName: item.productName,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      unitPrice: item.unitPrice.toString(),
      expiryDate: item.expiryDate || "",
      shelfLife: item.shelfLife?.toString() || "",
      deliveryOptions: item.deliveryOptions,
      notes: item.notes || "",
      isVisible: item.isVisible
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "inventory", itemId));
        toast({ title: "Item Deleted!", description: "Inventory item has been deleted successfully." });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete item.",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleVisibility = async (item: InventoryItem) => {
    try {
      await updateDoc(doc(db, "inventory", item.id), {
        isVisible: !item.isVisible,
        updatedAt: new Date().toISOString()
      });
      toast({ 
        title: "Visibility Updated!", 
        description: `Item is now ${!item.isVisible ? 'visible' : 'hidden'} to vendors.` 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update visibility.",
        variant: "destructive"
      });
    }
  };

  const isLowStock = (item: InventoryItem) => {
    return item.quantity < 50; // Threshold of 50 units
  };

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  const getStatusBadge = (item: InventoryItem) => {
    if (isExpiringSoon(item)) {
      return <Badge variant="destructive">Expiring Soon</Badge>;
    }
    if (isLowStock(item)) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">Available</Badge>;
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const itemData: any = {};
        
        headers.forEach((header, index) => {
          itemData[header.trim()] = values[index]?.trim();
        });

        try {
          await addDoc(collection(db, "inventory"), {
            productName: itemData.name,
            category: itemData.category,
            quantity: parseFloat(itemData.quantity),
            unit: itemData.unit,
            unitPrice: parseFloat(itemData.price_per_unit),
            deliveryOptions: itemData.delivery_modes?.split(',').map((m: string) => m.trim()) || [],
            shelfLife: itemData.shelf_life ? parseInt(itemData.shelf_life) : null,
            isVisible: true,
            supplierId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: "Bulk Upload Complete",
        description: `Successfully uploaded ${successCount} items. ${errorCount} items failed.`
      });
      
      setIsBulkUploadOpen(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userRole="supplier" 
        onLogout={() => window.location.href = '/'} 
        userName={supplierProfile?.contactPersonName}
      />
      
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your product inventory and pricing</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Upload</span>
            </Button>
            <Button
              onClick={() => {
                setEditingItem(null);
                resetForm();
                setIsAddDialogOpen(true);
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
              <p className="text-xs text-muted-foreground">All inventory items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Items</CardTitle>
              <Eye className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {inventory.filter(item => item.isVisible).length}
              </div>
              <p className="text-xs text-muted-foreground">Visible to vendors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {inventory.filter(isLowStock).length}
              </div>
              <p className="text-xs text-muted-foreground">Below 50 units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>Manage your product inventory and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inventory items found. Add your first item to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Expiry/Shelf Life</TableHead>
                      <TableHead>Delivery Options</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow 
                        key={item.id}
                        className={isLowStock(item) || isExpiringSoon(item) ? "bg-muted/50" : ""}
                      >
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Scale className="w-4 h-4 text-muted-foreground" />
                            <span>{item.quantity} {item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>₹{item.unitPrice}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.expiryDate ? (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                            </div>
                          ) : item.shelfLife ? (
                            <span>{item.shelfLife} days</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.deliveryOptions.slice(0, 2).map((option) => (
                              <Badge key={option} variant="secondary" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                            {item.deliveryOptions.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.deliveryOptions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVisibility(item)}
                            >
                              {item.isVisible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={form.productName}
                  onChange={(e) => handleFormChange("productName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={(v) => handleFormChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={form.unit} onValueChange={(v) => handleFormChange("unit", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => handleFormChange("unitPrice", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => handleFormChange("expiryDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shelfLife">Shelf Life (days)</Label>
                <Input
                  id="shelfLife"
                  type="number"
                  value={form.shelfLife}
                  onChange={(e) => handleFormChange("shelfLife", e.target.value)}
                  placeholder="e.g., 7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Delivery Options *</Label>
              <div className="flex flex-wrap gap-2">
                {deliveryOptions.map(option => (
                  <Button
                    key={option}
                    type="button"
                    variant={form.deliveryOptions.includes(option) ? "default" : "outline"}
                    className="flex items-center space-x-1"
                    onClick={() => handleMultiSelect(option)}
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                placeholder="e.g., Organic, Local produce, Best quality"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVisible"
                checked={form.isVisible}
                onCheckedChange={(checked) => handleFormChange("isVisible", checked)}
              />
              <Label htmlFor="isVisible">Visible to vendors</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">Upload CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>CSV should have columns: name, category, quantity, unit, price_per_unit, delivery_modes, shelf_life</p>
              <p>Example: Tomatoes, Vegetables, 100, kg, 20, "Door Delivery,Bulk Pickup", 7</p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsBulkUploadOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 