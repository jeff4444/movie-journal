"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, Calendar, TrendingUp, Award } from "lucide-react"

interface Movie {
  id: string
  title: string
  poster_path?: string
  overview: string
  rating: number
  comments: string
  watchedDate: string
  tmdbId?: number
}

interface YearlySummaryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movies: Movie[]
  year: number
}

export function YearlySummary({ open, onOpenChange, movies, year }: YearlySummaryProps) {
  const [summary, setSummary] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSummary = async () => {
    setIsGenerating(true)

    try {
      // Simulate AI generation for demo
      // In a real app, you'd call your AI API here
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const totalMovies = movies.length
      const avgRating = movies.reduce((sum, movie) => sum + movie.rating, 0) / totalMovies
      const topRatedMovie = movies.reduce((prev, current) => (prev.rating > current.rating ? prev : current))
      const monthCounts = movies.reduce(
        (acc, movie) => {
          const month = new Date(movie.watchedDate).getMonth()
          acc[month] = (acc[month] || 0) + 1
          return acc
        },
        {} as Record<number, number>,
      )

      const peakMonth = Object.entries(monthCounts).reduce((a, b) =>
        monthCounts[Number.parseInt(a[0])] > monthCounts[Number.parseInt(b[0])] ? a : b,
      )[0]

      const monthNames = [
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
      ]

      const generatedSummary = `🎬 Your ${year} Movie Journey

What a cinematic year you've had! You watched ${totalMovies} movies with an average rating of ${avgRating.toFixed(1)} stars. 

🌟 Your highest-rated film was "${topRatedMovie.title}" with ${topRatedMovie.rating} stars - clearly a standout experience that resonated with you!

📅 ${monthNames[Number.parseInt(peakMonth)]} was your most active movie-watching month, showing your dedication to cinema during that time.

🎭 Your viewing habits show a thoughtful approach to film selection, with ratings spanning the full spectrum. This suggests you're not afraid to explore different genres and take chances on new experiences.

Keep building your cinematic journey - every movie adds to your unique story as a film enthusiast!`

      setSummary(generatedSummary)
    } catch (error) {
      console.error("Error generating summary:", error)
      setSummary("Sorry, there was an error generating your summary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const stats = {
    totalMovies: movies.length,
    avgRating:
      movies.length > 0 ? (movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length).toFixed(1) : "0",
    topRated:
      movies.length > 0 ? movies.reduce((prev, current) => (prev.rating > current.rating ? prev : current)) : null,
    monthlyBreakdown: movies.reduce(
      (acc, movie) => {
        const month = new Date(movie.watchedDate).toLocaleDateString("en-US", { month: "long" })
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your {year} Movie Wrapped</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMovies}</div>
                <p className="text-xs text-muted-foreground">Films watched this year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating}/5</div>
                <p className="text-xs text-muted-foreground">Your average score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Rated</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.topRated?.rating || 0}/5</div>
                <p className="text-xs text-muted-foreground line-clamp-1">{stats.topRated?.title || "No movies yet"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          {Object.keys(stats.monthlyBreakdown).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.monthlyBreakdown).map(([month, count]) => (
                    <Badge key={month} variant="secondary">
                      {month}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Summary</CardTitle>
              <CardDescription>AI-generated insights about your movie watching journey</CardDescription>
            </CardHeader>
            <CardContent>
              {!summary ? (
                <div className="text-center py-8">
                  <Button
                    onClick={generateSummary}
                    disabled={isGenerating || movies.length === 0}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Your Summary...
                      </>
                    ) : (
                      "Generate My Movie Summary"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-sm leading-relaxed">{summary}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
