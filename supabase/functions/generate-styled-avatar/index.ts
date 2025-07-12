
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

    // Style-specific prompt enhancements - more specific to maintain the person
    const stylePrompts = {
      cyberpunk: `same person, same face, cyberpunk style transformation, neon lights, futuristic aesthetic, glowing colors, high tech background, maintain facial features and identity`,
      fantasy: `same person, same face, fantasy art transformation, magical elements, medieval aesthetic, ethereal lighting, mystical background, maintain facial features and identity`,
      artistic: `same person, same face, artistic transformation, painterly style, colorful artistic interpretation, creative composition, maintain facial features and identity`,
      minimal: `same person, same face, minimalist transformation, clean aesthetic, simple composition, modern style, maintain facial features and identity`
    }

    const enhancedPrompt = stylePrompts[style?.toLowerCase() as keyof typeof stylePrompts] || `same person, same face, ${style} style transformation, maintain facial features and identity`
    console.log('Enhanced prompt:', enhancedPrompt)

    let image;

    if (imageData) {
      console.log('Using image-to-image generation with user photo...')
      
      // Convert base64 to blob for image-to-image
      const base64Data = imageData.split(',')[1] // Remove data:image/...;base64, prefix
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' })

      try {
        console.log('Attempting image-to-image with Stable Diffusion XL...')
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        })

        // Race between the API call and timeout
        image = await Promise.race([
          hf.imageToImage({
            inputs: imageBlob,
            parameters: {
              prompt: enhancedPrompt,
              strength: 0.6, // Reduce to keep more of the original image
              guidance_scale: 8.0, // Increase to better follow the prompt
              num_inference_steps: 25 // Increase for better quality
            },
            model: 'stabilityai/stable-diffusion-xl-base-1.0'
          }),
          timeoutPromise
        ])
        
        console.log('Image-to-image generation successful!')
        
      } catch (imageToImageError) {
        console.log('Image-to-image failed, trying different approach:', imageToImageError.message)
        
        // Try with different model and adjusted parameters
        try {
          const fallbackTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fallback request timeout after 25 seconds')), 25000)
          })

          // Use a more specific prompt to maintain identity
          const identityPrompt = `transform this exact person with ${style} style, keep the same face, same person, same facial features, only change the artistic style and background`

          image = await Promise.race([
            hf.imageToImage({
              inputs: imageBlob,
              parameters: {
                prompt: identityPrompt,
                strength: 0.5, // Even more conservative
                guidance_scale: 9.0,
                num_inference_steps: 20
              },
              model: 'stabilityai/stable-diffusion-xl-base-1.0'
            }),
            fallbackTimeoutPromise
          ])
          
          console.log('Fallback image-to-image generation successful!')
          
        } catch (fallbackError) {
          console.error('Both image-to-image attempts failed:', fallbackError.message)
          throw new Error(`Generation failed: ${fallbackError.message}`)
        }
      }
    } else {
      console.log('No image provided, using text-to-image...')
      
      const textTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Text-to-image timeout after 25 seconds')), 25000)
      })

      image = await Promise.race([
        hf.textToImage({
          inputs: enhancedPrompt,
          model: 'black-forest-labs/FLUX.1-schnell',
          use_cache: false
        }),
        textTimeoutPromise
      ])
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
    
    if (error.message?.includes('timeout')) {
      return new Response(
        JSON.stringify({ 
          error: 'Generation timeout', 
          details: 'The AI took too long to generate the image. Please try again.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 408 }
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
