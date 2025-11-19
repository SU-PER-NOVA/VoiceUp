import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locationAPI, categoryAPI } from "@/lib/api";

interface FilterSidebarProps {
  filters: {
    category: number | null;
    state: number | null;
    district: number | null;
    city: number | null;
    scope: string | null;
    sort_by: 'trending' | 'recent' | 'votes' | 'comments';
  };
  onFiltersChange: (filters: any) => void;
}

export const FilterSidebar = ({ filters, onFiltersChange }: FilterSidebarProps) => {
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filters.state) {
      loadDistricts(filters.state);
    } else {
      setDistricts([]);
      setCities([]);
    }
  }, [filters.state]);

  useEffect(() => {
    if (filters.district) {
      loadCities(filters.district);
    } else {
      setCities([]);
    }
  }, [filters.district]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('FilterSidebar: Loading data...');
      const [statesData, categoriesData] = await Promise.all([
        locationAPI.getStates(),
        categoryAPI.getAll(),
      ]);
      
      console.log('FilterSidebar: Raw states data:', statesData);
      console.log('FilterSidebar: Raw categories data:', categoriesData);
      
      // Ensure we always set arrays
      const statesArray = Array.isArray(statesData) ? statesData : [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      
      setStates(statesArray);
      setCategories(categoriesArray);
      
      console.log('FilterSidebar: States set to:', statesArray.length, 'items');
      console.log('FilterSidebar: Categories set to:', categoriesArray.length, 'items');
    } catch (error) {
      console.error('FilterSidebar: Failed to load filter data:', error);
      // Set empty arrays on error to prevent crashes
      setStates([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDistricts = async (stateId: number) => {
    try {
      const districtsData = await locationAPI.getDistricts(stateId);
      setDistricts(Array.isArray(districtsData) ? districtsData : []);
    } catch (error) {
      console.error('Failed to load districts:', error);
      setDistricts([]);
    }
  };

  const loadCities = async (districtId: number) => {
    try {
      const citiesData = await locationAPI.getCities(districtId);
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setCities([]);
    }
  };

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-6 shadow-card sticky top-20">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Filters</h2>
      
      {/* Sort By */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">Sort By</Label>
        <RadioGroup 
          value={filters.sort_by} 
          onValueChange={(value) => updateFilter('sort_by', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="trending" id="trending" />
            <Label htmlFor="trending" className="cursor-pointer">Trending</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recent" id="recent" />
            <Label htmlFor="recent" className="cursor-pointer">Most Recent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="votes" id="votes" />
            <Label htmlFor="votes" className="cursor-pointer">Most Voted</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comments" id="comments" />
            <Label htmlFor="comments" className="cursor-pointer">Most Discussed</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator className="my-6" />

      {/* Category */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">Category</Label>
        <Select 
          value={filters.category?.toString() || "all"} 
          onValueChange={(value) => updateFilter('category', value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {isLoading ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              Array.isArray(categories) && categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-6" />

      {/* Location Filters */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">Location</Label>
        <div className="space-y-3">
          <Select 
            value={filters.state?.toString() || "all"} 
            onValueChange={(value) => updateFilter('state', value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {Array.isArray(states) && states.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.district?.toString() || "all"} 
            onValueChange={(value) => updateFilter('district', value === 'all' ? null : parseInt(value))}
            disabled={!filters.state}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {Array.isArray(districts) && districts.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.city?.toString() || "all"} 
            onValueChange={(value) => updateFilter('city', value === 'all' ? null : parseInt(value))}
            disabled={!filters.district}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {Array.isArray(cities) && cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Scope */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Scope</Label>
        <RadioGroup 
          value={filters.scope || "all"} 
          onValueChange={(value) => updateFilter('scope', value === 'all' ? null : value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer">All India</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="state" id="state" />
            <Label htmlFor="state" className="cursor-pointer">State Level</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="district" id="district" />
            <Label htmlFor="district" className="cursor-pointer">District Level</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="city" id="city" />
            <Label htmlFor="city" className="cursor-pointer">City Level</Label>
          </div>
        </RadioGroup>
      </div>
    </Card>
  );
};
