
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
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const photoFile = formData.get('photo') as File | null;

    console.log('Received request:', { 
      hasPrompt: !!prompt, 
      hasPhoto: !!photoFile,
      photoSize: photoFile?.size,
      photoType: photoFile?.type
    });

    if (!prompt) {
      console.error('No prompt provided');
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (photoFile) {
      console.log('Processing photo with DALL-E 2 variations endpoint');
      console.log('Photo details:', {
        size: photoFile.size,
        type: photoFile.type,
        name: photoFile.name
      });

      // Check file size (4MB limit for OpenAI)
      if (photoFile.size > 4 * 1024 * 1024) {
        console.error('File too large:', photoFile.size);
        return new Response(
          JSON.stringify({ error: 'Photo must be less than 4MB' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check file type (must be PNG for variations endpoint)
      if (!photoFile.type.includes('png') && !photoFile.type.includes('image')) {
        console.error('Invalid file type:', photoFile.type);
        return new Response(
          JSON.stringify({ error: 'Photo must be a PNG image' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const formDataForAPI = new FormData();
      formDataForAPI.append('image', photoFile);
      formDataForAPI.append('n', '1');
      formDataForAPI.append('size', '1024x1024');
      formDataForAPI.append('response_format', 'b64_json');

      const response = await fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: formDataForAPI,
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

      console.log('Photo variation generated successfully');

      return new Response(
        JSON.stringify({ 
          image: imageDataUrl,
          revised_prompt: `Stylized variation of uploaded photo`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Use DALL-E 3 for generating from text prompt only
      const imageGenerationPayload = {
        model: 'dall-e-3',
        prompt: `Create a stylized avatar portrait of a person with the following characteristics: ${prompt}. Make it suitable for a professional profile picture with clean, modern styling.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      };

      console.log('Generating image with DALL-E 3 and payload:', JSON.stringify(imageGenerationPayload, null, 2));

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

      console.log('Image generated successfully with DALL-E 3');

      return new Response(
        JSON.stringify({ 
          image: imageDataUrl,
          revised_prompt: data.data[0].revised_prompt || prompt
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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
