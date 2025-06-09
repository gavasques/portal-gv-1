import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFiltersProps {
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
  onSearch: (query: string, filters: Record<string, string>) => void;
  className?: string;
}

export function SearchFilters({
  searchPlaceholder = "Buscar...",
  filters = [],
  onSearch,
  className = "",
}: SearchFiltersProps) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleSearch = () => {
    onSearch(query, filterValues);
  };

  const handleClear = () => {
    setQuery("");
    setFilterValues({});
    onSearch("", {});
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filterValues };
    if (value === "all") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilterValues(newFilters);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          Buscar
        </Button>
        {(query || Object.keys(filterValues).length > 0) && (
          <Button variant="outline" onClick={handleClear}>
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-[150px]">
              <Select
                value={filterValues[filter.key] || "all"}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
