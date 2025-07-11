const API_BASE_URL = process.env.REACT_APP_API_URL || "";

const sanitizeFilename = (filename) => {
  // Remove spaces and special characters, keep only alphanumeric, dots, hyphens, and underscores
  return filename
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, "") // Remove special characters except dots, hyphens, underscores
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single underscore
    .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
};

// ✅ Function to validate and sanitize files before upload
const validateAndSanitizeFiles = (files) => {
  const sanitizedFiles = [];
  const warnings = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const originalName = file.name;
    const sanitizedName = sanitizeFilename(originalName);

    // Check if filename was changed
    if (originalName !== sanitizedName) {
      warnings.push({
        original: originalName,
        sanitized: sanitizedName,
        message: `Filename "${originalName}" was sanitized to "${sanitizedName}"`,
      });
    }

    // Create a new File object with sanitized name
    const sanitizedFile = new File([file], sanitizedName, {
      type: file.type,
      lastModified: file.lastModified,
    });

    // Add original name as a property for reference
    sanitizedFile.originalName = originalName;

    sanitizedFiles.push(sanitizedFile);
  }

  return { sanitizedFiles, warnings };
};

export const uploadFiles = async (files) => {
  try {
    const { sanitizedFiles, warnings } = validateAndSanitizeFiles(files);

    // ✅ Log warnings to console (or show to user)
    if (warnings.length > 0) {
      console.warn("File sanitization warnings:", warnings);
      // Optionally, you could show these warnings to the user
      // showWarningsToUser(warnings);
    }

    const formData = new FormData();

    // Add files to FormData
    for (let i = 0; i < sanitizedFiles.length; i++) {
      formData.append("files", sanitizedFiles[i]);
    }

    const token = sessionStorage.getItem(
      "8ee22acb-94b0-481d-b11b-f87168b880e3",
    );

    const response = await fetch(`${API_BASE_URL}/api/tickets/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "File upload failed";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (parseError) {
        // If we can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.files;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

// export const getFileDownloadUrl = async (
//   fileUrl,
//   fileName,
//   fileOriginalName,
// ) => {
//   try {
//     const token = sessionStorage.getItem(
//       "8ee22acb-94b0-481d-b11b-f87168b880e3",
//     );

//     return result.downloadUrl;
//   } catch (error) {
//     console.error("Get download URL error:", error);
//     throw error;
//   }
// };

export const downloadFile = async (fileUrl, fileName, fileOriginalName) => {
  try {
    const token = sessionStorage.getItem(
      "8ee22acb-94b0-481d-b11b-f87168b880e3",
    );

    if (token) {
      fetch(fileUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url); // Cleanup
        })
        .catch((err) => {
          console.error("Download failed:", err);
        });
    }
  } catch (error) {
    console.error("File download error:", error);
    throw error;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateFileType = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
  ];

  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
