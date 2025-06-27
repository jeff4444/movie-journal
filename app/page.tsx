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
import { YearlySummary, computeSummaryData, SummaryData } from "@/components/yearly-summary";
import { DeleteMovieDialog } from "@/components/delete-movie-dialog";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

interface Movie {
  id: string;
  title: string;
  poster_path?: string;
  overview: string;
  rating: number;
  comments: string;
  watchedDate: string;
  tmdbId?: number;
  genres: string[]
}

interface GroupedMovies {
  [year: string]: {
    [month: string]: Movie[]
  }
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showYearlySummary, setShowYearlySummary] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [user, setUser] = useState<any>(undefined);

  const [searchTitle, setSearchTitle] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  const [searchYear, setSearchYear] = useState("");

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
      const updatedMovies = [movie, ...movies];
      setMovies(updatedMovies);
    };

    const deleteMovie = async (movieId: string) => {
      try {
        await fetch("/api/delete-movie", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie_id: movieId, user_id: user.id }),
        });
        const updatedMovies = movies.filter((movie) => movie.id !== movieId);
        setMovies(updatedMovies);
        setMovieToDelete(null);
      } catch (err) {
        console.error("Error deleting movie", err);
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

    const filteredMovies = movies.filter((movie) => {
      const date = new Date(movie.watchedDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleDateString("en-US", { month: "long" });
      const matchesTitle = movie.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchesMonth = searchMonth ? month === searchMonth : true;
      const matchesYear = searchYear ? year === searchYear : true;
      return matchesTitle && matchesMonth && matchesYear;
    });

    // Group movies by year and month
    const groupedMovies: GroupedMovies = filteredMovies.reduce((acc, movie) => {
      const date = new Date(movie.watchedDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleDateString("en-US", { month: "long" });

      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      acc[year][month].push(movie);
      return acc;
    }, {} as GroupedMovies);

    // Sort years and months
    const sortedYears = Object.keys(groupedMovies).sort((a, b) => Number.parseInt(b) - Number.parseInt(a));

    const currentYear = new Date().getFullYear();
    const currentYearMovies = filteredMovies.filter(
      (movie) => new Date(movie.watchedDate).getFullYear() === currentYear
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded w-full"
            />
            <select
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded w-full"
            >
              <option value="">All months</option>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search year..."
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded w-full"
            />
          </div>
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
                  onClick={async () => {
                    setIsSummaryLoading(true);
                    try {
                      const summaryData = await computeSummaryData(currentYearMovies, undefined, currentYear);
                      setSummary(summaryData);
                      setShowYearlySummary(true);
                    } catch (err) {
                      console.error("Error computing summary data", err);
                    } finally {
                      setIsSummaryLoading(false);
                    }
                  }}
                  variant="outline"
                  disabled={isSummaryLoading}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
                >
                  {isSummaryLoading ? (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
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

          {filteredMovies.length === 0 ? (
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
            <div className="space-y-8">
              {sortedYears.map((year) => {
                const monthsInYear = groupedMovies[year];
                const sortedMonths = Object.keys(monthsInYear).sort((a, b) => {
                  const monthOrder = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ];
                  return monthOrder.indexOf(b) - monthOrder.indexOf(a);
                });

                return (
                  <div key={year} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-bold text-gray-800">{year}</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                      <Badge variant="secondary" className="text-sm">
                        {Object.values(monthsInYear).flat().length} movies
                      </Badge>
                    </div>

                    {sortedMonths.map((month) => {
                      const moviesInMonth = monthsInYear[month].sort(
                        (a, b) => new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime(),
                      );

                      return (
                        <div key={`${year}-${month}`} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-700">{month}</h3>
                            <Badge variant="outline" className="text-xs">
                              {moviesInMonth.length} {moviesInMonth.length === 1 ? "movie" : "movies"}
                            </Badge>
                          </div>

                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {moviesInMonth.map((movie) => (
                              <Card
                                key={movie.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow group"
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
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                    onClick={() => setMovieToDelete(movie)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
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
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          <AddMovieDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAddMovie={addMovie}
          />

          <YearlySummary
            open={showYearlySummary}
            onOpenChange={(open) => {
              if (!open) {
                setSummary(null);
                setShowYearlySummary(false);
              }
            }}
            movies={currentYearMovies}
            year={currentYear}
            summary={summary}
          />

          <DeleteMovieDialog
            movie={movieToDelete}
            open={!!movieToDelete}
            onOpenChange={(open) => !open && setMovieToDelete(null)}
            onConfirmDelete={deleteMovie}
          />
        </div>
      </div>
    );
  }
}
