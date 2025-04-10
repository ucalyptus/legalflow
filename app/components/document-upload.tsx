import { useState } from 'react';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        // Store the base64 string without the data URL prefix
        const base64Content = base64String.split(',')[1];
        localStorage.setItem('templateText', base64Content);
        localStorage.setItem('documentMimeType', file.type);
        
        // Update UI to show file name
        setFileName(file.name);
        setUploadStatus('success');
        onUploadComplete?.();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
      />
      {fileName && <p>Selected file: {fileName}</p>}
      {uploadStatus === 'success' && <p className="text-green-600">Upload successful!</p>}
      {uploadStatus === 'error' && <p className="text-red-600">Upload failed</p>}
    </div>
  );
} 