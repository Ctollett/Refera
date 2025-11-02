import FileDropzone from "./FileDropzone";

interface MixUploadProps {
  sessionId?: string;
}

export default function MixUpload({ sessionId }: MixUploadProps) {
  const handleFileSelect = async (file: File) => {
    console.log("Selected file", {
      name: file.name,
      size: file.size,
      type: file.type,
      sessionId,
    });

    // TODO: Add audio analysis here later
    alert(`File selected: ${file.name} (${Math.round(file.size / (1024 * 1024))}MB)`);
    // TODO: await addMixVersion(sessionId, analysisData);
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Upload Mix Version</h3>
      <FileDropzone
        onFileSelect={handleFileSelect}
        accept=".mp3,.wav,.aiff"
        maxSize={100 * 1024 * 1024} // 100MB
        label="Drop your mix file here"
      />
    </div>
  );
}
