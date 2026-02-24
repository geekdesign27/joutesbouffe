// Supabase Edge Function — parse-supplier-pdf
// Receives extracted PDF text + taxonomies, calls Claude API, returns structured JSON.
//
// Deploy:
//   1. Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   2. Deploy: supabase functions deploy parse-supplier-pdf
//
// Or via Dashboard → Edge Functions → New Function → paste this file.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'extraction de données à partir de catalogues fournisseurs pour une application de gestion de catering.

Tu reçois le texte brut extrait d'un PDF fournisseur. Tu dois retourner un JSON structuré avec 3 tableaux : ingredients, recipes, fixed_costs.

## Règles générales
- Langue des noms : français, tels qu'ils apparaissent dans le catalogue
- Les prix sont en CHF (francs suisses)
- Déduis les informations manquantes de façon raisonnable à partir du contexte

## Schema "ingredients"
Chaque ingrédient est un objet avec ces champs :
- name (string, requis) : nom du produit
- purchase_unit (string, requis) : une des valeurs autorisées pour purchase_unit
- purchase_quantity (number, requis, >0) : nombre de conditionnements (généralement 1)
- purchase_price (number, requis, >=0) : prix du conditionnement en CHF
- items_per_purchase (number, >0) : nb d'unités individuelles par conditionnement (ex: 6 bouteilles dans un lot)
- item_volume (number|null) : contenance d'une unité individuelle (ex: 1.5 pour 1.5L)
- item_volume_unit (string|null) : unité de mesure de la contenance (L, dl, cl, ml, kg, g, pce)
- serving_unit (string) : unité de service (une des valeurs autorisées pour serving_unit)
- serving_quantity (number) : quantité totale de service dans le conditionnement (calculée : items_per_purchase × item_volume, convertie en serving_unit)
- waste_rate (number, 0-100) : taux de perte en %, 0 par défaut
- returnable (boolean) : true si le conditionnement est consigné/retournable
- returnable_condition (string|null) : condition de retour (ex: "pack non ouvert", "consigne fût")
- perishable (boolean) : true si périssable
- category (string, requis) : une des valeurs autorisées pour ingredient_category

## Schema "recipes"
Chaque recette est un objet avec :
- name (string, requis) : nom de la recette (ex: "Coca-Cola 3dl", "Bière pression 3dl")
- type (string, requis) : une des valeurs autorisées pour recipe_type
- selling_price (number) : prix de vente, 0 si inconnu
- ingredients (array) : liste d'objets { ingredient_name, quantity_used, unit }
  - ingredient_name doit correspondre exactement à un name dans le tableau ingredients
  - unit doit être une des valeurs autorisées pour serving_unit

## Schema "fixed_costs"
Chaque coût fixe est un objet avec :
- name (string, requis) : description
- amount (number, requis, >=0) : montant en CHF
- category (string, requis) : "location", "consommable", "transport", ou "autre"

## Conversions courantes
- 1 fût = 1 conditionnement (items_per_purchase=1), contenance en litres
- Lots de bouteilles : items_per_purchase = nb bouteilles, item_volume = contenance d'une bouteille
- Lots de gobelets/assiettes : items_per_purchase = nb pièces, serving_unit = "pce"
- Pour les boissons en bouteille : serving_unit = "cl", serving_quantity = items × volume × 100 (si volume en L)
- Pour les fûts : serving_unit = "cl", serving_quantity = volume × 100

## Recettes standards
- Boisson servie en verre 3dl → recette = ingrédient boisson (33cl) + gobelet adapté (1 pce)
- Bière pression 3dl → fût (30cl) + gobelet 3dl (1 pce)
- Spiritueux → dose standard (4-10cl selon type) + gobelet adapté (1 pce)
- Si le catalogue ne mentionne pas de gobelets, crée quand même les recettes sans gobelet

## Coûts fixes
- Location de matériel (frigos, tireuses, etc.) → category "location"
- Consommables à usage unique liés au service → category "consommable"
- Transport, livraison → category "transport"
- Autre → category "autre"

Retourne UNIQUEMENT le JSON, sans markdown, sans explication. Le format doit être :
{ "ingredients": [...], "recipes": [...], "fixed_costs": [...] }`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { pdfText, taxonomies, supplierName } = await req.json();

    if (!pdfText || typeof pdfText !== "string") {
      return new Response(
        JSON.stringify({ error: "pdfText is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Build the user message with taxonomy context
    const taxonomyContext = taxonomies
      ? `\n\nValeurs de taxonomie autorisées :\n${Object.entries(taxonomies)
          .map(([type, values]) => `- ${type}: ${(values as string[]).join(", ")}`)
          .join("\n")}`
      : "";

    const supplierContext = supplierName
      ? `\n\nFournisseur : ${supplierName}`
      : "";

    const userMessage = `Analyse ce texte extrait d'un catalogue fournisseur et retourne le JSON structuré.${supplierContext}${taxonomyContext}\n\n--- TEXTE DU PDF ---\n${pdfText}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Claude API error:", response.status, errorBody);
      return new Response(
        JSON.stringify({
          error: `Claude API error: ${response.status}`,
          details: errorBody,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content?.[0]?.text;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty response from Claude" }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Parse the JSON from Claude's response
    // Sometimes Claude wraps it in ```json ... ```
    let jsonText = content.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);

    return new Response(JSON.stringify(parsed), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
