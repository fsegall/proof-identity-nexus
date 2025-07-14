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
    console.log('=== Generate Face Function Started ===');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Parsing form data...');
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
      
      // Convert to PNG if needed and check size
      const arrayBuffer = await photoFile.arrayBuffer();
      console.log('Photo array buffer size:', arrayBuffer.byteLength);
      
      if (arrayBuffer.byteLength > 4 * 1024 * 1024) {
        console.error('File too large:', arrayBuffer.byteLength);
        return new Response(
          JSON.stringify({ error: 'Photo must be less than 4MB' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create a new file with PNG content type
      const pngFile = new File([arrayBuffer], 'image.png', { type: 'image/png' });
      
      const formDataForAPI = new FormData();
      formDataForAPI.append('image', pngFile);
      formDataForAPI.append('n', '1');
      formDataForAPI.append('size', '1024x1024');
      formDataForAPI.append('response_format', 'b64_json');

      console.log('Making request to OpenAI variations endpoint...');
      
      const response = await fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: formDataForAPI,
      });

      console.log('OpenAI response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('OpenAI API error response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const responseText = await response.text();
          console.error('Response text:', responseText);
          errorData = { error: { message: response.statusText } };
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate image', 
            details: errorData.error?.message || response.statusText 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const data = await response.json();
      console.log('OpenAI response success, generating image data URL...');
      
      if (!data.data || !data.data[0] || !data.data[0].b64_json) {
        console.error('Invalid response structure:', data);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response from image generation service' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const imageBase64 = data.data[0].b64_json;
      const imageDataUrl = `data:image/png;base64,${imageBase64}`;

      console.log('Photo variation generated successfully');

      return new Response(
        JSON.stringify({ 
          image: imageDataUrl,
          revised_prompt: 'Stylized variation of uploaded photo'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Generate from text prompt only
      console.log('Generating from text prompt only with DALL-E 3');
      const imageGenerationPayload = {
        model: 'dall-e-3',
        prompt: `Create a stylized avatar portrait: ${prompt}. Professional, clean styling.`,
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
            details: errorData.error?.message || response.statusText 
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

      console.log('Text-based image generated successfully');

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
    console.error('Error stack:', error.stack);
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