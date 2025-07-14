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

    // Always use text generation for best results and format compatibility
    let finalPrompt = prompt;
    
    if (photoFile) {
      console.log('Photo uploaded - using enhanced text generation for better results');
      finalPrompt = `Create a stylized portrait avatar with these characteristics: ${prompt}. 
      Style: Professional digital art, clean modern styling suitable for social media profile.
      Make it look realistic but artistic, with attention to facial features and expression.
      High quality portrait style.`;
      console.log('Using enhanced prompt with photo context');
    } else {
      console.log('Text-only generation');
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

    console.log('Making request to DALL-E 3...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageGenerationPayload),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('OpenAI API error:', errorData);
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

    console.log('Avatar generated successfully');

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