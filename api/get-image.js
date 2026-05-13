export default async function handler(req, res) {
  const { dishName } = req.query;

  if (!dishName) {
    return res.status(400).json({ error: 'Dish name is required' });
  }

  const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

  if (!PIXABAY_API_KEY) {
    return res.status(500).json({ error: 'Pixabay API key not configured' });
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
        dishName
      )}&image_type=photo&order=popular`
    );
    const data = await response.json();
    
    if (data.hits && data.hits.length > 0) {
      return res.status(200).json({ imageUrl: data.hits[0].largeImageURL });
    } else {
      return res.status(404).json({ error: 'No image found' });
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    return res.status(500).json({ error: 'Failed to fetch image' });
  }
}
