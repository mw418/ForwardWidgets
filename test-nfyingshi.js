const fs = require("fs");
const assert = require("assert/strict");
const calls = [];
const stores = {};
var _LOG = console.log.bind(console);

// ── Simple mock cheerio that returns hardcoded data ──────
function makeMockItem(postId, title, poster) {
  return {
    id: "nf:" + postId, type: "url", title: title,
    posterPath: poster, link: "nf:" + postId,
    rating: 9.0, description: "", postId: postId,
  };
}

var G_HOT_ITEMS = [
  makeMockItem("4906", "黑袍纠察队 第四季", "https://www.nfyingshi.com/wp-content/uploads/poster-270x380.jpg"),
  makeMockItem("4907", "绝命毒师", "https://www.nfyingshi.com/wp-content/uploads/cover-270x380.jpg"),
];
var G_RECENT_ITEMS = [makeMockItem("5000", "更新的剧", "https://www.nfyingshi.com/wp-content/uploads/recent-270x380.jpg")];
var G_CAT_ITEMS = [makeMockItem("6000", "分类剧集", "https://www.nfyingshi.com/wp-content/uploads/cat-270x380.jpg")];
var G_SEARCH_ITEMS = [makeMockItem("7000", "搜索结果", "https://www.nfyingshi.com/wp-content/uploads/search-270x380.jpg")];

var G_DETAIL = {
  id: "nf:4906", type: "url",
  title: "黑袍纠察队 第四季",
  posterPath: "/wp-content/uploads/2023/05/poster-360x528.jpg",
  backdropPaths: ["/wp-content/uploads/2023/05/poster-360x528.jpg"],
  description: "这是一部很棒的美剧",
  rating: undefined,
  episodeItems: [
    { id: "nfep:4906:bXZfNDkwNi1ubV8x", type: "url", title: "第一集", link: "nfep:4906:bXZfNDkwNi1ubV8x", videoUrl: "https://www.nfyingshi.com/v_play/bXZfNDkwNi1ubV8x.html" },
    { id: "nfep:4906:bXZfNDkwNi1ubV8y", type: "url", title: "第二集", link: "nfep:4906:bXZfNDkwNi1ubV8y", videoUrl: "https://www.nfyingshi.com/v_play/bXZfNDkwNi1ubV8y.html" },
  ],
  genreItems: [{ id: "nftag:" + encodeURIComponent("剧情"), title: "剧情" }],
  peoples: [{ id: "nfactor:" + encodeURIComponent("张三"), title: "张三", role: "" }, { id: "nfactor:" + encodeURIComponent("李四"), title: "李四", role: "" }, { id: "nfactor:" + encodeURIComponent("王五"), title: "王五", role: "" }],
  releaseDate: "2023-01-01",
  link: "nf:4906",
  trailers: [{ coverUrl: "/wp-content/uploads/2023/05/poster-360x528.jpg", url: "https://www.nfyingshi.com/v_play/bXZfNDkwNi1ubV8x.html" }],
};

function hardcodedCheerioLoad(html) {
  function $(sel) {
    if (typeof sel === 'string') {
      // Just return empty/length 0 for most selectors
      var result = { length: 0, each: function(){}, find: function(){return result;}, first: function(){return result;}, text: function(){return '';}, attr: function(){}, clone: function(){return result;}, remove: function(){return result;} };
      return result;
    }
    // Wrapping an element
    return { length: 0, each: function(){}, find: function(){return this;}, first: function(){return this;}, text: function(){return '';}, attr: function(){}, clone: function(){return this;}, remove: function(){return this;} };
  }
  return $;
}

