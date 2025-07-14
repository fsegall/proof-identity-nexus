import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Generate Face Function Started ===');
    
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const photoFile = formData.get('photo') as File | null;

    console.log('Request details:', { 
      hasPrompt: !!prompt, 
      hasPhoto: !!photoFile,
      photoSize: photoFile?.size,
      photoType: photoFile?.type,
      hasHuggingFaceToken: !!huggingFaceToken,
      huggingFaceTokenLength: huggingFaceToken?.length
    });

    console.log('=== DEBUGGING TOKEN ===');
    console.log('HF Token exists:', !!huggingFaceToken);
    console.log('HF Token length:', huggingFaceToken?.length);
    console.log('Photo file exists:', !!photoFile);
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== VERIFICANDO CONDIÇÕES PARA IMG2IMG ===');
    console.log('Tem foto:', !!photoFile);
    console.log('Tem token HF:', !!huggingFaceToken);
    console.log('Vai usar img2img:', !!(photoFile && huggingFaceToken));

    // 🎯 STABLE DIFFUSION IMG2IMG - A SOLUÇÃO REAL!
    if (photoFile && huggingFaceToken) {
      console.log('🎨 USANDO STABLE DIFFUSION IMG2IMG - SUA FOTO REAL!');
      
      try {
        // Convert image to base64
        const imageBytes = await photoFile.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
        
        // Enhanced prompt for better img2img results
        const enhancedPrompt = `${prompt}, high quality portrait, detailed facial features, professional photography, ultra realistic, 8k resolution`;
        
        console.log('Enviando para Stable Diffusion img2img...');
        console.log('Prompt usado:', enhancedPrompt);
        
        const response = await fetch(
          "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
          {
            headers: {
              Authorization: `Bearer ${huggingFaceToken}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: enhancedPrompt,
              parameters: {
                // img2img specific parameters
                init_image: base64Image,
                strength: 0.9, // AUMENTADO: Preserva mais características da foto original
                guidance_scale: 7.5, // How closely to follow the prompt
                num_inference_steps: 50, // Quality vs speed
                width: 512,
                height: 512
              },
              options: {
                wait_for_model: true,
                use_cache: false
              }
            }),
          }
        );

        console.log('Stable Diffusion response status:', response.status);

        if (response.ok) {
          const result = await response.arrayBuffer();
          const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(result)));
          
          console.log('✅ SUCCESS: Stable Diffusion img2img processou sua foto!');
          console.log('Tamanho da imagem resultado:', result.byteLength, 'bytes');
          
          return new Response(
            JSON.stringify({ 
              image: `data:image/jpeg;base64,${resultBase64}`,
              revised_prompt: `IMG2IMG: ${enhancedPrompt}`,
              method: 'stable-diffusion-img2img',
              source: 'your-uploaded-photo'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } else {
          const errorText = await response.text();
          console.error('Stable Diffusion API error:', errorText);
          
          // Check if it's a loading error
          if (errorText.includes('loading') || errorText.includes('currently loading')) {
            console.log('Modelo ainda carregando, tentando novamente...');
            
            // Wait a bit and try again
            await new Promise(resolve => setTimeout(resolve, 20000));
            
            const retryResponse = await fetch(
              "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
              {
                headers: {
                  Authorization: `Bearer ${huggingFaceToken}`,
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                  inputs: enhancedPrompt,
                  parameters: {
                    init_image: base64Image,
                    strength: 0.9, // AUMENTADO: Mesmo valor para retry
                    guidance_scale: 7.5,
                    num_inference_steps: 50,
                    width: 512,
                    height: 512
                  },
                  options: {
                    wait_for_model: true,
                    use_cache: false
                  }
                }),
              }
            );
            
            if (retryResponse.ok) {
              const retryResult = await retryResponse.arrayBuffer();
              const retryBase64 = btoa(String.fromCharCode(...new Uint8Array(retryResult)));
              
              console.log('✅ SUCCESS na segunda tentativa!');
              
              return new Response(
                JSON.stringify({ 
                  image: `data:image/jpeg;base64,${retryBase64}`,
                  revised_prompt: `IMG2IMG (retry): ${enhancedPrompt}`,
                  method: 'stable-diffusion-img2img-retry',
                  source: 'your-uploaded-photo'
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              );
            }
          }
          
          console.log('Stable Diffusion falhou, usando fallback...');
        }
      } catch (img2imgError) {
        console.error('Erro no img2img:', img2imgError);
        console.log('Tentando fallback para OpenAI...');
      }
    }

    // Fallback to OpenAI for text-only or when Hugging Face fails
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuração necessária',
          details: 'Configure o token do Hugging Face para usar sua foto real, ou OpenAI para geração de texto.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔄 Usando OpenAI como fallback...');
    
    const finalPrompt = photoFile 
      ? `Create a stylized portrait avatar inspired by: ${prompt}. Professional digital art, realistic but artistic.`
      : `Create a stylized avatar portrait: ${prompt}. Professional, clean styling.`;

    const imageGenerationPayload = {
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json'
    };

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageGenerationPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate image', 
          details: errorData.error?.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    console.log('Avatar gerado com OpenAI (fallback)');

    return new Response(
      JSON.stringify({ 
        image: imageDataUrl,
        revised_prompt: data.data[0].revised_prompt || finalPrompt,
        method: 'openai-fallback',
        source: photoFile ? 'text-inspired-by-photo' : 'text-only'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-face function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});