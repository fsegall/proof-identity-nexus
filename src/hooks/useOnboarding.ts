
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { zkApiClient, ZKAttestInput } from '@/services/zkApi';

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
  const [zkRequestId, setZkRequestId] = useState<string | null>(null);

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
      // Salvar perfil do usuário
      const { error: profileError } = await supabase.from('users').upsert({
        id: userId,
        username: username.trim(),
        full_name: fullName.trim(),
        avatar_url: avatarUrl?.trim() || null,
      });

      if (profileError) {
        toast({
          title: 'Error',
          description: profileError.message,
          variant: 'destructive',
        });
        return;
      }

      // Salvar data de nascimento na tabela de verificação de idade
      const { error: ageError } = await supabase.from('age_verification').upsert({
        user_id: userId,
        birth_date: birthDate,
        estimated_age: age,
        status: 'processing', // Mudamos para 'processing' pois estamos enviando para ZK API
        avatar_url: avatarUrl?.trim() || null,
      });

      if (ageError) {
        toast({
          title: 'Error',
          description: ageError.message,
          variant: 'destructive',
        });
        return;
      }

      // Preparar dados para ZK API
      const zkInput: ZKAttestInput = {
        userId: userId,
        circuit: 'ageVerifier',
        params: {
          birthDate: dateToUnixTimestamp(birthDate),
          minAge: 18,
          currentDate: dateToUnixTimestamp(new Date().toISOString()),
        }
      };

      console.log('Sending to ZK API:', zkInput);

      // Enviar para ZK API
      const zkResponse = await zkApiClient.submitAttestation(zkInput);
      setZkRequestId(zkResponse.requestId);

      console.log('ZK API Response:', zkResponse);

      // Salvar o requestId no banco de dados
      const { error: updateError } = await supabase
        .from('age_verification')
        .update({
          commitment_hash: zkResponse.requestId, // Usando commitment_hash para armazenar o requestId temporariamente
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating with ZK request ID:', updateError);
      }

      toast({
        title: 'Profile Created Successfully!',
        description: 'Age verification is being processed. You will be redirected to track the progress.',
      });
      
      // Navegar para a página de geração de prova
      navigate('/proof-generation');
      
    } catch (err: any) {
      console.error('Profile submission error:', err);
      toast({
        title: 'Error',
        description: err?.message || 'An error occurred while creating your profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitProfile, isSubmitting, calculateAge, zkRequestId };
}
