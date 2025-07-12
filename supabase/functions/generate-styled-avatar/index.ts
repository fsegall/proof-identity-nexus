
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
    const { prompt, style, imageData } = await req.json()

    console.log('Request received with:', { prompt, style, hasImageData: !!imageData })

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
      cyberpunk: `${style} style portrait, futuristic neon aesthetic, maintain facial features`,
      fantasy: `${style} style portrait, magical medieval aesthetic, maintain facial features`,
      artistic: `${style} style portrait, colorful artistic interpretation, maintain facial features`,
      minimal: `${style} style portrait, clean minimalist aesthetic, maintain facial features`
    }

    const enhancedPrompt = stylePrompts[style?.toLowerCase() as keyof typeof stylePrompts] || `${style} style portrait, maintain facial features`
    console.log('Enhanced prompt:', enhancedPrompt)

    let image;

    if (imageData) {
      console.log('Using image-to-image generation...')
      
      try {
        // Convert base64 to blob for image-to-image
        const base64Data = imageData.split(',')[1]
        const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        const imageBlob = new Blob([imageBuffer], { type: 'image/png' })

        console.log('Attempting image-to-image with enhanced parameters...')
        
        // Use a more conservative approach for better results
        image = await hf.imageToImage({
          inputs: imageBlob,
          parameters: {
            prompt: enhancedPrompt,
            strength: 0.4, // More conservative to preserve features
            guidance_scale: 7.5,
            num_inference_steps: 20
          },
          model: 'stabilityai/stable-diffusion-xl-base-1.0'
        })
        
        console.log('Image-to-image generation successful!')
        
      } catch (imageToImageError) {
        console.log('Image-to-image failed, trying text-to-image fallback:', imageToImageError.message)
        
        // Fallback to text-to-image with a descriptive prompt
        const fallbackPrompt = `portrait of a person in ${style} style, high quality, professional headshot`
        
        image = await hf.textToImage({
          inputs: fallbackPrompt,
          model: 'black-forest-labs/FLUX.1-schnell',
          use_cache: false
        })
        
        console.log('Fallback text-to-image generation successful!')
      }
    } else {
      console.log('No image provided, using text-to-image...')
      
      image = await hf.textToImage({
        inputs: enhancedPrompt,
        model: 'black-forest-labs/FLUX.1-schnell',
        use_cache: false
      })
    }

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
    
    // Handle specific Hugging Face API errors
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Hugging Face API token', 
          details: 'Please verify your API token is correct'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          details: 'Too many requests. Please wait and try again.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }
    
    if (error.message?.includes('503') || error.message?.includes('service unavailable')) {
      return new Response(
        JSON.stringify({ 
          error: 'Service temporarily unavailable', 
          details: 'The AI service is currently overloaded. Please try again in a few moments.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate styled avatar', 
        details: error.message || 'An unexpected error occurred',
        type: error.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
