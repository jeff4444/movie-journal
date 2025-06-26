import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { movies, year, peakMonth, avgRating, topRatedMovie } = await request.json()

    const movieList = movies
      .map((movie: any) => `- ${movie.title} (${movie.rating}/5 stars) - ${movie.comments || "No comments"}`)
      .join("\n")

    const prompt = `Create a personalized, engaging "Spotify Wrapped" style summary for someone's ${year} movie watching journey. Here are the movies they watched:

${movieList}

The peak month was ${peakMonth} and the average rating was ${avgRating}.

The highest-rated movie was ${topRatedMovie.title} with ${topRatedMovie.rating} stars.

Create a fun, insightful summary that includes:
- Total movies watched and average rating
- Highlight their highest-rated movie
- Identify patterns in their viewing habits
- Make observations about their taste in films
- Use emojis and engaging language
- Keep it positive and celebratory
- Make it feel personal and unique to their viewing history

Write it in a conversational, enthusiastic tone as if you're their personal movie curator reflecting on their year.`

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

    return Response.json({ summary: response.text })
  } catch (error) {
    console.error("Error generating summary:", error)
    return Response.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
