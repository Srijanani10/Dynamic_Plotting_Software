import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const FileUpload = ({ onFileUpload }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"], // Support older Excel files
    },
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setError("Invalid file type. Please upload a CSV or Excel file.");
        return;
      }

      setError("");
      setFiles(acceptedFiles);
      onFileUpload(acceptedFiles);
    },
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #ccc",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <input {...getInputProps()} />
      <p>Drag & drop CSV or Excel files here, or click to select files</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {files.map((file) => (
          <li key={file.name}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
