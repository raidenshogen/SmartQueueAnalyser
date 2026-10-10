export async function handleChatRequest(body: any): Promise<any> {
  const { payload } = body;
  const n8nUrl = body.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/api/data";
  
  try {
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        payload: {
          question: payload.question || payload.message,
          history: payload.history || []
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Chat] n8n Error:', errorText);
      return { success: false, error: `n8n returned ${response.status}` };
    }
    
    const data = await response.json();
    return {
      success: true,
      reply: data.answer || data.reply || data.text || data.message || 'Received',
      data
    };
  } catch (e: any) {
    console.error('[API Chat] Fetch Failed:', e.message);
    return { success: false, error: "Connection to n8n failed: " + e.message };
  }
}