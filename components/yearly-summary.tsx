"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  TrendingUp,
  Award,
  Film,
  Clock,
} from "lucide-react";
import Image from "next/image";

export interface SummaryData {
  totalMovies: number;
  avgRating: number;
  topRatedMovies: Movie[];
  maxRating: number;
  topMonth: [string, number];
  genreDistribution: Record<string, number>;
  maxStreak: number;
  summaryText: string;
}

export async function computeSummaryData(
  movies: Movie[],
  prevSummary: SummaryData | undefined = undefined,
  year?: number
): Promise<SummaryData> {
  const totalMovies = movies.length;
  const avgRating =
    totalMovies > 0
      ? movies.reduce((sum, movie) => sum + movie.rating, 0) / totalMovies
      : 0;
  const maxRating =
    movies.length > 0 ? Math.max(...movies.map((m) => m.rating)) : 0;
  const topRatedMovies = movies.filter((movie) => movie.rating === maxRating);

  const monthCounts = movies.reduce((acc, movie) => {
    const month = new Date(movie.watchedDate).toLocaleDateString("en-US", {
      month: "long",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMonth = Object.entries(monthCounts).reduce(
    (a, b) => (monthCounts[a[0]] > monthCounts[b[0]] ? a : b),
    ["", 0]
  );

  const allGenres = movies.flatMap((movie) => movie.genres);
  const genreCounts = allGenres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalGenreCount = Object.values(genreCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const genreDistribution = Object.fromEntries(
    Object.entries(genreCounts).map(([genre, count]) => [
      genre,
      parseFloat(((count / totalGenreCount) * 100).toFixed(1)),
    ])
  );

  const sortedDates = movies
    .map((m) => new Date(m.watchedDate))
    .sort((a, b) => a.getTime() - b.getTime());
  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = Math.floor(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak);

  let summaryText = '';
  // Fetch summary text from API if prevSummary is undefined
  if (prevSummary === undefined) {
    const response = await fetch("/api/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movies,
        summaryData: {
          totalMovies,
          avgRating,
          topRatedMovies,
          maxRating,
          topMonth,
          genreDistribution,
          maxStreak,
        },
        year,
      }),
    });
    const data = await response.json();
    summaryText = data.summary || "No summary available.";
  } else {
    summaryText = prevSummary.summaryText || "No summary";
  }
  
  return {
    totalMovies,
    avgRating,
    topRatedMovies,
    maxRating,
    topMonth,
    genreDistribution,
    maxStreak,
    summaryText,
  };
}

interface Movie {
  id: string;
  title: string;
  poster_path?: string;
  overview: string;
  rating: number;
  comments: string;
  watchedDate: string;
  genres: string[];
  tmdbId?: number;
}

interface YearlySummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movies: Movie[];
  year: number;
  summary: SummaryData | null;
}

export function YearlySummary({
  open,
  onOpenChange,
  movies,
  year,
  summary,
}: YearlySummaryProps) {
  if (!open) {
    return null;
  }
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!summary && open) {
    return (
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex items-center justify-center">
          <DialogHeader>
            <DialogTitle className="sr-only">Generating Summary</DialogTitle>
          </DialogHeader>
          <div className="text-white text-lg">Generating your summary...</div>
        </DialogContent>
      </Dialog>
    );
  }
  const {
    totalMovies,
    avgRating,
    topRatedMovies,
    maxRating,
    topMonth,
    genreDistribution,
    maxStreak,
    summaryText,
  } = summary!;

  const slides = [
    // Slide 1: Total Movies
    {
      title: "Your Movie Year",
      content: (
        <div className="relative h-full flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-300 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300 rotate-45 animate-spin"></div>
          </div>
          <div className="relative z-10 text-center">
            <Film className="w-20 h-20 mx-auto mb-6 animate-pulse" />
            <div className="text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              {totalMovies}
            </div>
            <div className="text-2xl font-semibold mb-2">Movies Watched</div>
            <div className="text-lg opacity-90">in {year}</div>
          </div>
        </div>
      ),
    },

    // Slide 2: Top Rated Movie(s)
    {
      title: "Your Favorite",
      content: (
        <div className="relative h-full flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700"></div>

          {/* Background movie posters */}
          {topRatedMovies.length > 0 && (
            <div className="absolute inset-0 opacity-20">
              {topRatedMovies.length === 1 ? (
                // Single movie - full background
                topRatedMovies[0].poster_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${topRatedMovies[0].poster_path}`}
                    alt={topRatedMovies[0].title}
                    fill
                    className="object-cover"
                  />
                )
              ) : (
                // Multiple movies - collage
                <div className="grid grid-cols-2 gap-2 h-full p-4">
                  {topRatedMovies.slice(0, 4).map((movie, index) => (
                    <div
                      key={movie.id}
                      className="relative overflow-hidden rounded-lg"
                    >
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                          <Film className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Animated stars */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <Star
                key={i}
                className={`absolute w-4 h-4 text-yellow-300 animate-pulse`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-md bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <Award className="w-16 h-16 mx-auto mb-6 text-yellow-300" />

            {topRatedMovies.length === 1 ? (
              <div className="text-3xl font-bold mb-4">
                {topRatedMovies[0].title}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold mb-4">
                  {topRatedMovies.length} Movies Tied!
                </div>
                <div className="text-lg mb-4 space-y-1">
                  {topRatedMovies.slice(0, 3).map((movie, index) => (
                    <div key={movie.id} className="truncate">
                      {movie.title}
                      {index === 2 && topRatedMovies.length > 4 ? ", ..." : ""}
                    </div>
                  ))}
                  {topRatedMovies.length === 4 && (
                    <div className="truncate">{topRatedMovies[3].title}</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${
                    i < maxRating
                      ? "fill-yellow-300 text-yellow-300"
                      : "text-gray-400"
                  }`}
                />
              ))}
            </div>
            <div className="text-lg opacity-90">
              Your highest rated{" "}
              {topRatedMovies.length === 1 ? "film" : "films"}
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3: Genre Breakdown with Icons
    {
      title: "Genre Explorer",
      content: (
        <div className="relative h-full flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-float"
                  style={{
                    width: `${20 + Math.random() * 40}px`,
                    height: `${20 + Math.random() * 40}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="relative z-10 text-center max-w-2xl">
            <TrendingUp className="w-16 h-16 mx-auto mb-6" />
            <div className="text-2xl font-bold mb-6">Your Genre Mix</div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(genreDistribution).map(
                ([genreName, percentage]) => {
                  return (
                    <div
                      key={genreName}
                      className="bg-white/20 rounded-lg p-4 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    >
                      <div className="text-xl font-semibold mb-2">
                        {genreName}
                      </div>
                      <div className="text-3xl font-bold text-cyan-200">
                        {percentage}%
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Most Active Month
    {
      title: "Peak Viewing",
      content: (
        <div className="relative h-full flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"></div>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-400 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
          <div className="relative z-10 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-6" />
            <div className="text-4xl font-bold mb-4">
              {topMonth[0] || "No data"}
            </div>
            <div className="text-6xl font-bold mb-4 text-yellow-300">
              {topMonth[1]}
            </div>
            <div className="text-xl opacity-90">
              movies in your most active month
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Average Rating
    {
      title: "Your Standards",
      content: (
        <div className="relative h-full flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700"></div>
          <div className="absolute inset-0 opacity-20">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-gradient-to-r from-pink-400 to-yellow-400 animate-ping"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  top: `${10 + i * 7}%`,
                  left: `${10 + i * 7}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 text-center">
            <div className="text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-8 h-8 text-yellow-300 fill-yellow-300"
                />
              ))}
            </div>
            <div className="text-xl opacity-90">Your average rating</div>
            <div className="text-lg opacity-75 mt-2">
              {avgRating >= 4
                ? "You're quite the critic!"
                : avgRating >= 3
                ? "Balanced taste!"
                : "Room for better picks!"}
            </div>
          </div>
        </div>
      ),
    },

    // Slide 6: Movie Marathon
    {
      title: "Marathon Master",
      content: (
        <div className="relative h-full flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
          </div>
          <div className="relative z-10 text-center">
            <Clock className="w-16 h-16 mx-auto mb-6" />
            <div className="text-6xl font-bold mb-4 text-green-300">
              {maxStreak}
            </div>
            <div className="text-xl mb-2">Day Movie Streak</div>
            <div className="text-lg opacity-90">
              {maxStreak > 5
                ? "Impressive dedication!"
                : maxStreak > 2
                ? "Nice consistency!"
                : "Quality over quantity!"}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 7: Yearly Summary
    {
      title: "Your Yearly Summary",
      content: (
        <div className="relative h-full flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500"></div>
          <div className="relative z-10 text-center max-w-xl bg-black/30 backdrop-blur-sm rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Here's Your Story!</h2>
            <p className="text-lg">{summaryText}</p>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl text-center">
            Your {year} Movie Wrapped
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Main slide content */}
          <div className="h-96 relative overflow-hidden rounded-lg mx-6">
            {slides[currentSlide].content}
          </div>

          {/* Navigation arrows */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-10 h-10 p-0"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-10 h-10 p-0"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Slide indicators */}
          <div className="flex justify-center space-x-2 mt-4 pb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-blue-500" : "bg-gray-300"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* Slide counter */}
        <div className="text-center text-sm text-gray-500 pb-4">
          {currentSlide + 1} of {slides.length}
        </div>
      </DialogContent>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}
