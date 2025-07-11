
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  username: string;
  fullName: string;
  avatarUrl: string | null;
}

export function useOnboarding(userId: string | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitProfile = async ({ username, fullName, avatarUrl }: ProfileData) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('users').upsert({
        id: userId,
        username: username.trim(),
        full_name: fullName.trim(),
        avatar_url: avatarUrl?.trim() || null,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Profile completed successfully!',
      });
      navigate('/proof-generation');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An error occurred while saving your profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitProfile, isSubmitting };
}
