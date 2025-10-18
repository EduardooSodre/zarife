// utils/upload.ts
export type UploadResult = { url: string; publicId?: string };

export const uploadToCloudinary = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'zarife');
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error('Erro no upload');
    }
    
    const data = await response.json();
    return { url: data.secure_url, publicId: data.public_id };
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

// Função de fallback que converte o arquivo para base64 (apenas para desenvolvimento)
export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Delete resource from Cloudinary by public id
export const deleteFromCloudinary = async (publicId: string) => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    console.warn('Cloudinary credentials not configured; skipping deletion');
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = await import('crypto');
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha1', apiSecret).update(stringToSign).digest('hex');

  const form = new URLSearchParams();
  form.append('public_id', publicId);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('Failed to delete Cloudinary resource:', txt);
  }
  return;
};

