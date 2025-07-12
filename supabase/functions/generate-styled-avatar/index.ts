import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    console.log('=== READY PLAYER ME AVATAR CREATION ===')
    console.log('Style:', style)
    console.log('Has imageData:', !!imageData)
    console.log('Prompt:', prompt)

    if (!style) {
      console.error('Missing required style parameter')
      return new Response(
        JSON.stringify({ error: 'Style parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    try {
      console.log('Creating anonymous Ready Player Me user...')
      
      // Step 1: Create anonymous user
      const userResponse = await fetch('https://api.readyplayer.me/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'users'
          }
        })
      })

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('Failed to create user:', errorText)
        throw new Error(`Failed to create Ready Player Me user: ${userResponse.status}`)
      }

      const userData = await userResponse.json()
      const userId = userData.data.id
      console.log('Created user:', userId)

      // Step 2: Create avatar for the user with style-based configuration
      console.log('Creating avatar with style configuration...')
      
      // Map our styles to Ready Player Me avatar configurations
      const avatarConfigs = {
        cyberpunk: {
          bodyType: 'fullbody',
          assets: {
            hair: 'hair_male_06',
            outfit: 'outfit_male_casualsuit_02',
            skin: 'skin_male_04'
          }
        },
        fantasy: {
          bodyType: 'fullbody', 
          assets: {
            hair: 'hair_male_07',
            outfit: 'outfit_male_fantasy_01',
            skin: 'skin_male_02'
          }
        },
        artistic: {
          bodyType: 'fullbody',
          assets: {
            hair: 'hair_male_05',
            outfit: 'outfit_male_artistic_01', 
            skin: 'skin_male_01'
          }
        },
        minimal: {
          bodyType: 'fullbody',
          assets: {
            hair: 'hair_male_01',
            outfit: 'outfit_male_basic_01',
            skin: 'skin_male_01'
          }
        }
      }

      const config = avatarConfigs[style?.toLowerCase() as keyof typeof avatarConfigs] || avatarConfigs.minimal

      const avatarResponse = await fetch(`https://api.readyplayer.me/v1/users/${userId}/avatars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'avatars',
            attributes: config
          }
        })
      })

      if (!avatarResponse.ok) {
        const errorText = await avatarResponse.text()
        console.error('Failed to create avatar:', errorText)
        throw new Error(`Failed to create Ready Player Me avatar: ${avatarResponse.status}`)
      }

      const avatarData = await avatarResponse.json()
      const avatarId = avatarData.data.id
      console.log('Created avatar:', avatarId)

      // Step 3: Get avatar image
      const avatarImageUrl = `https://models.readyplayer.me/${avatarId}.png?scene=fullbody-portrait-v1-transparent`
      
      console.log('Fetching avatar image from:', avatarImageUrl)
      
      // Wait a bit for the avatar to be processed
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const imageResponse = await fetch(avatarImageUrl)
      
      if (!imageResponse.ok) {
        console.error('Failed to fetch avatar image, status:', imageResponse.status)
        throw new Error(`Failed to fetch avatar image: ${imageResponse.status}`)
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      
      if (!imageBuffer || imageBuffer.byteLength === 0) {
        console.error('No image data received')
        throw new Error('No image data received from Ready Player Me')
      }

      console.log('Converting result to base64...')
      const base64Result = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

      console.log('=== SUCCESS ===')
      console.log('Generated avatar image size:', imageBuffer.byteLength, 'bytes')
      console.log('Avatar ID:', avatarId)
      
      return new Response(
        JSON.stringify({ 
          image: `data:image/png;base64,${base64Result}`,
          avatarId: avatarId,
          avatarUrl: avatarImageUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } catch (avatarError) {
      console.error('=== AVATAR CREATION ERROR ===')
      console.error('Error name:', avatarError.name)
      console.error('Error message:', avatarError.message)
      console.error('Full error:', avatarError)

      // Provide specific error messages
      let errorMessage = 'Avatar creation failed'
      let statusCode = 500

      if (avatarError.message?.includes('401') || avatarError.message?.includes('unauthorized')) {
        errorMessage = 'Unauthorized access to Ready Player Me API'
        statusCode = 401
      } else if (avatarError.message?.includes('429') || avatarError.message?.includes('rate limit')) {
        errorMessage = 'API rate limit exceeded. Please wait and try again.'
        statusCode = 429
      } else if (avatarError.message?.includes('503') || avatarError.message?.includes('service unavailable')) {
        errorMessage = 'Ready Player Me service temporarily unavailable. Please try again.'
        statusCode = 503
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: avatarError.message,
          code: avatarError.name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: statusCode }
      )
    }

  } catch (error) {
    console.error('=== GENERAL ERROR ===')
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error occurred', 
        details: error.message || 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})