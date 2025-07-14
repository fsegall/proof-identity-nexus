import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      photoType: photoFile?.type
    });

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (photoFile && huggingFaceToken) {
      console.log('=== USANDO SUA IMAGEM REAL com Hugging Face ===');
      
      // Use the actual uploaded image with Hugging Face
      const imageBytes = await photoFile.arrayBuffer();
      
      const response = await fetch(
        "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
        {
          headers: {
            Authorization: `Bearer ${huggingFaceToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: {
              image: Array.from(new Uint8Array(imageBytes)),
              prompt: `Transform this person: ${prompt}. Keep the person's face recognizable but apply the styling requested.`
            }
          }),
        }
      );

      if (response.ok) {
        const result = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(result)));
        
        console.log('Imagem transformada usando SUA FOTO como base!');
        
        return new Response(
          JSON.stringify({ 
            image: `data:image/jpeg;base64,${base64}`,
            revised_prompt: `Transformed your uploaded image: ${prompt}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        console.log('Hugging Face falhou, usando fallback com OpenAI...');
      }
    }

    // Fallback to OpenAI text generation
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let finalPrompt = prompt;
    
    if (photoFile) {
      console.log('=== MODO FALLBACK: Criando avatar inspirado na sua descrição ===');
      finalPrompt = `Create a stylized portrait avatar inspired by: ${prompt}. 
      Professional digital art, clean modern styling suitable for profile picture.
      Make it realistic but artistic, with attention to facial features.`;
    } else {
      finalPrompt = `Create a stylized avatar portrait: ${prompt}. Professional, clean styling.`;
    }

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

    console.log('Avatar gerado com sucesso');

    return new Response(
      JSON.stringify({ 
        image: imageDataUrl,
        revised_prompt: data.data[0].revised_prompt || finalPrompt
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