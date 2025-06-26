import { supabase } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const { movie_id, user_id } = await request.json();
  if (!movie_id || !user_id) {
    return NextResponse.json({ error: "Missing movie_id or user_id" }, { status: 400 });
  }
  const { error } = await supabase
    .from("movies")
    .delete()
    .eq("id", movie_id)
    .eq("user_id", user_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Movie deleted" });
} 