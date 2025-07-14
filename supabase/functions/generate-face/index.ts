import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let imageGenerationPayload;

    if (photoFile) {
      // Convert uploaded photo to base64 for analysis
      const photoBuffer = await photoFile.arrayBuffer();
      const photoBase64 = btoa(String.fromCharCode(...new Uint8Array(photoBuffer)));
      
      // Use gpt-image-1 model which can better handle image descriptions and prompts
      const enhancedPrompt = `Create a stylized avatar based on the uploaded reference photo with these specifications: ${prompt}. 
      Maintain the person's basic facial structure and key features while applying the requested artistic style. 
      The result should be a clean, professional avatar suitable for digital identity.`;

      console.log('Using gpt-image-1 with enhanced prompt:', enhancedPrompt);

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: enhancedPrompt,
          size: '1024x1024',
          quality: 'high',
          n: 1
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].b64_json) {
        throw new Error('No image data received from OpenAI');
      }

      const imageBase64 = data.data[0].b64_json;
      const imageDataUrl = `data:image/png;base64,${imageBase64}`;

      console.log('Avatar generated successfully with gpt-image-1');

      return new Response(
        JSON.stringify({ 
          image: imageDataUrl,
          revised_prompt: data.data[0].revised_prompt || enhancedPrompt
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Use DALL-E 3 for generating from text prompt only
      imageGenerationPayload = {
        model: 'dall-e-3',
        prompt: `Create a stylized avatar portrait of a person with the following characteristics: ${prompt}. Make it suitable for a professional profile picture with clean, modern styling.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      };
    }

    console.log('Generating image with payload:', JSON.stringify(imageGenerationPayload, null, 2));

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
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      throw new Error('No image data received from OpenAI');
    }

    const imageBase64 = data.data[0].b64_json;
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ 
        image: imageDataUrl,
        revised_prompt: data.data[0].revised_prompt || prompt
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