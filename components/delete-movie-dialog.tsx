"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

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

interface DeleteMovieDialogProps {
  movie: Movie | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: (movieId: string) => void
}

export function DeleteMovieDialog({ movie, open, onOpenChange, onConfirmDelete }: DeleteMovieDialogProps) {
  if (!movie) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Movie
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{movie.title}"</strong> from your movie journal? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirmDelete(movie.id)}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete Movie
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
