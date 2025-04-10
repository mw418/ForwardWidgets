var WidgetMetadata = {
    id: "iqiyi",           // Widget 唯一标识符
    title: "爱奇艺",     // Widget 显示标题
    description: "爱奇艺", // Widget 描述
    author: "Author Name",     // 作者
    site: "https://example.com", // 网站地址
    version: "1.0.0",         // Widget 版本
    requiredVersion: "0.0.1",  // 所需 ForwardWidget 版本
    modules: [                 // 功能模块列表
        {
            title: "iqiyi",     // 模块标题
            description: "Description", // 模块描述
            requiresWebView: false,    // 是否需要 WebView
            functionName: "loadhot", // 处理函数名
            sectionMode: false,
            // params: [
            //     {
            //       name: "url",
            //       title: "列表地址",
            //       type: "input",
            //       description: "IMDB 片单地址",
            //       placeholders: [
            //         {
            //           title: "IMDb Top 250 Movies",
            //           value: "https://www.imdb.com/chart/top/?ref_=nv_mv_250",
            //         },
            //         {
            //           title: "IMDb Top 250 TV",
            //           value: "https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250",
            //         },
            //       ],
            //     }      // 是否支持分段模式
            // ]
        }
    ]
};



  async function loadhot(params={}) {
    url = "https://mesh.if.iqiyi.com/portal/lw/v7/channel/card/videoTab?device_id=34eba1cd42f6eea4c8cd1c23b86c2887&v=13.034.21571&channelName=recommend&data_source=v7_hotspot_marketing_data%2Cv7_hotspot_data&count=1%2C14&block_id=hot_recommend&device=34eba1cd42f6eea4c8cd1c23b86c2887"
    const response = await Widget.http.get(url, {
      headers: {
        Referer: "https://mesh.if.iqiyi.com/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "*/*",
          "Host": "mesh.if.iqiyi.com",
          "Connection": "keep-alive",
      },
    });
    if (!response || !response.data) {
      throw new Error("获取数据失败");
    }
  
    console.log(response.data);
    const videoIds = [];
    let data = response.data["items"][0]["video"][0]
    for (const item of data.data) {
        let title = item.display_name
        const res = await Widget.http.get(url, {
            headers: {
              Referer: "https://www.themoviedb.org/search/trending?query=" + encodeURIComponent(title),
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Host": "www.themoviedb.org",
            },
          });
        let id = res.data.results[0].id
        videoIds.push({
            id: id,
            type: "tmdb",
            title: title,
            description: item.description,
            coverUrl: item.image_cover,
          });
      }
    console.log(videoIds);
    return videoIds;
  }

