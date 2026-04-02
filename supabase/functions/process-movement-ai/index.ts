import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente de gerenciamento de estoque da fábrica de estofados S.F.C.P.C.
Sua tarefa é extrair informações de movimentações de estoque a partir de texto (voz transcrita), imagens ou PDFs.

Extraia os seguintes campos quando disponíveis:
- productName: nome ou descrição do produto
- type: tipo de movimentação (Entrada, Saída, Transferência, Ajuste)
- quantity: quantidade movimentada (número positivo)
- batch: número do lote
- locationOrigin: local de origem
- locationDestiny: local de destino
- notes: observações adicionais
- operator: nome do operador

Produtos conhecidos:
- TEC-001: Tecido Suede Cinza
- TEC-002: Tecido Linho Bege
- TEC-003: Tecido Chenille Marrom
- ESP-001: Espuma D33 10cm
- ESP-002: Espuma D45 15cm
- ESP-003: Espuma D28 8cm
- MAD-001: Pinus Tratado 2m
- MAD-002: MDF 15mm 2,75x1,84
- MAD-003: Compensado 10mm
- FER-001: Dobradiça Sofá-Cama
- FER-002: Mola Espiral 12cm
- FER-003: Parafuso Sextavado M8

Responda APENAS com o JSON, sem markdown ou explicações.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, content, mimeType } = await req.json();

    if (!type || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type and content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let messages: any[];

    if (type === "voice") {
      // Voice: content is transcribed text
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Extraia os dados de movimentação desta transcrição de voz:\n\n"${content}"`,
        },
      ];
    } else if (type === "image" || type === "pdf") {
      // Image/PDF: content is base64 data
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extraia os dados de movimentação de estoque deste ${type === "pdf" ? "documento PDF" : "imagem"}. Identifique produtos, quantidades, tipo de movimentação e quaisquer outras informações relevantes.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || "image/jpeg"};base64,${content}`,
              },
            },
          ],
        },
      ];
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use: voice, image, or pdf" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          tools: [
            {
              type: "function",
              function: {
                name: "extract_movement",
                description: "Extract inventory movement data",
                parameters: {
                  type: "object",
                  properties: {
                    productName: { type: "string", description: "Nome do produto" },
                    type: {
                      type: "string",
                      enum: ["Entrada", "Saída", "Transferência", "Ajuste"],
                      description: "Tipo de movimentação",
                    },
                    quantity: { type: "number", description: "Quantidade" },
                    batch: { type: "string", description: "Número do lote" },
                    locationOrigin: { type: "string", description: "Local de origem" },
                    locationDestiny: { type: "string", description: "Local de destino" },
                    notes: { type: "string", description: "Observações" },
                    operator: { type: "string", description: "Nome do operador" },
                  },
                  required: ["productName", "type", "quantity"],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_movement" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Configurações > Workspace > Uso." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let movementData;

    if (toolCall?.function?.arguments) {
      movementData =
        typeof toolCall.function.arguments === "string"
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
    } else {
      // Fallback: try to parse from content
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          movementData = JSON.parse(content);
        } catch {
          return new Response(
            JSON.stringify({ error: "Não foi possível extrair dados da resposta da IA" }),
            { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(JSON.stringify({ movement: movementData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
