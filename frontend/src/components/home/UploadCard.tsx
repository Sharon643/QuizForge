import type { Dispatch, SetStateAction } from "react";
import Button from "../ui/Button";

interface UploadCardProps {
  file: File | null;
  loading: boolean;
  onFileChange: Dispatch<SetStateAction<File | null>>;
  onExtract: () => Promise<void>;
}

function UploadCard({ file, loading, onFileChange, onExtract }: UploadCardProps) {
  return (
    <div className="rounded-xl border p-6 space-y-4">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {file && <p className="text-sm text-gray-500">{file.name}</p>}
      <Button onClick={onExtract} disabled={!file || loading}>
        {loading ? "Extracting..." : "Extract"}
      </Button>
    </div>
  );
}

export default UploadCard;