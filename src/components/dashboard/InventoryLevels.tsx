
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Fetch top 6 medications from Supabase
const fetchTopMedications = async () => {
  const { data, error } = await supabase
    .from('inventory')
    .select('name, stock, category')
    .order('stock', { ascending: false })
    .limit(6);
  
  if (error) {
    console.error('Error fetching top medications:', error);
    throw error;
  }
  
  return data || [];
};

export function InventoryLevels() {
  const { data: inventoryData, isLoading, isError } = useQuery({
    queryKey: ['top-medications'],
    queryFn: fetchTopMedications
  });
  
  const colors = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f43f5e", // rose
    "#0ea5e9", // sky
  ];
  
  // Transform data for chart
  const chartData = inventoryData?.map((item, index) => ({
    name: item.name,
    quantity: item.stock,
    color: colors[index % colors.length],
  })) || [];
  
  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">Inventory Levels</CardTitle>
        <p className="text-sm text-muted-foreground">Current stock levels of key medications</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : isError ? (
            <div className="h-full w-full flex items-center justify-center text-red-500">
              Unable to load inventory data
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              No inventory data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.95)", 
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    border: "none"
                  }}
                  labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                />
                <Bar 
                  dataKey="quantity" 
                  radius={[6, 6, 0, 0]}
                  name="Quantity"
                  barSize={30}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
