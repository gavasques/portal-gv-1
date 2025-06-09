import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

interface ListViewToggleProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
}

export function ListViewToggle({ view, onViewChange }: ListViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="h-8 w-8 p-0"
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  );
}
