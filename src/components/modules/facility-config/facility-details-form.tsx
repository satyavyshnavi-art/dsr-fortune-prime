"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FacilityDetails {
  type: string;
  siteName: string;
  city: string;
  location: string;
  clientName: string;
  position: string;
  contactNumber: string;
  email: string;
}

const initialDetails: FacilityDetails = {
  type: "residential",
  siteName: "GreenView Demo Park",
  city: "Bangalore",
  location: "Whitefield, Bangalore, Karnataka 560066",
  clientName: "GreenView Properties Pvt Ltd",
  position: "Facility Manager",
  contactNumber: "+91 9876543210",
  email: "fadmin@spotworks.in",
};

export function FacilityDetailsForm() {
  const [details, setDetails] = useState<FacilityDetails>(initialDetails);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof FacilityDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = () => {
    const errs: Record<string, boolean> = {};
    if (!details.siteName.trim()) errs.siteName = true;
    if (!details.city.trim()) errs.city = true;
    if (!details.email.trim()) errs.email = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Facility details updated");
  };

  return (
    <div className="space-y-4">
      {/* Facility Type Configuration */}
      <Card className="shadow-none border-slate-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="rounded-md bg-blue-50 p-1.5">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-slate-800">
                Facility Type Configuration
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Customizes available services based on your facility type.
              </p>
            </div>
          </div>

          <Select
            value={details.type}
            onValueChange={(val) => handleChange("type", val as string)}
          >
            <SelectTrigger className="w-full h-8 text-[12px]">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <SelectValue placeholder="Select facility type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential" className="text-[12px]">Residential</SelectItem>
              <SelectItem value="corporate" className="text-[12px]">Corporate</SelectItem>
              <SelectItem value="industrial" className="text-[12px]">Industrial</SelectItem>
              <SelectItem value="other" className="text-[12px]">Other</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Facility Details */}
      <Card className="shadow-none border-slate-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="rounded-md bg-blue-50 p-1.5">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-slate-800">
                Facility Details
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configure basic information and contact details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Site Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={details.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                className={`h-8 text-[12px] ${errors.siteName ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {errors.siteName && <p className="text-[10px] text-red-500 mt-0.5">Site name is required</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                value={details.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={`h-8 text-[12px] ${errors.city ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {errors.city && <p className="text-[10px] text-red-500 mt-0.5">City is required</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              value={details.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="h-8 text-[12px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={details.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Position <span className="text-red-500">*</span>
              </Label>
              <Input
                value={details.position}
                onChange={(e) => handleChange("position", e.target.value)}
                className="h-8 text-[12px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <Input
                value={details.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                value={details.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`h-8 text-[12px] ${errors.email ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-0.5">Email is required</p>}
            </div>
          </div>

          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-3" onClick={handleSubmit}>
            <CheckCircle className="h-3.5 w-3.5" />
            Update Facility Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
