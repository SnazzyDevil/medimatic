
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";

const data = [
  { name: "Antibiotics", quantity: 130, color: "#6366f1" }, // indigo-500
  { name: "Painkillers", quantity: 85, color: "#8b5cf6" },  // violet-500
  { name: "Antivirals", quantity: 40, color: "#ec4899" },   // pink-500
  { name: "Vaccines", quantity: 35, color: "#14b8a6" },     // teal-500
  { name: "IV Fluids", quantity: 20, color: "#f43f5e" },    // rose-500
  { name: "Sedatives", quantity: 65, color: "#0ea5e9" },    // sky-500
];

export function InventoryLevels() {
  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">Inventory Levels</CardTitle>
        <p className="text-sm text-muted-foreground">Current stock levels of key medications</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
                domain={[0, 160]}
                ticks={[0, 40, 80, 120, 160]}
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
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
