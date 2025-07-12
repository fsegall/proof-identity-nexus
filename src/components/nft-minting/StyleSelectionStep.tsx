
import { Zap, Crown, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface StyleSelectionStepProps {
  avatarPreview: string;
  isGeneratingStyle: boolean;
  selectedStyle: string;
  generationProgress: string;
  generateStyledAvatar: (style: string) => void;
  onBack: () => void;
  skipStyling: () => void;
}

const styles = [
  { id: 'cyberpunk', name: 'Cyberpunk', icon: Zap, description: 'Futuristic neon aesthetic' },
  { id: 'fantasy', name: 'Fantasy', icon: Crown, description: 'Magical medieval style' },
  { id: 'artistic', name: 'Artistic', icon: Palette, description: 'Abstract art style' },
  { id: 'minimal', name: 'Minimal', icon: Sparkles, description: 'Clean and simple' }
];

export const StyleSelectionStep = ({
  avatarPreview,
  isGeneratingStyle,
  selectedStyle,
  generationProgress,
  generateStyledAvatar,
  onBack,
  skipStyling
}: StyleSelectionStepProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
          <img 
            src={avatarPreview} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {styles.map((style) => {
          const IconComponent = style.icon;
          return (
            <Button
              key={style.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/5"
              onClick={() => generateStyledAvatar(style.name.toLowerCase())}
              disabled={isGeneratingStyle}
            >
              <IconComponent className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-medium">{style.name}</div>
                <div className="text-sm text-muted-foreground">{style.description}</div>
              </div>
            </Button>
          );
        })}
      </div>

      {isGeneratingStyle && (
        <div className="text-center p-6 bg-muted/20 rounded-lg">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="font-medium">Generating {selectedStyle} Style...</p>
          {generationProgress && (
            <p className="text-sm text-muted-foreground mt-2">{generationProgress}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
        </div>
      )}
      
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={skipStyling}>
            Skip Styling
          </Button>
        </div>
      </div>
    </div>
  );
};
