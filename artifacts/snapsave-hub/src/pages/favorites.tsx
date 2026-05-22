import { useListFavorites, useToggleFavorite } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, StarOff, Video, Music } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export function Favorites() {
  const { data: favorites = [], isLoading } = useListFavorites();
  const toggleFavorite = useToggleFavorite();
  const queryClient = useQueryClient();

  const handleRemoveFavorite = (id: number) => {
    toggleFavorite.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/history/favorites'] });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Favorites</h1>
        <p className="text-muted-foreground">Your saved downloads for quick access.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">Star your downloads in History to save them here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map(item => (
            <Card key={item.id} className="overflow-hidden bg-card/50 hover:bg-card transition-colors">
              {item.thumbnail && (
                <div className="w-full aspect-video bg-black/40 overflow-hidden relative">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 text-accent"
                    onClick={() => handleRemoveFavorite(item.id)}
                  >
                    <Star className="w-4 h-4 fill-accent" />
                  </Button>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wider">{item.platform}</span>
                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                    {item.type === 'mp4' ? <Video className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                    {item.type.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold line-clamp-2 mb-2" title={item.title}>{item.title}</h4>
                <div className="text-xs text-muted-foreground font-mono">
                  {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
