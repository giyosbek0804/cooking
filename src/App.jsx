import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";
import { useState } from "react";
const PIXABAY_API_KEY = "52777745-82f9c18661ee1e22caf521d01";
// import ReactMarkdown from "react-markdown";
// import "dotenv/config"

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const ai = new GoogleGenerativeAI("AIzaSyCFvWXLqz6sTMOWEo8tEaFdD42szjZ2LMM"); 
const apiKey = "52777745-82f9c18661ee1e22caf521d01";

  const [dishName, setDishName] = useState("cheif")
  const [images, setImages]= useState([])

fetch(
  `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    dishName
  )}&image_type=photo`
)
  .then((res) => res.json())
  .then((data) => {
    console.log(data.hits); 
    setImages(data.hits[0].largeImageURL);
  })

  .catch((err) => console.error("Error:", err));
console.log(images);

  async function handleSearch(e) {
    e.preventDefault();
    
    if (!ingredients.trim()) {
      alert("Please enter some ingredients");
      return
    }
    setLoading(true);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
If "${ingredients}" is an ingredient list, generate a short recipe in clean HTML.
If it is a dish name, return that recipe in the same HTML format with text left style.
Use:
- <h2> for title
- <p> for description
- <ul><li> for full detailed ingredients with amounts
- <ol><li> for detailed steps
- <p> for good wishes 
Do not include markdown or code blocks.
create h3 before ingridients and steps.
`;
    const result = await model.generateContent(
      prompt
    );
    let responceText = result.response.text();
    responceText = responceText.replaceAll(/```html/g, "").replaceAll(/```/g, "").trim();
    setRecipe(responceText);
    setIngredients("");
    setLoading(false);

    const match = responceText.match(/<h2>(.*?)<\/h2>/i);
    const name = match ? match[1] : null;
    setDishName(name);
  }

  
 
  
  return (
    <>
      <form action="" onSubmit={handleSearch}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button>get recipe</button>
      </form>
      {loading ? (
        "generating..."
      ) : (
        <div className="recipe">
          <h1>generated recipe:</h1>
          <div
         
            dangerouslySetInnerHTML={{ __html: recipe }}
          />
        </div>
      )}

      
        <img src={images} alt="" />
     
    </>
  );
  }

export default App;
