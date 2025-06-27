import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return NextResponse.json(data);
}
