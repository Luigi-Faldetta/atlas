import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebScraper from "@/components/WebScraper";
import ROICalculator from "@/components/ROICalculator";
import { Calculator, Search } from "lucide-react";

export default function ToolsPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
          Atlas Investment Tools
        </h1>
        <p className="text-lg mb-8 text-slate-600 dark:text-slate-300">
          Analyze properties and calculate potential returns on your real estate investments.
        </p>
        
        <Tabs defaultValue="webscraper" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="webscraper" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Property Analyzer
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              ROI Calculator
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="webscraper">
            <WebScraper />
          </TabsContent>
          
          <TabsContent value="calculator">
            <ROICalculator />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 