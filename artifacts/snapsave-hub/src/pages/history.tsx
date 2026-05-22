import { useListHistory, useToggleFavorite, useDeleteHistory, useGetStats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Download, Video, Music } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export function History() {
  const { data: history = [], isLoading } = useListHistory();
  const toggleFavorite = useToggleFavorite();
  const deleteHistory = useDeleteHistory();
  const queryClient = useQueryClient();

  const handleToggleFavorite = (id: number) => {
    toggleFavorite.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/history/favorites'] });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteHistory.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Recent Downloads</h1>
        <p className="text-muted-foreground">Your download history across all platforms.</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No history yet</h3>
          <p className="text-muted-foreground">Your downloaded media will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map(item => (
            <Card key={item.id} className="overflow-hidden bg-card/50 hover:bg-card transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                {item.thumbnail ? (
                  <div className="w-24 h-16 bg-black/40 rounded shrink-0 overflow-hidden">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-16 bg-muted rounded shrink-0 flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wider">{item.platform}</span>
                    <span className="text-xs flex items-center gap-1 text-muted-foreground">
                      {item.type === 'mp4' ? <Video className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold truncate" title={item.title}>{item.title}</h4>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')} • {item.filesize ? (item.filesize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(item.id)}>
                    <Star className={`w-5 h-5 ${item.favorited ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
