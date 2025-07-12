
import { User, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvatarUploadStepProps {
  avatarPreview: string | null;
  avatarFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AvatarUploadStep = ({
  avatarPreview,
  avatarFile,
  fileInputRef,
  handleAvatarUpload,
  onNext,
  onBack
}: AvatarUploadStepProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Avatar preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-16 w-16 text-white" />
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          className="h-auto p-6 flex items-center justify-center gap-3"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium">Upload Avatar</div>
            <div className="text-sm text-muted-foreground">JPG, PNG up to 10MB</div>
          </div>
        </Button>
      </div>
      
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!avatarFile}
          className="btn-gradient"
        >
          Continue to Styling
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </div>
  );
};
