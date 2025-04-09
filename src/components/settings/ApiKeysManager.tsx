
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, PlusCircle, SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ApiKey = {
  id: string
  prefix: string
  key: string
  createdAt: Date
  scopes: string[]
}

export function ApiKeysManager() {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const { toast } = useToast();

  function generateApiKey() {
    const prefix = Math.random().toString(36).substring(2, 7)
    const key = Math.random().toString(36).substring(2)

    return {
      id: Math.random().toString(36).substring(2),
      prefix,
      key,
      createdAt: new Date(),
      scopes: ["store:read", "store:write"],
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Keys</h3>
        <p className="text-sm text-muted-foreground">
          Manage your API keys
        </p>
      </div>
      
      <Table>
        <TableCaption>A list of your API keys.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Prefix</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.prefix}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Input
                    value={key.key}
                    readOnly
                    className="w-[300px] font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(key.key)
                      toast({
                        title: "Copied to clipboard.",
                      })
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{key.createdAt.toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      View scopes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Edit scopes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500 focus:text-red-500">
                      Revoke
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>
              <Button
                onClick={() => {
                  const newKey = generateApiKey()
                  setApiKey(newKey)
                  setApiKeys((prev) => [...prev, newKey])
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Generate Key
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
