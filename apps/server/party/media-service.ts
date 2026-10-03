import type * as Party from 'partykit/server';
import type { ImgurUploadResponse } from '@who-am-i/shared';
import { validateAvatarFile } from '@who-am-i/shared';

export interface IMediaService {
  handleRequest(req: Party.Request): Promise<Response>;
}

export const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.CLIENT_DOMAIN || '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export class ImgurMediaService implements IMediaService {
  constructor(private readonly clientId = process.env.IMGUR_CLIENT_ID) {}

  public async handleRequest(req: Party.Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return new Response(JSON.stringify({ error: 'No file uploaded' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const uploadFile = file as File;

      const validation = validateAvatarFile({ size: uploadFile.size, type: uploadFile.type });
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const arrayBuffer = await uploadFile.arrayBuffer();
      const base64String = this.arrayBufferToBase64(arrayBuffer);
      const imgurData = await this.uploadToImgur(base64String);

      return new Response(JSON.stringify(imgurData), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (err) {
      console.error('Media upload error:', err);
      return new Response(
        JSON.stringify({ error: 'Internal server error during upload' }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 8192;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }

    return btoa(binary);
  }

  private async uploadToImgur(base64Image: string): Promise<ImgurUploadResponse> {
    if (!this.clientId) {
      console.warn('IMGUR_CLIENT_ID is not configured');
    }

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${this.clientId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        type: 'base64',
        title: 'Uploaded via Who-am-i game',
        description: `Uploaded at ${new Date().toISOString()}`,
      }),
    });

    const json = (await response.json()) as { success: boolean; data: ImgurUploadResponse; status?: number };
    if (!json.success) {
      throw new Error(`Imgur API error: ${JSON.stringify(json)}`);
    }

    return json.data;
  }
}
