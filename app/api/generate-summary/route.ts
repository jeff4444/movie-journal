import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { movies, summaryData, year } = await request.json();

    // Limit to first 10 movies for the list
    const movieList = movies.slice(0, 10)
      .map((movie: any) => `- ${movie.title} (${movie.rating}/5 stars) - ${movie.comments || "No comments"} - Overview: ${movie.overview}`)
      .join("\n");

    const prompt = `Write a short, engaging paragraph (max 5 sentences) summarizing this person's ${year} movie watching year. You can be playful, personal, or creative. Use the following data:

Movies watched (${movies.length} total):
${movieList}

Summary data:
- Average rating: ${summaryData.avgRating.toFixed(1)}
- Highest rated movie(s): ${summaryData.topRatedMovies.map((m: any) => m.title).join(", ")} (${summaryData.maxRating} stars)
- Peak viewing month: ${summaryData.topMonth[0]} with ${summaryData.topMonth[1]} movies
- Longest movie streak: ${summaryData.maxStreak} days
- Genre breakdown: ${Object.entries(summaryData.genreDistribution).map(([genre, pct]) => `${genre} ${pct}%`).join(", ")}

Keep the summary concise and fun, as if you're chatting with a friend.
Try not to include the summary above verbatum, but use it to provide a catchy feedback/summary to the user
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return Response.json({ summary: response.text });
  } catch (error) {
    console.error("Error generating summary:", error);
    return Response.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
