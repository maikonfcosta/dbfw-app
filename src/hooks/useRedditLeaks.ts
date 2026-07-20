import { useState, useEffect } from 'react';

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  permalink: string;
  thumbnail: string;
  created_utc: number;
  score: string;
  is_gallery: boolean;
}

export function useRedditLeaks() {
  const [leaks, setLeaks] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaks = async () => {
      try {
        setIsLoading(true);
        // Usa a API gratuita do rss2json que converte o RSS do Reddit em JSON
        // Isso resolve completamente os bloqueios de CORS e 429 Too Many Requests do Reddit.
        const targetRss = 'https://www.reddit.com/r/dbsfusionworld/search.rss?q=leak+OR+spoiler+OR+reveal+OR+FB11+OR+FB12&restrict_sr=on&sort=new';
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetRss)}`;
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error('Falha ao carregar os dados do Reddit');
        }

        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error(data.message || 'Erro no serviço de RSS');
        }

        // Mapeia os dados brutos para o nosso formato
        const posts: RedditPost[] = data.items
          .map((item: any) => {
             // Tenta extrair uma imagem do HTML content ou do enclosure
             let imageUrl = '';
             if (item.enclosure && item.enclosure.link) {
                 imageUrl = item.enclosure.link;
             } else {
                 const imgRegex = /<img[^>]+src="([^">]+)"/;
                 const match = item.content.match(imgRegex);
                 if (match) {
                     imageUrl = match[1];
                 }
             }
             
             // Arrumar URLs do Reddit que vem formatadas pro HTML
             if (imageUrl) {
                 imageUrl = imageUrl.replace(/&amp;/g, '&');
             }

             return {
                 id: item.guid,
                 title: item.title,
                 url: imageUrl,
                 permalink: item.link,
                 thumbnail: item.thumbnail,
                 created_utc: new Date(item.pubDate).getTime(),
                 score: 'Novo', // RSS não expõe upvotes, então marcamos como Novo
                 is_gallery: false
             };
          })
          // Filtra para pegar apenas posts que pareçam ter imagem
          .filter((post: RedditPost) => post.url && post.url.length > 5);

        setLeaks(posts);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaks();
  }, []);

  return { leaks, isLoading, error };
}
