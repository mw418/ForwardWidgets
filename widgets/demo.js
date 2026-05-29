/**
 * 示例模块
 * 给 module 指定 type 为 stream 或 subtitle 后，默认会携带以下参数：
 * tmdbId: TMDB ID，Optional
 * imdbId: IMDB ID，Optional
 * id: Media ID，Optional
 * type: 类型，tv | movie
 * seriesName：剧名，Optional
 * episodeName：集名，Optional
 * season: 季，电影时为空，Optional
 * episode: 集，电影时为空，Optional
 * link: 链接，Optional
 */
WidgetMetadata = {
  id: "forward.meta.demo",
  title: "DEMO",
  icon: "https://assets.vvebo.vip/scripts/icon.png",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "演示模块",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      //id需固定为getResource
      id: "loadResource",
      title: "加载资源",
      functionName: "loadResource",
      type: "stream",
      params: [],
    },
    {
      //id需固定为getDetail
      id: "loadSubtitle",
      title: "加载字幕",
      functionName: "loadSubtitle",
      type: "subtitle",
      params: [],
    },
    {
      id: "loadList",
      title: "获取列表",
      functionName: "loadList",
      params: [
        {
          name: "page",
          title: "页码",
          type: "page",
        },
        {
          name: "count",
          title: "数量",
          type: "count",
          value: "12",
        },
      ],
    },
  ],
};

var DEMO_VIDEO_ITEMS = [
  {
    id: "demo-movie-1",
    type: "url",
    title: "演示电影 - 带详情数据",
    description: "列表项可以带分类和演员；点击详情后可通过 loadDetail 补全剧照、预告片和相关推荐。",
    posterPath: "https://picsum.photos/seed/forward-demo-poster-1/600/900",
    backdropPath: "https://picsum.photos/seed/forward-demo-backdrop-1/1280/720",
    mediaType: "movie",
    genreItems: [
      { id: "action", title: "动作" },
      { id: "sci-fi", title: "科幻" },
    ],
    peoples: [
      {
        id: "person-1",
        title: "演示演员",
        avatar: "https://picsum.photos/seed/forward-demo-person-1/400/400",
        role: "主演",
      },
      {
        id: "person-2",
        title: "演示导演",
        avatar: "https://picsum.photos/seed/forward-demo-person-2/400/400",
        role: "导演",
      },
    ],
    link: "demo-detail-1",
  },
  {
    id: 550,
    type: "tmdb",
    title: "Fight Club",
    mediaType: "movie",
  },
  {
    id: 27205,
    type: "tmdb",
    title: "Inception",
    mediaType: "movie",
  },
  {
    id: 603,
    type: "tmdb",
    title: "The Matrix",
    mediaType: "movie",
  },
  {
    id: 1399,
    type: "tmdb",
    title: "Game of Thrones",
    mediaType: "tv",
  },
  {
    id: 1396,
    type: "tmdb",
    title: "Breaking Bad",
    mediaType: "tv",
  },
  {
    id: 66732,
    type: "tmdb",
    title: "Stranger Things",
    mediaType: "tv",
  },
];

async function loadResource(params) {
  const { tmdbId, imdbId, id, type, seriesName, episodeName, season, episode, link } = params;

  return [
    {
        name: "测试资源",
        description: "资源介绍，可以包含分辨率、编码、音频等信息\n4k|DV|dts|atmos|7.1", 
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    },
    {
        name: "测试资源2",
        description: "资源介绍，可以包含分辨率、编码、音频等信息\n4k|HDR|5.1", 
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    {
        name: "测试资源3",
        description: "资源介绍，可以包含分辨率、编码、音频等信息\n1080p|HDR|aac", 
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
  ] 
  
}

async function loadSubtitle(params) {
  const { tmdbId, imdbId, id, type, seriesName, episodeName, season, episode, link } = params;

  return [
    {
        id: "test-subtitle",
        title: "测试字幕",
        lang: "en",
        count: 100,
        url: "https://dl.subhd.tv/2025/08/1754195078288.srt",
    },
  ]
}

async function loadList(params) {
  var page = Number(params.page || 1);
  var count = Number(params.count || 12);
  var start = (page - 1) * count;
  var genreId = String(params.genreId || "");
  var peopleId = String(params.peopleId || "");

  var result = [];
  for (var i = 0; i < DEMO_VIDEO_ITEMS.length; i++) {
    var item = DEMO_VIDEO_ITEMS[i];
    if (genreId && !hasGenre(item, genreId)) {
      continue;
    }
    if (peopleId && !hasPeople(item, peopleId)) {
      continue;
    }
    result.push(item);
  }

  return result.slice(start, start + count);
}

function hasGenre(item, genreId) {
  if (!item.genreItems) {
    return false;
  }
  for (var i = 0; i < item.genreItems.length; i++) {
    if (String(item.genreItems[i].id) === genreId) {
      return true;
    }
  }
  return false;
}

function hasPeople(item, peopleId) {
  if (!item.peoples) {
    return false;
  }
  for (var i = 0; i < item.peoples.length; i++) {
    if (String(item.peoples[i].id) === peopleId) {
      return true;
    }
  }
  return false;
}

async function loadDetail(link) {
  if (link !== "demo-detail-1") {
    return null;
  }

  return {
    id: "demo-movie-1",
    type: "url",
    title: "演示电影 - 带详情数据",
    description: "loadDetail 返回和 loadList 一致的 VideoItem 模型，可补充详情页展示数据。",
    posterPath: "https://picsum.photos/seed/forward-demo-poster-1/600/900",
    backdropPath: "https://picsum.photos/seed/forward-demo-backdrop-1/1280/720",
    backdropPaths: [
      "https://picsum.photos/seed/forward-demo-still-1/1280/720",
      "https://picsum.photos/seed/forward-demo-still-2/1280/720",
      "https://picsum.photos/seed/forward-demo-still-3/1280/720",
    ],
    trailers: [
      {
        coverUrl: "https://picsum.photos/seed/forward-demo-trailer-1/640/360",
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
    ],
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    releaseDate: "2025-01-01",
    mediaType: "movie",
    rating: 8.4,
    genreItems: [
      { id: "action", title: "动作" },
      { id: "sci-fi", title: "科幻" },
    ],
    peoples: [
      {
        id: "person-1",
        title: "演示演员",
        avatar: "https://picsum.photos/seed/forward-demo-person-1/400/400",
        role: "主演",
      },
      {
        id: "person-2",
        title: "演示导演",
        avatar: "https://picsum.photos/seed/forward-demo-person-2/400/400",
        role: "导演",
      },
    ],
    relatedItems: [
      {
        id: "demo-related-1",
        type: "url",
        title: "相关推荐 - 模块条目",
        posterPath: "https://picsum.photos/seed/forward-demo-related-1/600/900",
        backdropPath: "https://picsum.photos/seed/forward-demo-related-backdrop-1/1280/720",
        mediaType: "movie",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      },
      {
        id: 27205,
        type: "tmdb",
        title: "Inception",
        mediaType: "movie",
      },
    ],
    link: "demo-detail-1",
  };
}
