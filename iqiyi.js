var WidgetMetadata = {
    id: "iqiyi",           // Widget 唯一标识符
    title: "爱奇艺",     // Widget 显示标题
    description: "爱奇艺", // Widget 描述
    author: "mw418",     // 作者
    site: "https://example.com", // 网站地址
    version: "1.0.0",         // Widget 版本
    requiredVersion: "0.0.1",  // 所需 ForwardWidget 版本
    modules: [                 // 功能模块列表
        {
            title: "爱奇艺热播",     // 模块标题
            description: "Description", // 模块描述
            requiresWebView: false,    // 是否需要 WebView
            functionName: "loadhot", // 处理函数名
            sectionMode: false
        }
    ]
};



async function loadhot() {
  const url = "https://mesh.if.iqiyi.com/portal/lw/v7/channel/card/videoTab?device_id=34eba1cd42f6eea4c8cd1c23b86c2887&v=13.034.21571&channelName=recommend&data_source=v7_rec_sec_hot_rank_list&count=14&block_id=hot_ranklist&device=34eba1cd42f6eea4c8cd1c23b86c2887";
  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://mesh.if.iqiyi.com/",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  if (!response || !response.data) {
    throw new Error("获取数据失败");
  }

  console.log(response.data);
  const videoIds = [];
  let data = response.data["items"][0]["video"][0];
  const tasks = data.data.map((item) => processItem(item));

  const batchSize = 5;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    videoIds.push(...(await Promise.all(batch)));
  }

  console.log(videoIds);
  return videoIds;
}

async function processItem(item) {
  const title = item.display_name;
  let id = null;
  let type = null;

  // 查询 TMDB
  const tmdbUrl = `https://www.themoviedb.org/search/trending?query=${encodeURIComponent(title)}`;
  const tmdbRes = await Widget.http.get(tmdbUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Host": "www.themoviedb.org",
    },
  });

  if (tmdbRes.data.results.length !== 0) {
    for (const i of tmdbRes.data.results) {
      if (i.original_name === title) {
        id = i.id;
        type = 'tmdb';
        break;
      }
    }
  }

  // 查询豆瓣
  if (id === null) {
    id = await getdouban(title);
    if (id) {
      type = 'douban';
    } else {
      id = item.play_url;
      type = 'url';
    }
  }

  return {
    id: id,
    type: type,
    title: title,
    description: item.description,
    coverUrl: item.image_cover,
  };
}

async function getdouban(title) {
  const url = `https://m.douban.com/search/?query=${encodeURIComponent(title)}`;
  const res = await Widget.http.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://m.douban.com/"
    },
  });

  const docId = Widget.dom.parse(res.data);
  if (docId < 0) {
    throw new Error("解析 HTML 失败");
  }

  const modules = Widget.dom.select(docId, ".search-module");
  for (const item of modules) {
    const ele = await Widget.dom.selectFirst(item, "span");
    const text = Widget.dom.text(ele);
    if (text && text === "电影") {
      const a = await Widget.dom.selectFirst(item, "a");
      const link = await Widget.dom.attr(a, "href");
      return link.match(/subject\/(\d+)/)?.[1];
    }
  }
  return null;
}