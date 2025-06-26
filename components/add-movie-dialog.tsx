"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Search, Loader2 } from "lucide-react"
import Image from "next/image"


export interface Movie {
  id: string
  title: string
  poster_path?: string
  overview: string
  rating: number
  comments: string
  watchedDate: string
  tmdbId?: number
}

interface AddMovieDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMovie: (movie: Movie) => void
}

export function AddMovieDialog({ open, onOpenChange, onAddMovie }: AddMovieDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [customOverview, setCustomOverview] = useState("")

  const searchMovies = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Using a public TMDB API key for demo purposes
      // In production, this should be handled server-side
      const response = await fetch(
        `/api/search_movies?query=${encodeURIComponent(searchQuery)}`,
      )

      const data = await response.json()
      setSearchResults(data.results)

    } catch (error) {
      console.error("Error searching movies:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = () => {
    const movie: Movie = {
      id: Date.now().toString(),
      title: selectedMovie ? selectedMovie.title : customTitle,
      poster_path: selectedMovie?.poster_path || undefined,
      overview: selectedMovie ? selectedMovie.overview : customOverview,
      rating,
      comments,
      watchedDate: new Date().toISOString().split("T")[0],
      tmdbId: selectedMovie?.id,
    }

    onAddMovie(movie)

    // Reset form
    setSearchQuery("")
    setSearchResults([])
    setSelectedMovie(null)
    setRating(0)
    setComments("")
    setCustomTitle("")
    setCustomOverview("")
    onOpenChange(false)
  }

  const deselectMovie = () => {
    setSelectedMovie(null)
  }

  const renderStars = (currentRating: number, onRate: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors ${
          i < currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
        }`}
        onClick={() => onRate(i + 1)}
      />
    ))
  }

  const canSubmit = (selectedMovie || (customTitle && customOverview)) && rating > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Movie</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMovies()}
              />
              <Button onClick={searchMovies} disabled={isSearching}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <Label>Search Results:</Label>
                {searchResults.map((movie) => (
                  <Card
                    key={movie.id}
                    className={`cursor-pointer transition-colors ${
                      selectedMovie?.id === movie.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => (selectedMovie?.id === movie.id ? deselectMovie() : setSelectedMovie(movie))}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {movie.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            width={60}
                            height={90}
                            className="rounded"
                          />
                        ) : (
                          <div className="w-15 h-22 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{movie.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{movie.overview}</p>
                          <p className="text-xs text-gray-500 mt-1">{movie.release_date}</p>
                          {selectedMovie?.id === movie.id && (
                            <p className="text-xs text-blue-600 font-medium mt-1">✓ Selected - Click to deselect</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedMovie && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">Selected: {selectedMovie.title}</span>
                </div>
                <Button variant="outline" size="sm" onClick={deselectMovie}>
                  Clear Selection
                </Button>
              </div>
            )}
          </div>

          {/* Manual Entry Section */}
          {!selectedMovie && (
            <div className="space-y-4 border-t pt-4">
              <Label>Or enter movie details manually:</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Movie Title</Label>
                  <Input
                    id="title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter movie title"
                  />
                </div>
                <div>
                  <Label htmlFor="overview">Movie Summary</Label>
                  <Textarea
                    id="overview"
                    value={customOverview}
                    onChange={(e) => setCustomOverview(e.target.value)}
                    placeholder="Enter movie summary"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rating Section */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex gap-1">{renderStars(rating, setRating)}</div>
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <Label htmlFor="comments">Your Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What did you think about this movie?"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Add Movie
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
