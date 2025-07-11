
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCreateAttestation } from '@/hooks/useAttestations';
import { supabase } from '@/integrations/supabase/client';

export function useAgeVerification(userId: string | null, address: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createAttestation } = useCreateAttestation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitVerification = async (birthDate: string, selfie: File) => {
    setIsSubmitting(true);
    try {
      if (!userId) throw new Error('No authenticated user found');
      if (!address) throw new Error('Wallet address not connected');

      // Upload selfie to Supabase storage
      const filePath = `selfies/${address}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('selfies')
        .upload(filePath, selfie);
        
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('selfies')
        .getPublicUrl(filePath);

      // Calculate age
      const age = calculateAge(birthDate);
      if (age < 18) throw new Error('You must be at least 18 years old.');

      // Generate commitment hash
      const commitmentHash = `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}` as `0x${string}`;

      // Create blockchain attestation
      await createAttestation(commitmentHash, 'age-verification');

      // Save to database
      const { error: dbError } = await supabase.from('age_verification').upsert(
        [{
          user_id: userId,
          birth_date: birthDate,
          photo_url: publicUrl,
          estimated_age: age,
          status: 'verified',
          commitment_hash: commitmentHash,
          nft_minted: false,
        }],
        { onConflict: 'user_id' }
      );

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: '✅ Age verified successfully!',
      });
      navigate('/attestation');
    } catch (err: any) {
      console.error('Age verification error:', err);
      toast({
        title: 'Error',
        description: err?.message || 'An error occurred during verification',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return { submitVerification, isSubmitting };
}
