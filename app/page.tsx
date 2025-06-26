"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Star, Sparkles, Trash2 } from "lucide-react";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { YearlySummary } from "@/components/yearly-summary";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface Movie {
  id: string;
  title: string;
  poster_path?: string;
  overview: string;
  rating: number;
  comments: string;
  watchedDate: string;
  tmdbId?: number;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showYearlySummary, setShowYearlySummary] = useState(false);
  const [deletingMovieId, setDeletingMovieId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [user, setUser] = useState<any>(undefined);
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`/api/get-movies?user_id=${user.id}`)
      .then((res) => res.json())
        .then((data) => {
          setMovies(data);
        });
    }
  }, [user]);

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  if (user === null) {
    redirect("/signin");
  }

  if (user) {
    const addMovie = (movie: Movie) => {
      const updatedMovies = [movie, ...movies];
      setMovies(updatedMovies);
      fetch("/api/add-movie", {
        method: "POST",
        body: JSON.stringify({ movie, user_id: user.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data", data);
        })
        .catch((err) => {
          console.error("Error adding movie", err);
        });
    };

    const deleteMovie = async (movieId: string) => {
      setDeletingMovieId(movieId);
      try {
        await fetch("/api/delete-movie", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie_id: movieId, user_id: user.id }),
        });
        setMovies((prev) => prev.filter((m) => m.id !== movieId));
      } catch (err) {
        console.error("Error deleting movie", err);
      } finally {
        setDeletingMovieId(null);
        setConfirmDeleteId(null);
      }
    };

    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
    };

    const currentYear = new Date().getFullYear();
    const currentYearMovies = movies.filter(
      (movie) => new Date(movie.watchedDate).getFullYear() === currentYear
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Movie Journal
              </h1>
              <p className="text-gray-600">
                Track and reflect on your cinematic journey
              </p>
            </div>
            <div className="flex gap-3">
              {currentYearMovies.length > 0 && (
                <Button
                  onClick={() => setShowYearlySummary(true)}
                  variant="outline"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentYear} Summary
                </Button>
              )}
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Movie
              </Button>
            </div>
          </div>

          {movies.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No movies tracked yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start building your movie journal by adding your first film!
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Movie
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {movies.map((movie) => (
                <Card
                  key={movie.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow relative"
                >
                  <div className="relative">
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        width={500}
                        height={750}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                      {new Date(movie.watchedDate).toLocaleDateString()}
                    </Badge>
                    <AlertDialog open={confirmDeleteId === movie.id} onOpenChange={(open) => setConfirmDeleteId(open ? movie.id : null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(movie.id);
                          }}
                          disabled={deletingMovieId === movie.id}
                        >
                          {deletingMovieId === movie.id ? (
                            <span className="animate-spin"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Movie</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p>Are you sure you want to delete "{movie.title}"? This action cannot be undone.</p>
                        <AlertDialogFooter>
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
                              onClick={() => deleteMovie(movie.id)}
                              disabled={deletingMovieId === movie.id}
                            >
                              {deletingMovieId === movie.id ? "Deleting..." : "Delete"}
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {movie.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(movie.rating)}</div>
                      <span className="text-sm text-gray-500">
                        ({movie.rating}/5)
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-3">
                      {movie.overview}
                    </CardDescription>
                    {movie.comments && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800 italic">
                          "{movie.comments}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <AddMovieDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAddMovie={addMovie}
          />

          <YearlySummary
            open={showYearlySummary}
            onOpenChange={setShowYearlySummary}
            movies={currentYearMovies}
            year={currentYear}
          />
        </div>
      </div>
    );
  }
}
