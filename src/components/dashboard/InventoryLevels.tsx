
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Antibiotics", quantity: 130, color: "#3E95FB" },
  { name: "Painkillers", quantity: 85, color: "#3E95FB" },
  { name: "Antivirals", quantity: 40, color: "#FFC107" },
  { name: "Vaccines", quantity: 35, color: "#3E95FB" },
  { name: "IV Fluids", quantity: 20, color: "#F44336" },
  { name: "Sedatives", quantity: 65, color: "#3E95FB" },
];

export function InventoryLevels() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Inventory Levels</CardTitle>
        <p className="text-sm text-muted-foreground">Current stock levels of key medications</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 160]}
                ticks={[0, 40, 80, 120, 160]}
              />
              <Tooltip />
              <Bar 
                dataKey="quantity" 
                radius={[4, 4, 0, 0]}
                fill="#3E95FB"
                name="Quantity"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
