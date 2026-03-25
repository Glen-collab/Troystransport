import ManageFeedYards from '@/components/manage/ManageFeedYards';
import ManageFarms from '@/components/manage/ManageFarms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Manage() {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-1">Manage</h2>
      <p className="text-sm text-muted-foreground mb-6">Manage feed yards and farms.</p>

      <Tabs defaultValue="feedyards">
        <TabsList className="mb-4">
          <TabsTrigger value="feedyards">Feed Yards</TabsTrigger>
          <TabsTrigger value="farms">Farms</TabsTrigger>
        </TabsList>
        <TabsContent value="feedyards"><ManageFeedYards /></TabsContent>
        <TabsContent value="farms"><ManageFarms /></TabsContent>
      </Tabs>
    </div>
  );
}
