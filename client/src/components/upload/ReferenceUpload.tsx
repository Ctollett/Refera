import FileDropzone from "./FileDropzone";

interface ReferenceUploadProps {
  sessionId?: string;
}

export default function ReferenceUpload({ sessionId }: ReferenceUploadProps) {
  const handleFileSelect = (file: File) => {
    console.log("Selected file:", {
      name: file.name,
      size: file.size,
      type: file.type,
      sessionId,
    });

    // TODO: Add audio analysis here later
    alert(`File selected: ${file.name} (${Math.round(file.size / (1024 * 1024))}MB)`);
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Upload Reference Track</h3>
      <FileDropzone
        onFileSelect={handleFileSelect}
        accept=".mp3,.wav,.aiff"
        maxSize={100 * 1024 * 1024} // 100MB
        label="Drop your reference track here"
      />
    </div>
  );
}
