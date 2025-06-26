import { supabase } from "@/utils/supabase/client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get("user_id")

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("user_id", user_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const Movies = data?.map((movie) => ({
    ...movie,
    watchedDate: new Date(movie.watched_date).toLocaleDateString()
  }))

  return NextResponse.json(Movies)
}