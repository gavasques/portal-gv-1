import cron from 'node-cron';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  url: string;
}

let cachedVideos: YouTubeVideo[] = [];
let lastUpdated: Date | null = null;

const CHANNEL_HANDLE = 'guilhermeavasques';
const API_KEY = process.env.YOUTUBE_API_KEY;

async function getChannelId(handle: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${handle}&type=channel&part=snippet&maxResults=1`
    );
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId;
    }
    return null;
  } catch (error) {
    console.error('Error getting channel ID:', error);
    return null;
  }
}

async function fetchLatestVideos(): Promise<YouTubeVideo[]> {
  if (!API_KEY) {
    console.error('YouTube API key not provided');
    return [];
  }

  console.log(`Fetching videos for channel: ${CHANNEL_HANDLE}`);

  try {
    // First get channel ID
    const channelId = await getChannelId(CHANNEL_HANDLE);
    console.log(`Channel ID found: ${channelId}`);
    if (!channelId) {
      console.error('Channel not found');
      return [];
    }

    // Get latest videos
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=10&type=video`
    );
    const videosData = await videosResponse.json();

    if (!videosData.items) {
      console.error('No videos found');
      return [];
    }

    // Get video details including duration
    const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=contentDetails,snippet`
    );
    const detailsData = await detailsResponse.json();

    const videos: YouTubeVideo[] = detailsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      publishedAt: formatPublishedDate(item.snippet.publishedAt),
      duration: formatDuration(item.contentDetails.duration),
      url: `https://www.youtube.com/watch?v=${item.id}`
    }));

    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
}

function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return `há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
}

async function updateVideoCache(): Promise<void> {
  console.log('Updating YouTube video cache...');
  try {
    const videos = await fetchLatestVideos();
    if (videos.length > 0) {
      cachedVideos = videos;
      lastUpdated = new Date();
      console.log(`Updated ${videos.length} videos in cache`);
    } else {
      console.log('No videos fetched, keeping existing cache');
    }
  } catch (error) {
    console.error('Error updating video cache:', error);
  }
}

export function initializeYouTubeScheduler(): void {
  // Update cache on server start
  updateVideoCache();

  // Schedule updates at 11:00 and 20:00 daily
  cron.schedule('0 11 * * *', updateVideoCache);
  cron.schedule('0 20 * * *', updateVideoCache);
  
  console.log('YouTube scheduler initialized - updates at 11:00 and 20:00 daily');
}

export function getCachedVideos(): { videos: YouTubeVideo[], lastUpdated: Date | null } {
  return { videos: cachedVideos, lastUpdated };
}