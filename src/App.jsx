import "./App.css";
import { useState, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import "dotenv/config"

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [dishName, setDishName] = useState("");
  const [images, setImages] = useState("");

  useEffect(() => {
    if (!dishName) return;
    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/get-image?dishName=${encodeURIComponent(dishName)}`);
        const data = await res.json();
        if (data.imageUrl) {
          setImages(data.imageUrl);
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
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await res.json();

      if (res.ok) {
        setRecipe(data.recipe);
        setIngredients("");

        const match = data.recipe.match(/<h2>(.*?)<\/h2>/i);
        const name = match ? match[1] : null;
        setDishName(name);
      } else {
        if (data.isQuotaError) {
          alert("All models have exceeded their quota. Please try again later.");
        } else {
          alert(data.error || "An error occurred while generating the recipe.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    }

    setLoading(false);
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
