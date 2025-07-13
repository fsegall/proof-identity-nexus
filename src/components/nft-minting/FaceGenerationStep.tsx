import { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface FaceGenerationStepProps {
  avatarPreview: string | null;
  isGenerating: boolean;
  onGenerate: (prompt: string) => void;
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

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt.trim());
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
          <Label htmlFor="prompt">Describe the face you want to generate</Label>
          <Input
            id="prompt"
            placeholder="e.g., young professional woman with glasses, smiling businessman, elderly man with beard..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isGenerating}
            className="w-full"
          />
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating Face...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Face
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
              alt="Generated Face" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Your AI-generated face is ready! You can generate a new one or proceed to styling.
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
            <p>• "Professional businesswoman with short hair"</p>
            <p>• "Young man with glasses and friendly smile"</p>
            <p>• "Elderly wise woman with gray hair"</p>
            <p>• "Creative artist with colorful style"</p>
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