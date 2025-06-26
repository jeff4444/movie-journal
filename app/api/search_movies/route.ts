import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
  )
  const data = await response.json()
  return NextResponse.json(data)
}