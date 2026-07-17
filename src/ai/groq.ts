export type GroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function callGroqChat(options: {
  messages: GroqMessage[];
  model?: string;
  responseFormat?: 'json_object' | 'text';
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }

  const payload = {
    model: options.model || 'llama-3.3-70b-versatile',
    messages: options.messages,
    response_format: options.responseFormat ? { type: options.responseFormat } : undefined,
    temperature: options.temperature !== undefined ? options.temperature : 0.2,
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API call failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq API returned an empty response.");
  }

  return content;
}

export async function transcribeAudio(
  audioDataUri: string,
  language?: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }

  const mimeType = audioDataUri.split(';')[0].split(':')[1] || 'audio/webm';
  const base64Data = audioDataUri.split(',')[1];
  if (!base64Data) {
    throw new Error("Invalid audio data URI.");
  }

  const buffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([buffer], { type: mimeType });
  const extension = mimeType.split('/')[1]?.split(';')[0] || 'webm';

  const formData = new FormData();
  formData.append('file', blob, `recording.${extension}`);
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'json');
  if (language) {
    formData.append('language', language);
  }

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq transcription failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.text || '';
}
