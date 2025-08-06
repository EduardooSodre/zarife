import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📤 Upload iniciado:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    if (!file) {
      console.error('❌ Nenhum arquivo enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Verificar se as variáveis de ambiente do Cloudinary estão configuradas
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    console.log('🔧 Configurações do Cloudinary:', {
      cloudName: cloudName || 'NÃO CONFIGURADO',
      uploadPreset: uploadPreset || 'NÃO CONFIGURADO'
    });

    if (!cloudName || !uploadPreset) {
      console.error('❌ Configurações do Cloudinary não encontradas');
      return NextResponse.json(
        { error: 'Configurações do Cloudinary não encontradas. Verifique as variáveis de ambiente.' },
        { status: 500 }
      );
    }

    // Criar FormData para enviar ao Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);

    console.log('☁️ Enviando para Cloudinary...');

    // Upload para o Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    console.log('📡 Resposta do Cloudinary:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro do Cloudinary:', errorData);
      return NextResponse.json(
        { error: 'Erro ao fazer upload para o Cloudinary', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    console.log('✅ Upload bem-sucedido:', {
      url: data.secure_url,
      publicId: data.public_id
    });
    
    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
    });

  } catch (error) {
    console.error('💥 Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
