
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
      console.log('Saving profile data for user:', userId);
      
      // Verificar se o usuário já existe antes de tentar inserir
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingUser) {
        // Usuário já existe, apenas atualizar
        console.log('User already exists, updating profile...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            username: username.trim(),
            full_name: fullName.trim(),
            avatar_url: avatarUrl?.trim() || null,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          toast({
            title: 'Error',
            description: updateError.message,
            variant: 'destructive',
          });
          return;
        }
      } else {
        // Usuário não existe, criar novo
        console.log('Creating new user profile...');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: username.trim(),
            full_name: fullName.trim(),
            avatar_url: avatarUrl?.trim() || null,
          });

        if (insertError) {
          // Se ainda houver erro de chave duplicada, tentar atualizar
          if (insertError.code === '23505') {
            console.log('Duplicate key error, attempting update instead...');
            const { error: updateError } = await supabase
              .from('users')
              .update({
                username: username.trim(),
                full_name: fullName.trim(),
                avatar_url: avatarUrl?.trim() || null,
              })
              .eq('id', userId);

            if (updateError) {
              console.error('Error updating user profile after duplicate key:', updateError);
              toast({
                title: 'Error',
                description: updateError.message,
                variant: 'destructive',
              });
              return;
            }
          } else {
            console.error('Error inserting user profile:', insertError);
            toast({
              title: 'Error',
              description: insertError.message,
              variant: 'destructive',
            });
            return;
          }
        }
      }
      
      // Verificar se já existe verificação de idade para este usuário
      const { data: existingVerification } = await supabase
        .from('age_verification')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingVerification) {
        // Já existe, apenas atualizar
        const { error: ageUpdateError } = await supabase
          .from('age_verification')
          .update({
            birth_date: birthDate,
            estimated_age: age,
            status: 'pending',
            avatar_url: avatarUrl?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (ageUpdateError) {
          console.error('Error updating age verification:', ageUpdateError);
          toast({
            title: 'Error',
            description: ageUpdateError.message,
            variant: 'destructive',
          });
          return;
        }
      } else {
        // Criar nova verificação de idade
        const { error: ageError } = await supabase
          .from('age_verification')
          .insert({
            user_id: userId,
            birth_date: birthDate,
            estimated_age: age,
            status: 'pending',
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
      }

      toast({
        title: 'Profile Created Successfully!',
        description: 'Please proceed to document verification.',
      });
      
      // Navegar para verificação de documento (não mais para ZK verification)
      navigate('/age-verification');
      
    } catch (err: any) {
      console.error('Profile submission error:', err);
      
      toast({
        title: 'Error',
        description: err?.message || 'An error occurred during profile creation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitProfile, isSubmitting, calculateAge };
}
