import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { api, DEPARTMENT_STRUCTURE } from "../lib/utils";
import FileUpload from "../components/ui/file-upload";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";

// Helper function to check if user is a manager (HR, Finance, Admin)
const isUserManager = (user) => {
  if (!user) return false;

  // Check isManager property
  if (user.isManager === true) return true;

  // Check role for manager keywords
  const role = user.role?.toUpperCase() || "";
  const roleKeywords = ["MANAGER", "ADMIN", "HR", "FINANCE", "EXECUTIVE"];
  if (roleKeywords.some((keyword) => role.includes(keyword))) return true;

  // Check department
  const managerDepartments = ["HR", "Finance", "ADMIN"];
  if (managerDepartments.includes(user.department)) return true;

  return false;
};

const EditTicket = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    department: "",
    priority: "MEDIUM",
    category: "",
    subcategory: "",
    comment: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [allFiles, setAllFiles] = useState([]);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tickets/${id}`);
      const ticketData = response.ticket || response;

      // Check if user can edit this ticket
      // Managers can edit any ticket, employees can only edit OPEN/RE_OPEN tickets
      const isManager = isUserManager(user);
      if (!isManager && !["OPEN", "RE_OPEN"].includes(ticketData.status)) {
        toast.error("This ticket cannot be edited");
        navigate(isManager ? "/dashboard" : "/my-tickets");
        return;
      }

      setTicket(ticketData);

      // Extract actual subject by removing the [Category - SubCategory] prefix
      let cleanSubject = ticketData.subject || "";
      if (cleanSubject.startsWith("[") && cleanSubject.includes("]")) {
        const closingBracketIndex = cleanSubject.indexOf("]");
        if (closingBracketIndex !== -1) {
          cleanSubject = cleanSubject.substring(closingBracketIndex + 1).trim();
        }
      }

      setFormData({
        subject: cleanSubject,
        description: ticketData.description || "",
        department: ticketData.department || "",
        priority: ticketData.priority || "MEDIUM",
        category: ticketData.category || "",
        subcategory: ticketData.subcategory || "",
        comment: ticketData.comment || "",
        status: ticketData.status || "",
      });

      // Load existing files from backend
      setAllFiles(ticketData.files || []);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      toast.error("Failed to load ticket details");
      navigate(isUserManager(user) ? "/dashboard" : "/my-tickets");
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchTicket();
  }, [id, fetchTicket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Prepare update data including file operations
      const updateData = {
        ...formData,
        files: allFiles,
      };

      await api.put(`/api/tickets/${id}`, updateData);
      toast.success("Ticket updated successfully!");
      navigate(isUserManager(user) ? "/dashboard" : "/my-tickets");
    } catch (error) {
      toast.error("Failed to update ticket");
      console.error("Failed to update ticket:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset category and subcategory when department changes
      if (field === "department") {
        newData.category = "";
        newData.subcategory = "";
      } else if (field === "category") {
        newData.subcategory = "";
      }

      return newData;
    });
  };

  const categories = formData.department
    ? Object.keys(DEPARTMENT_STRUCTURE[formData.department] || {})
    : [];

  const subcategories =
    formData.category && formData.department
      ? DEPARTMENT_STRUCTURE[formData.department][formData.category] || []
      : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Ticket</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">Loading ticket details...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(isUserManager(user) ? "/dashboard" : "/my-tickets")
              }
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {isUserManager(user) ? "Back to Dashboard" : "Back to My Tickets"}
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Ticket #{ticket?.id}
          </h1>
          <p className="text-gray-600 mt-2">
            Make changes to your ticket details
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Ticket Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full-width fields */}
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <Label
                  htmlFor="subject"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={handleInputChange("subject")}
                  placeholder="Brief description of the issue"
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  required
                  className="w-full resize-none"
                />
              </div>
            </div>

            {/* Two-column grid for dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <Label
                  htmlFor="priority"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={handleInputChange("priority")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div>
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={handleInputChange("department")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category - Shows only after Department is selected */}
              {formData.department && (
                <div className="animate-in slide-in-from-top duration-300">
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700 mb-1.5 block"
                  >
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleInputChange("category")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Subcategory - Shows only after Category is selected */}
              {formData.category && formData.department && (
                <div className="animate-in slide-in-from-top duration-300">
                  <Label
                    htmlFor="subcategory"
                    className="text-sm font-medium text-gray-700 mb-1.5 block"
                  >
                    Subcategory
                  </Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={handleInputChange("subcategory")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status - Editable for managers, read-only for employees */}
              <div className="animate-in slide-in-from-top duration-300">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Status
                </Label>
                {isUserManager(user) && ticket?.createdBy !== user?.id ? (
                  <Select
                    value={formData.status}
                    onValueChange={handleInputChange("status")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-sm">
                    <span className="font-medium">
                      {formData.status?.replace("_", " ") || "Not Set"}
                    </span>
                    <span className="text-gray-500 ml-2">(View Only)</span>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Upload Files
              </Label>
              <FileUpload
                value={allFiles}
                onChange={setAllFiles}
                maxFiles={5}
                maxSizeMB={10}
                disabled={updating}
              />
            </div>

            {/* Comment Field */}
            <div>
              <Label
                htmlFor="comment"
                className="text-sm font-medium text-gray-700 mb-1.5 block"
              >
                Comment <span className="text-gray-400">(Optional)</span>
              </Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={handleInputChange("comment")}
                placeholder="Add any additional comments or notes..."
                rows={3}
                className="w-full resize-none font-poppins"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" disabled={updating} className="px-6">
                {updating ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Ticket
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(isUserManager(user) ? "/dashboard" : "/my-tickets")
                }
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTicket;
