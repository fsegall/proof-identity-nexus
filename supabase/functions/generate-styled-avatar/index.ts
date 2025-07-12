
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, style } = await req.json()

    console.log('Request received with:', { prompt, style })

    if (!prompt) {
      console.error('Missing prompt in request')
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfToken) {
      console.error('HUGGING_FACE_ACCESS_TOKEN not found in environment')
      return new Response(
        JSON.stringify({ error: 'Hugging Face API token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Initializing Hugging Face client...')
    const hf = new HfInference(hfToken)

    // Style-specific prompt enhancements
    const stylePrompts = {
      cyberpunk: `${prompt}, cyberpunk style, neon lights, futuristic, digital art, glowing colors, high tech aesthetic, synthwave`,
      fantasy: `${prompt}, fantasy art style, magical, medieval, ethereal lighting, mystical atmosphere, dragons, castles`,
      artistic: `${prompt}, abstract art style, colorful, artistic interpretation, creative composition, painterly`,
      minimal: `${prompt}, minimalist style, clean lines, simple composition, modern aesthetic, white background`
    }

    const enhancedPrompt = stylePrompts[style?.toLowerCase() as keyof typeof stylePrompts] || prompt
    console.log('Enhanced prompt:', enhancedPrompt)

    console.log('Calling Hugging Face API...')
    const image = await hf.textToImage({
      inputs: enhancedPrompt,
      model: 'black-forest-labs/FLUX.1-schnell',
      use_cache: false
    })

    if (!image) {
      console.error('No image returned from Hugging Face API')
      return new Response(
        JSON.stringify({ error: 'Failed to generate image - no response from AI' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Image generated successfully, converting to base64...')
    
    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    console.log('Image conversion completed, sending response')
    
    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    
    // Check for specific Hugging Face API errors
    if (error.message?.includes('exceeded') || error.message?.includes('credits')) {
      return new Response(
        JSON.stringify({ 
          error: 'Hugging Face API credits exceeded', 
          details: 'Please check your Hugging Face subscription status'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
      )
    }
    
    if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Hugging Face API token', 
          details: 'Please verify your API token is correct'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message,
        type: error.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