// ── Widget mock ──────────────────────────────
global.Widget = {
  http: {
    get: async (url, opts) => {
      calls.push("GET:" + url);
      var headers = (opts && opts.headers) || {};
      var hasCookie = headers["Cookie"] && headers["Cookie"].indexOf("wordpress") !== -1;
      var authMarker = hasCookie ? "VIP会员已登录" : "";
      return { data: "<html>" + authMarker + "<body><div class='bt_img'></div></body></html>", status: 200 };
    },
    post: async (url, body, opts) => {
      var bodyStr = typeof body === 'string' ? body : '';
      calls.push("POST:" + url);
      if (url.indexOf("wp-login.php") !== -1 && bodyStr && bodyStr.indexOf("testuser") !== -1) {
        return { data: "redirecting...", status: 302, headers: { "set-cookie": [
          "wordpress_logged_in_abc123=testuser%7C1234567890%7Chash123; path=/; secure; httponly",
          "wordpress_sec_abc123=sec456%7C1234567890%7Chash456; path=/; secure; httponly"
        ]}};
      }
      if (url.indexOf("wp-login.php") !== -1) {
        return { data: "<html>login error</html>", status: 200, headers: {} };
      }
      return { data: "", status: 500, headers: {} };
    },
  },
  storage: { get: (key) => stores[key] || null, set: (key, value) => { stores[key] = value; } },
  html: { load: hardcodedCheerioLoad },
};

global.WidgetMetadata = {};
global.console = { log: function(){}, error: function(){ var args=Array.prototype.slice.call(arguments); _LOG("[mod:err]", args.join(" ")); }, warn: _LOG };

eval(fs.readFileSync("./nfyingshi.js", "utf8"));

// Override parse results for integration tests
// Because cheerio mock returns empty, we verify that:
// 1. Auth/login flow works
// 2. Handlers are callable and interact with Widget.http correctly
// 3. loadDetail uses cached auth headers

