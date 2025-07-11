
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

  const submitVerification = async (documentPhoto: File) => {
    setIsSubmitting(true);
    try {
      if (!userId) throw new Error('No authenticated user found');
      if (!address) throw new Error('Wallet address not connected');

      // Buscar dados existentes de idade do usuário
      const { data: existingData, error: fetchError } = await supabase
        .from('age_verification')
        .select('birth_date, estimated_age')
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingData) {
        throw new Error('Age data not found. Please complete your profile first.');
      }

      // Upload da foto do documento
      const filePath = `documents/${address}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('selfies')
        .upload(filePath, documentPhoto);
        
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('selfies')
        .getPublicUrl(filePath);

      // Simular análise de IA - aqui você integraria com seu modelo ML
      const aiAnalysisResult = await simulateAIAgeAnalysis(documentPhoto, existingData.estimated_age);
      
      // Verificar se a idade é compatível (tolerância de ±3 anos)
      const ageDifference = Math.abs(aiAnalysisResult.estimatedAge - existingData.estimated_age);
      const isAgeCompatible = ageDifference <= 3;
      
      // Determinar status final baseado na análise
      const finalStatus = isAgeCompatible && aiAnalysisResult.isOver18 ? 'verified' : 'rejected';
      
      // Gerar hash de compromisso para a blockchain
      const commitmentHash = `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}` as `0x${string}`;

      // Criar atestação na blockchain apenas se verificado
      if (finalStatus === 'verified') {
        await createAttestation(commitmentHash, 'age-verification');
      }

      // Atualizar registro no banco de dados
      const { error: dbError } = await supabase.from('age_verification').update({
        photo_url: publicUrl,
        status: finalStatus,
        commitment_hash: finalStatus === 'verified' ? commitmentHash : null,
        updated_at: new Date().toISOString(),
        // Salvar dados da análise IA sem expor ao usuário
        estimated_age: aiAnalysisResult.estimatedAge,
      }).eq('user_id', userId);

      if (dbError) throw dbError;

      // Mostrar resultado ao usuário de forma discreta
      if (finalStatus === 'verified') {
        toast({
          title: 'Age Verification Successful',
          description: '✅ You have been verified as an adult. Proceeding to next step.',
        });
        navigate('/attestation');
      } else {
        toast({
          title: 'Age Verification Required',
          description: 'Please ensure you are at least 18 years old and your document is recent (max 4 years old).',
          variant: 'destructive',
        });
      }
      
    } catch (err: any) {
      console.error('Age verification error:', err);
      toast({
        title: 'Verification Error',
        description: err?.message || 'An error occurred during verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simular análise de IA - substituir pela integração real com seu modelo ML
  const simulateAIAgeAnalysis = async (photo: File, declaredAge: number) => {
    // Simular delay da análise
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simular resultado da IA baseado na idade declarada com alguma variação
    const variation = Math.floor(Math.random() * 6) - 3; // -3 a +3 anos
    const estimatedAge = Math.max(16, declaredAge + variation);
    
    return {
      estimatedAge,
      isOver18: estimatedAge >= 18,
      confidence: 0.85 + Math.random() * 0.1, // 85-95% de confiança
      documentQuality: Math.random() > 0.2 ? 'good' : 'poor', // 80% boa qualidade
    };
  };

  return { submitVerification, isSubmitting };
}
