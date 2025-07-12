
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

    if (!prompt || !imageData) {
      console.error('Missing required fields:', { hasPrompt: !!prompt, hasImageData: !!imageData })
      return new Response(
        JSON.stringify({ error: 'Both prompt and imageData are required for styling' }),
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

    // Enhanced prompts that emphasize preserving the person's features
    const stylePrompts = {
      cyberpunk: `Transform this person into cyberpunk style: futuristic neon lighting, cyberpunk aesthetic, digital enhancements, but keep the exact same face, facial features, and identity of the person in the image`,
      fantasy: `Transform this person into fantasy style: medieval fantasy aesthetic, magical elements, fantasy clothing and background, but preserve the exact same face, facial features, and identity of the person`,
      artistic: `Transform this person into artistic style: painterly artistic interpretation, colorful art style, but maintain the exact same face, facial features, and identity of the person in the image`,
      minimal: `Transform this person into minimal style: clean minimalist aesthetic, simple background, but keep the exact same face, facial features, and identity of the person`
    }

    const enhancedPrompt = stylePrompts[style?.toLowerCase() as keyof typeof stylePrompts] || 
      `Transform this person into ${style} style while keeping the exact same face, facial features, and identity`
    
    console.log('Enhanced prompt:', enhancedPrompt)

    try {
      console.log('Processing image for image-to-image transformation...')
      
      // Convert base64 to blob for image-to-image
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
      const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' })

      console.log('Image blob size:', imageBuffer.length, 'bytes')
      console.log('Starting image-to-image generation with preserved identity...')
      
      // Try with a simpler, more reliable model first
      const image = await hf.imageToImage({
        inputs: imageBlob,
        parameters: {
          prompt: enhancedPrompt,
          negative_prompt: "different person, different face, different identity, blurry face, distorted features, multiple people, deformed, ugly, bad anatomy",
          strength: 0.4, // Slightly higher for better transformation
          guidance_scale: 7.5, // Lower guidance for more flexibility
          num_inference_steps: 20, // Fewer steps for stability
        },
        model: 'runwayml/stable-diffusion-v1-5' // More reliable model
      })
      
      console.log('Image-to-image generation completed successfully!')

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
      
    } catch (imageError) {
      console.error('Image-to-image generation failed:', imageError)
      
      // Try fallback with text-to-image as a last resort
      try {
        console.log('Trying fallback text-to-image generation...')
        const fallbackPrompt = `Portrait of a person in ${style} style, high quality, detailed face`
        
        const fallbackImage = await hf.textToImage({
          inputs: fallbackPrompt,
          model: 'runwayml/stable-diffusion-v1-5',
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 20,
          }
        })
        
        const arrayBuffer = await fallbackImage.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        
        console.log('Fallback generation successful')
        
        return new Response(
          JSON.stringify({ 
            image: `data:image/png;base64,${base64}`,
            warning: 'Used fallback generation - could not process your specific image'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
        
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError)
        
        return new Response(
          JSON.stringify({ 
            error: 'Both image processing and fallback generation failed', 
            details: imageError.message,
            fallbackError: fallbackError.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
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
        details: error.message || 'An unexpected error occurred'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