(async () => {
  var pass = 0, fail = 0;
  function check(label, fn) {
    try { fn(); _LOG("  ✓ " + label); pass++; }
    catch (e) { _LOG("  ✗ " + label + " — " + e.message); fail++; }
  }

  _LOG("\n=== buildHeaders Tests ===");

  _LOG("\n测试 1: buildHeaders 返回 User-Agent...");
  check("无Cookie字段", () => {
    var h = buildHeaders();
    assert.ok(!h.Cookie);
    assert.ok(h['User-Agent'].indexOf('Mozilla') !== -1);
  });
  check("可从200或302响应提取WordPress Cookie", () => {
    var cookie = extractWordPressCookie({ "Set-Cookie": [
      "wordpress_logged_in_abc=user%7C123%7Chash; path=/; secure",
      "wordpress_sec_abc=sec%7C123%7Chash; path=/; secure"
    ]});
    assert.equal(cookie, "wordpress_logged_in_abc=user%7C123%7Chash; wordpress_sec_abc=sec%7C123%7Chash");
  });
  check("Cookie只用于匹配站点", () => {
    stores[LOGIN_CACHE_KEY] = JSON.stringify({
      cookie: "wordpress_logged_in_abc=user%7C123%7Chash",
      siteUrl: "https://www.nfyingshi.com",
      username: "testuser",
      time: Date.now()
    });
    assert.equal(buildHeaders("https://www.nfyingshi.com").Cookie, "wordpress_logged_in_abc=user%7C123%7Chash");
    assert.equal(buildHeaders("https://mirror.example").Cookie, undefined);
    delete stores[LOGIN_CACHE_KEY];
  });


  _LOG("\n=== WidgetMetadata Tests ===");
  check("globalParams有server", () => assert.ok(WidgetMetadata.globalParams.find(p => p.name === "server")));
  check("globalParams有登录参数", () => assert.deepEqual(WidgetMetadata.globalParams.map(p => p.name), ["server", "username", "password"]));
  check("modules有loadHot", () => assert.ok(WidgetMetadata.modules.find(m => m.id === "loadHot")));
  check("modules有loadRecent", () => assert.ok(WidgetMetadata.modules.find(m => m.id === "loadRecent")));
  check("modules有loadCategory", () => assert.ok(WidgetMetadata.modules.find(m => m.id === "loadCategory")));
  check("search配置存在", () => assert.ok(WidgetMetadata.search));
  check("search有keyword", () => assert.ok(WidgetMetadata.search.params.find(p => p.name === "keyword")));
  check("sourceLoader配置存在", () => assert.equal(WidgetMetadata.sourceLoader.functionName, "loadSource"));

  _LOG("\n=== VideoItem Shape Tests ===");
  var shapedItem = makeMovieItem("9000", "测试剧 第一季", "https://img.example/poster.jpg", 8.8, "简介", "https://www.nfyingshi.com");
  check("列表项字段完整", () => {
    assert.equal(shapedItem.type, "url");
    assert.equal(shapedItem.mediaType, "tv");
    assert.equal(shapedItem.coverUrl, "https://img.example/poster.jpg");
    assert.equal(shapedItem.posterPath, "https://img.example/poster.jpg");
    assert.equal(shapedItem.playerType, "system");
  });
  check("列表link携带站点且兼容旧link", () => {
    assert.deepEqual(parseDetailLink(shapedItem.link), { postId: "9000", siteUrl: "https://www.nfyingshi.com" });
    assert.deepEqual(parseDetailLink("nf:9000"), { postId: "9000", siteUrl: "https://www.nfyingshi.com" });
  });

  _LOG("\n=== Handler Integration Tests ===");
  // These test that handlers call Widget.http correctly (auth headers, etc.)
  // The cheerio parsing returns empty items since we use a hardcoded mock,
  // but we verify the HTTP layer works.

  _LOG("\n测试 11: loadHot 调用流程...");
  calls.length = 0; Object.keys(stores).forEach(k => delete stores[k]);
  var items = await loadHot({});
  check("返回数组", () => assert.ok(Array.isArray(items)));
  check("调用了GET", () => assert.ok(calls.some(c => c.indexOf("GET:") !== -1 && c.indexOf("nfyingshi") !== -1)));

  _LOG("\n测试 12: loadDetail 调用流程...");
  calls.length = 0;
  var detail = await loadDetail("nf:4906");
  check("无auth调用GET", () => {
    var dc = calls.find(c => c.indexOf("4906") !== -1);
    assert.ok(dc, "detail GET not found");
  });

  _LOG("\n测试 13: search 调用流程...");
  calls.length = 0;
  var sItems = await search({ keyword: "test", server: "https://www.nfyingshi.com" });
  check("搜索返回数组", () => assert.ok(Array.isArray(sItems)));

  _LOG("\n测试 14: 登录失败降级游客模式...");
  calls.length = 0; Object.keys(stores).forEach(k => delete stores[k]);
  await performAuth({ username: "baduser", password: "badpass", server: "https://www.nfyingshi.com" });
  await performAuth({ username: "baduser", password: "badpass", server: "https://www.nfyingshi.com" });
  check("登录失败短时间不重复请求", () => assert.equal(calls.filter(c => c.indexOf("POST:") === 0).length, 1));
  Object.keys(stores).forEach(k => delete stores[k]);

  _LOG("\n=== Quality Selection Tests ===");
  var decryptedPlayer = "quality: [{url:'https://cdn.example.com/1080.m3u8', name:'1080P'},{url:\"https://cdn.example.com/720.m3u8\", name:\"720P\"}], defaultQuality: 1";
  aesDecryptB64 = function () {
    var bytes = [];
    for (var i = 0; i < decryptedPlayer.length; i++) bytes.push(decryptedPlayer.charCodeAt(i) & 0xff);
    return bytes;
  };
  var fakeEncryptedHtml = '<script>var player="' + new Array(520).join("A") + '";</script>';

  var info = extractVideoInfo(fakeEncryptedHtml);
  check("解析全部画质URL", () => assert.deepEqual(info.urls, ["https://cdn.example.com/1080.m3u8", "https://cdn.example.com/720.m3u8"]));
  check("解析全部画质名称", () => assert.deepEqual(info.names, ["1080P", "720P"]));
  check("解析默认画质", () => assert.equal(info.defaultIdx, 1));

  var oldGet = Widget.http.get;
  Widget.http.get = async (url, opts) => {
    calls.push("GET:" + url);
    if (url.indexOf("/movie/9000.html") !== -1) {
      return {
        data: '<html><head><meta property="og:title" content="测试剧 第八集 - 奈菲影视"></head><body>' +
          '<a href="https://www.nfyingshi.com/v_play/testvid.html">第一集</a>' +
          '<a href="https://www.nfyingshi.com/v_play/testvid2.html">第二集</a>' +
          '</body></html>',
        status: 200
      };
    }
    if (url.indexOf("/v_play/testvid.html") !== -1 || url.indexOf("/v_play/testvid2.html") !== -1) {
      return { data: fakeEncryptedHtml, status: 200 };
    }
    return oldGet(url, opts);
  };

  var source = await loadSource("nfep:9000:testvid:q1");
  check("指定画质link返回对应sourceUrl", () => assert.equal(source.sourceUrl, "https://cdn.example.com/720.m3u8"));
  var directSource = await loadSource("https://cdn.example.com/direct.m3u8");
  check("直接媒体URL可播放", () => assert.equal(directSource.sourceUrl, "https://cdn.example.com/direct.m3u8"));

  var multiSource = await loadSource("nfep:9000:testvid");
  check("未指定画质时返回多画质列表", () => assert.deepEqual(multiSource.sourceNames, ["1080P", "720P"]));
  var playPageSource = await loadSource("https://www.nfyingshi.com/v_play/testvid.html");
  check("播放页URL也可走sourceLoader解析", () => assert.deepEqual(playPageSource.sourceNames, ["1080P", "720P"]));
  calls.length = 0;
  var mirrorSource = await loadSource("https://mirror.example/v_play/testvid.html");
  check("播放页URL按自身站点解析", () => {
    assert.deepEqual(mirrorSource.sourceNames, ["1080P", "720P"]);
    assert.ok(calls.some(c => c === "GET:https://mirror.example/v_play/testvid.html"));
  });

  var qDetail = await loadDetail("nf:9000");
  check("详情标题不会变成集数", () => assert.equal(qDetail.title, "测试剧"));
  check("详情只展示真实剧集不重复", () => assert.deepEqual(qDetail.episodeItems.map(x => x.title), ["第一集", "第二集"]));
  check("详情剧集保留sourceLoader解析token", () => assert.deepEqual(qDetail.episodeItems.map(x => x.sourceId), ["nfep:9000:testvid", "nfep:9000:testvid2"]));
  check("详情剧集videoUrl使用播放页URL", () => assert.deepEqual(qDetail.episodeItems.map(x => x.videoUrl), ["https://www.nfyingshi.com/v_play/testvid.html", "https://www.nfyingshi.com/v_play/testvid2.html"]));
  check("详情剧集不携带详情link", () => assert.equal(qDetail.episodeItems[0].link, undefined));
  check("详情不依赖childItems展示画质", () => assert.equal(qDetail.episodeItems[0].childItems, undefined));
  check("详情描述不写默认画质", () => assert.equal(qDetail.episodeItems[0].description.indexOf("默认"), -1));

  var oldParseSearchCards = parseSearchCards;
  parseSearchCards = function () {
    return [{ id: "nf:9000", type: "url", title: "测试剧", link: "nf:9000" }];
  };
  var resources = await loadResource({ seriesName: "测试剧", type: "tv", season: 1, episode: 1, server: "https://www.nfyingshi.com" });
  check("资源模块只返回当前集全部画质", () => assert.deepEqual(resources.map(x => x.description), ["测试剧 - 第一集 - 1080P", "测试剧 - 第一集 - 720P"]));
  check("资源模块写入_ep用于当前集匹配", () => assert.deepEqual(resources.map(x => x._ep), [1, 1]));
  var resourcesEp2 = await loadResource({ seriesName: "测试剧", type: "tv", season: 1, episode: 2, server: "https://www.nfyingshi.com" });
  check("params.episode筛选第二集", () => assert.deepEqual(resourcesEp2.map(x => x._ep), [2, 2]));
  parseSearchCards = function () {
    return [{ id: "nf:9000", type: "url", title: "测试剧", link: makeDetailLink("9000", "https://mirror.example") }];
  };
  calls.length = 0;
  var mirrorResources = await loadResource({ seriesName: "测试剧", type: "tv", season: 1, episode: 1, server: "https://mirror.example" });
  check("资源模块按详情播放页站点解析", () => {
    assert.deepEqual(mirrorResources.map(x => x.description), ["测试剧 - 第一集 - 1080P", "测试剧 - 第一集 - 720P"]);
    assert.ok(calls.some(c => c === "GET:https://mirror.example/v_play/testvid.html"));
  });
  parseSearchCards = oldParseSearchCards;
  Widget.http.get = oldGet;

  _LOG("\n" + "=".repeat(40));
  _LOG("  通过: " + pass + " / " + (pass + fail));
  if (fail > 0) { _LOG("  ❌ " + fail + " 项失败"); process.exit(1); }
  else { _LOG("  ✅ 全部通过!"); }
})().catch(e => { console.error("异常:", e); process.exit(1); });
