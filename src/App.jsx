import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";
import { useState, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import "dotenv/config"

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;

  const [dishName, setDishName] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!dishName) return; // only run when dishName exists
    const fetchImage = async () => {
      try {
        const res = await fetch(
          `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
            dishName
          )}&image_type=photo&order=popular`
        );
        const data = await res.json();
        if (data.hits.length > 0) {
          setImages(data.hits[0].largeImageURL);
        }
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    };
    fetchImage();
  }, [dishName]);

  async function handleSearch(e) {
    e.preventDefault();

    if (!ingredients.trim()) {
      alert("Please enter some ingredients");
      return;
    }
    setLoading(true);
    try {
      // Explicitly using v1 to avoid 404 issues in some regions with v1beta
      const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" }, {  });
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
      let responceText = result.response.text();
      
      // Safety cleaning in case AI still adds markdown
      responceText = responceText
        .replace(/```html/gi, "")
        .replace(/```/gi, "")
        .trim();
        
      setRecipe(responceText);
      setIngredients("");
      
      const match = responceText.match(/<h2>(.*?)<\/h2>/i);
      const name = match ? match[1] : null;
      setDishName(name);
    } catch (error) {
      console.error("Search error:", error);
      if (error.message.includes("429")) {
        alert("Quota exceeded. Please wait a minute or try again later.");
      } else {
        alert("An error occurred while generating the recipe.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <header className="name">
        <h1>Gourmet AI</h1>
        <p>Transform your ingredients into world-class culinary masterpieces.</p>
      </header>

      <form action="" onSubmit={handleSearch}>
        <input
          disabled={loading}
          placeholder="Enter ingredients (e.g., salmon, lemon, dill)..."
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button disabled={loading}>
          {loading ? "Crafting..." : "Get Recipe"}
        </button>
      </form>

      {loading ? (
        <div className="loading-state">
          <p>Analyzing flavors and crafting your recipe...</p>
        </div>
      ) : (
        recipe && (
          <main className="recipe-container">
            <div className="recipe">
              <h1>Chef's Recommendation</h1>
              <div dangerouslySetInnerHTML={{ __html: recipe }} />
              
              {images && (
                <div className="img-container">
                  <img src={images} alt={dishName} className="img" />
                </div>
              )}
            </div>
          </main>
        )
      )}
    </div>
  );
}

export default App;
