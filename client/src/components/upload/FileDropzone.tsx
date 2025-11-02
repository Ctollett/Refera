import { useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function FileDropzone({
  onFileSelect,
  accept,
  maxSize,
  disabled = false,
  label = "Drop file here or click to browse",
  className = "",
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0] as { errors?: { code: string }[] };
      const errorCode = rejection.errors?.[0]?.code;
      if (errorCode === "file-too-large") {
        setError("File too big!");
      } else if (errorCode === "file-invalid-type") {
        setError("Wrong file type!");
      } else {
        setError("Something went wrong!");
      }
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
      return;
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "audio/*": accept.split(","), // Convert ".mp3,.wav,.aiff" to array
    },
    maxSize,
    multiple: false,
    disabled,
  });

  const getDropzoneClasses = () => {
    let classes =
      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ";

    if (disabled) {
      classes += "border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed ";
    } else if (isDragReject || error) {
      classes += "border-red-300 bg-red-50 text-red-600 "; // Red when invalid file
    } else if (isDragAccept) {
      classes += "border-green-300 bg-green-50 text-green-600 "; // Green when valid file
    } else if (isDragActive) {
      classes += "border-blue-300 bg-blue-50 text-blue-600 "; // Blue when dragging
    } else {
      classes += "border-gray-300 hover:border-gray-400 text-gray-600 "; // Default
    }

    return classes + className;
  };

  return (
    <>
      <div {...getRootProps({ className: getDropzoneClasses() })}>
        <input {...getInputProps()} />
        <p>{label}</p>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </>
  );
}
