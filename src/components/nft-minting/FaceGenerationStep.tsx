import { useState } from 'react';
import { Wand2, Sparkles, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface FaceGenerationStepProps {
  avatarPreview: string | null;
  isGenerating: boolean;
  onGenerate: (prompt: string, photoFile?: File) => void;
  onNext: () => void;
  onBack: () => void;
}

export const FaceGenerationStep = ({
  avatarPreview,
  isGenerating,
  onGenerate,
  onNext,
  onBack
}: FaceGenerationStepProps) => {
  const [prompt, setPrompt] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt.trim(), photoFile || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating && prompt.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe the avatar you want to generate</Label>
          <Input
            id="prompt"
            placeholder="e.g., professional style, artistic portrait, cyberpunk aesthetic..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isGenerating}
            className="w-full"
          />
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="photo">Upload your photo (optional)</Label>
          <div className="flex items-center gap-4">
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isGenerating}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('photo')?.click()}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {photoFile ? 'Change Photo' : 'Upload Photo'}
            </Button>
            
            {photoPreview && (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removePhoto}
                  disabled={isGenerating}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {photoFile ? 'AI will create an avatar based on your photo and description' : 'Add a photo to create a personalized avatar'}
          </p>
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating Avatar...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Avatar
            </>
          )}
        </Button>
      </div>

      {/* Preview Section */}
      {avatarPreview && (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-64 h-64 rounded-lg overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
            <img 
              src={avatarPreview} 
              alt="Generated Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Your AI-generated avatar is ready! You can generate a new one or proceed to styling.
            </p>
          </div>
        </div>
      )}

      {/* Example prompts */}
      {!avatarPreview && !isGenerating && (
        <div className="bg-muted/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Example prompts:
          </h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• "Professional portrait with modern lighting"</p>
            <p>• "Artistic style with vibrant colors"</p>
            <p>• "Cyberpunk aesthetic with neon elements"</p>
            <p>• "Minimalist portrait with clean background"</p>
            <p className="mt-2 font-medium">Tip: Upload your photo for a personalized result!</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        {avatarPreview && (
          <Button onClick={onNext}>
            Continue to Styling
          </Button>
        )}
      </div>
    </div>
  );
};