
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { zkApiClient } from '@/services/zkApi';

interface ProfileData {
  username: string;
  fullName: string;
  birthDate: string;
  avatarUrl: string | null;
}

export function useOnboarding(userId: string | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const dateToUnixTimestamp = (dateString: string): number => {
    return Math.floor(new Date(dateString).getTime() / 1000);
  };

  const submitProfile = async ({ username, fullName, birthDate, avatarUrl }: ProfileData) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    // Validar se o usuário tem pelo menos 18 anos
    const age = calculateAge(birthDate);
    if (age < 18) {
      toast({
        title: 'Age Verification Required',
        description: 'You must be at least 18 years old to use this service',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Only save to age_verification table for now (skip users table to avoid RLS issues with mock user)
      console.log('Saving profile data for user:', userId);
      
      // Salvar data de nascimento na tabela de verificação de idade
      const { error: ageError } = await supabase.from('age_verification').upsert({
        user_id: userId,
        birth_date: birthDate,
        estimated_age: age,
        status: 'processing',
        avatar_url: avatarUrl?.trim() || null,
      });

      if (ageError) {
        console.error('Error saving age verification:', ageError);
        toast({
          title: 'Error',
          description: ageError.message,
          variant: 'destructive',
        });
        return;
      }

      console.log('Starting ZK age verification...');

      // Usar a nova API ZK para verificar idade
      const birthDateTimestamp = dateToUnixTimestamp(birthDate);
      const verificationResult = await zkApiClient.verifyAge(birthDateTimestamp, 18);

      console.log('ZK verification result:', verificationResult);

      // Determinar status baseado na verificação
      const finalStatus = verificationResult.valid && verificationResult.isOldEnough ? 'verified' : 'rejected';
      
      // Atualizar status no banco de dados
      const { error: updateError } = await supabase
        .from('age_verification')
        .update({
          status: finalStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating verification status:', updateError);
      }

      if (finalStatus === 'verified') {
        toast({
          title: 'Profile Created Successfully!',
          description: '✅ Your age has been verified using zero-knowledge proofs.',
        });
        navigate('/age-verification');
      } else {
        toast({
          title: 'Age Verification Failed',
          description: 'Unable to verify your age. Please check your information and try again.',
          variant: 'destructive',
        });
      }
      
    } catch (err: any) {
      console.error('Profile submission error:', err);
      
      // Atualizar status como falhou no caso de erro
      if (userId) {
        await supabase
          .from('age_verification')
          .update({
            status: 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
      
      toast({
        title: 'Error',
        description: err?.message || 'An error occurred during age verification',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitProfile, isSubmitting, calculateAge };
}
