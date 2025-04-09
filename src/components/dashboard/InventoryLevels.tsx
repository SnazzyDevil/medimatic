
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Type for chart data items
interface ChartItem {
  id: string;
  name: string;
  quantity: number;
  color: string;
  cost: number;
  category: string;
}

// Function to fetch inventory data for the chart
const fetchInventoryData = async (): Promise<ChartItem[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('id, name, stock, category, unit_cost')
    .order('stock', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  
  if (!Array.isArray(data)) {
    console.error("Expected array but got:", data);
    return [];
  }
  
  // Map and transform the data for the chart
  return data.map((item, index) => {
    // Alternate colors for better visualization
    const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    const colorIndex = index % colors.length;
    
    return {
      id: item.id,
      name: item.name,
      quantity: item.stock,
      color: colors[colorIndex],
      cost: item.unit_cost,
      category: item.category,
    };
  });
};

export function InventoryLevels() {
  const { data: inventoryData, isLoading, isError } = useQuery({
    queryKey: ['inventory-levels'],
    queryFn: fetchInventoryData
  });

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Inventory Levels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">Loading inventory data...</div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-red-500">Error loading inventory data</div>
          ) : inventoryData && inventoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inventoryData}
                margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === "quantity") return [`${value} units`, "Stock"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Item: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="quantity" 
                  name="Stock" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">No inventory data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
