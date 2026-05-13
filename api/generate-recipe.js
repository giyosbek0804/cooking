import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients are required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

  const MODELS = ['gemini-3-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash']

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const prompt = `
Generate a recipe based on these ingredients or dish name: "${ingredients}".
Return ONLY clean HTML without any markdown code blocks or additional text.
Structure the HTML exactly like this:
- <h2>Dish Name</h2>
- <p>A short, mouth-watering description of the dish.</p>
- <h3>Ingredients</h3>
- <ul>
    <li>Ingredient 1 with amount</li>
    <li>Ingredient 2 with amount</li>
  </ul>
- <h3>Steps</h3>
- <ol>
    <li>Step 1 description</li>
    <li>Step 2 description</li>
  </ol>
- <p>A warm closing wish (e.g., "Enjoy your meal!").</p>

Rules:
1. Return ONLY the HTML tags.
2. No \`\`\`html or \`\`\` wrappers.
3. No introduction or conclusion text.
`;
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();

      // Safety cleaning
      responseText = responseText
        .replace(/```html/gi, "")
        .replace(/```/gi, "")
        .trim();

      return res.status(200).json({ recipe: responseText });
    } catch (error) {
      lastError = error;
      console.error(`Error with ${modelName}:`, error);
      
      if (error.message?.includes("429") || error.message?.includes("404")) {
        continue; 
      } else {
        break;
      }
    }
  }

  return res.status(500).json({ 
    error: 'Failed to generate recipe', 
    details: lastError?.message,
    isQuotaError: lastError?.message?.includes("429")
  });
}
