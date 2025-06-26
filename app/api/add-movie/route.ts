import { supabase } from "@/utils/supabase/client"
import { NextResponse } from "next/server"
import { Movie } from "@/components/add-movie-dialog"

export async function POST(request: Request) {
  const { movie, user_id }: { movie: Movie, user_id: string } = await request.json()
  const { error } = await supabase.from("movies").insert({
    title: movie.title,
    poster_path: movie.poster_path,
    overview: movie.overview,
    rating: movie.rating,
    comments: movie.comments,
    watched_date: movie.watchedDate,
    user_id: user_id,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ message: "Movie added" })
}