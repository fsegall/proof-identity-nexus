import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const processImageWithStyle = async (imageFile: File, stylePrompt: string): Promise<string> => {
  console.log('=== PROCESSANDO SUA IMAGEM REAL ===');
  console.log('Estilo solicitado:', stylePrompt);
  
  try {
    // Load the image
    const img = await loadImage(imageFile);
    console.log('Imagem carregada:', img.width, 'x', img.height);
    
    // Remove background
    console.log('Removendo fundo da sua imagem...');
    const backgroundRemovedBlob = await removeBackground(img);
    
    // Convert back to image for styling
    const processedImg = await loadImage(backgroundRemovedBlob);
    
    // Create a styled canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    canvas.width = processedImg.width;
    canvas.height = processedImg.height;
    
    // Apply styling effects based on the prompt
    console.log('Aplicando efeitos de estilo à sua imagem...');
    
    // Draw the original processed image
    ctx.drawImage(processedImg, 0, 0);
    
    // Apply style effects based on prompt
    if (stylePrompt.toLowerCase().includes('old fashion') || stylePrompt.toLowerCase().includes('vintage')) {
      // Apply sepia effect for vintage look
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(200, 180, 140, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    if (stylePrompt.toLowerCase().includes('golden') || stylePrompt.toLowerCase().includes('blonde')) {
      // Add golden highlights
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    // Convert to data URL
    const finalImageData = canvas.toDataURL('image/png');
    
    console.log('✅ SUA IMAGEM FOI PROCESSADA COM SUCESSO!');
    console.log('Efeitos aplicados baseados no prompt:', stylePrompt);
    
    return finalImageData;
    
  } catch (error) {
    console.error('Erro ao processar sua imagem:', error);
    throw new Error(`Falha ao processar sua imagem: ${error.message}`);
  }
};
