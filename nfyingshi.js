/**
 * 奈菲影视 Widget
 * 基于 https://nfyingshi.com/ 网站的影视内容获取组件
 */
WidgetMetadata = {
  id: "forward.nfyingshi",
  title: "奈菲影视",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "获取奈菲影视的美剧、英剧、韩剧、纪录片等影视内容，支持账号登录",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  detailCacheDuration: 300, // 详情缓存5分钟
  globalParams: [
    {
      name: "username",
      title: "用户名",
      type: "input",
      description: "奈菲影视账号用户名，留空则使用游客模式",
      value: "",
      placeholders: [
        {
          title: "游客模式",
          value: ""
        }
      ]
    },
    {
      name: "password",
      title: "密码",
      type: "input",
      description: "奈菲影视账号密码，留空则使用游客模式",
      value: "",
      placeholders: [
        {
          title: "游客模式",
          value: ""
        }
      ]
    }
  ],
  modules: [
    {
      id: "hot",
      title: "热映推荐",
      functionName: "getHotMovies",
      cacheDuration: 1800, // 30分钟缓存
      params: [
        {
          name: "page",
          title: "页码",
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "recent",
      title: "近期更新",
      functionName: "getRecentUpdates",
      cacheDuration: 600, // 10分钟缓存，更频繁更新
      params: [
        {
          name: "page",
          title: "页码",
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "drama",
      title: "美剧",
      functionName: "getDramas",
      cacheDuration: 1800,
      params: [
        {
          name: "page",
          title: "页码", 
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "british",
      title: "英剧",
      functionName: "getBritishDramas",
      cacheDuration: 1800,
      params: [
        {
          name: "page",
          title: "页码",
          type: "page", 
          value: "1"
        }
      ]
    },
    {
      id: "korean",
      title: "韩剧",
      functionName: "getKoreanDramas", 
      cacheDuration: 1800,
      params: [
        {
          name: "page",
          title: "页码",
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "reality",
      title: "真人秀",
      functionName: "getRealityShows",
      cacheDuration: 1800,
      params: [
        {
          name: "page", 
          title: "页码",
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "documentary",
      title: "纪录片",
      functionName: "getDocumentaries",
      cacheDuration: 1800,
      params: [
        {
          name: "page",
          title: "页码",
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "movies",
      title: "热门电影", 
      functionName: "getHotMovies",
      cacheDuration: 1800,
      params: [
        {
          name: "page",
          title: "页码",
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "search",
      title: "搜索",
      functionName: "searchContent",
      params: [
        {
          name: "keyword",
          title: "搜索关键词",
          type: "input",
          description: "输入要搜索的影视作品名称",
          value: ""
        },
        {
          name: "page",
          title: "页码",
          type: "page", 
          value: "1"
        }
      ]
    }
  ],
  search: {
    title: "搜索影视",
    functionName: "searchContent",
    params: [
      {
        name: "keyword", 
        title: "搜索关键词",
        type: "input",
        description: "输入要搜索的影视作品名称"
      }
    ]
  }
};

// 基础配置
const BASE_URL = "https://nfyingshi.com";
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Referer": BASE_URL,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Connection": "keep-alive"
};

// 网络请求配置
const REQUEST_OPTIONS = {
  timeout: 30000, // 30秒超时
  retry: 3, // 最多重试3次
  retryDelay: 2000 // 重试间隔2秒
};

// 登录状态管理
let isLoggedIn = false;
let loginCookies = '';
let currentUsername = '';
let currentPassword = '';

/**
 * 执行用户登录
 */
async function performLogin(username, password) {
  try {
    if (!username || !password) {
      console.log("使用游客模式访问");
      isLoggedIn = false;
      loginCookies = '';
      return true;
    }

    console.log(`尝试登录用户: ${username}`);
    
    // 首先获取登录页面获取必要的token
    const loginPageResponse = await Widget.http.get(`${BASE_URL}/login`, {
      headers: DEFAULT_HEADERS
    });
    
    if (!loginPageResponse || !loginPageResponse.data) {
      throw new Error("无法访问登录页面");
    }
    
    // 解析登录页面获取CSRF token或其他必要信息
    const $ = Widget.html.load(loginPageResponse.data);
    let csrfToken = '';
    
    // 查找CSRF token (常见的选择器)
    const tokenSelectors = [
      'input[name="_token"]',
      'input[name="csrf_token"]', 
      'input[name="authenticity_token"]',
      'meta[name="csrf-token"]'
    ];
    
    for (const selector of tokenSelectors) {
      const tokenElement = $(selector);
      if (tokenElement.length > 0) {
        csrfToken = tokenElement.attr('value') || tokenElement.attr('content') || '';
        if (csrfToken) {
          console.log(`找到CSRF token: ${csrfToken.substring(0, 10)}...`);
          break;
        }
      }
    }
    
    // 构建登录数据
    const loginData = {
      username: username,
      password: password
    };
    
    // 如果有CSRF token则添加
    if (csrfToken) {
      loginData['_token'] = csrfToken;
    }
    
    // 发送登录请求
    const loginResponse = await Widget.http.post(`${BASE_URL}/login`, loginData, {
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!loginResponse) {
      throw new Error("登录请求失败");
    }
    
    // 检查登录响应
    const setCookieHeader = loginResponse.headers['set-cookie'];
    if (setCookieHeader) {
      loginCookies = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
      console.log("登录成功，获取到认证cookie");
      isLoggedIn = true;
      currentUsername = username;
      currentPassword = password;
      return true;
    } else {
      // 检查响应内容判断登录状态
      const responseText = loginResponse.data || '';
      if (responseText.includes('dashboard') || responseText.includes('user') || responseText.includes('logout')) {
        console.log("登录成功（基于响应内容判断）");
        isLoggedIn = true;
        currentUsername = username;
        currentPassword = password;
        return true;
      } else {
        console.log("登录失败，可能用户名或密码错误");
        return false;
      }
    }
    
  } catch (error) {
    console.error("登录过程出错:", error);
    return false;
  }
}

/**
 * 确保用户已登录（如果配置了账号信息）
 */
async function ensureLogin(params) {
  const username = params.username || '';
  const password = params.password || '';
  
  // 如果没有配置账号信息，使用游客模式
  if (!username || !password) {
    if (!isLoggedIn && (currentUsername || currentPassword)) {
      // 从有账号状态切换到游客状态
      console.log("切换到游客模式");
      isLoggedIn = false;
      loginCookies = '';
      currentUsername = '';
      currentPassword = '';
    }
    return true;
  }
  
  // 检查是否需要重新登录
  if (!isLoggedIn || currentUsername !== username || currentPassword !== password) {
    const loginSuccess = await performLogin(username, password);
    if (!loginSuccess && username && password) {
      console.warn("账号登录失败，将使用游客模式");
      isLoggedIn = false;
      loginCookies = '';
    }
  }
  
  return true;
}

/**
 * 获取带认证信息的请求头
 */
function getAuthenticatedHeaders() {
  const headers = { ...DEFAULT_HEADERS };
  
  if (isLoggedIn && loginCookies) {
    headers['Cookie'] = loginCookies;
  }
  
  return headers;
}



/**
 * 解析视频项目信息
 */
function parseVideoItem($, element, baseUrl = BASE_URL) {
  try {
    const $item = $(element);
    
    // 调试：输出元素HTML结构（前100个字符）
    const elementHtml = $item.html();
    if (elementHtml) {
      console.log(`解析元素HTML: ${elementHtml.substring(0, 100)}...`);
    }
    
    // 更全面的链接查找
    let link = '';
    const linkSelectors = [
      'a[href]',
      '[data-href]',
      '[data-url]'
    ];
    
    for (const selector of linkSelectors) {
      const linkElement = $item.find(selector).first();
      if (linkElement.length > 0) {
        link = linkElement.attr('href') || linkElement.attr('data-href') || linkElement.attr('data-url') || '';
        if (link) break;
      }
    }
    
    // 如果元素本身是链接
    if (!link && $item.is('a')) {
      link = $item.attr('href') || '';
    }
    
    if (!link) {
      console.log("未找到有效链接，跳过该元素");
      return null;
    }
    
    const fullLink = link.startsWith('http') ? link : (link.startsWith('/') ? baseUrl + link : baseUrl + '/' + link);
    
    // 更全面的标题查找
    let title = '';
    const titleSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '.title', '.name', '.movie-title', '.video-title',
      '.entry-title', '.post-title',
      '[title]', 'a[title]', 'img[alt]'
    ];
    
    // 先尝试从链接的标题属性获取
    const linkTitle = $item.find('a').first().attr('title') || '';
    if (linkTitle && linkTitle.trim() && !linkTitle.includes('首页') && !linkTitle.includes('APP下载')) {
      title = linkTitle.trim();
    }
    
    // 如果链接标题不合适，再尝试其他选择器
    if (!title) {
      for (const selector of titleSelectors) {
        const titleElement = $item.find(selector).first();
        if (titleElement.length > 0) {
          const elementTitle = titleElement.text().trim() || titleElement.attr('title') || titleElement.attr('alt') || '';
          if (elementTitle && elementTitle !== '' && !elementTitle.includes('首页') && !elementTitle.includes('APP下载')) {
            title = elementTitle;
            break;
          }
        }
      }
    }
    
    // 如果仍然没有找到合适的标题，尝试从链接文本获取
    if (!title) {
      const linkText = $item.find('a').first().text().trim();
      if (linkText && !linkText.includes('首页') && !linkText.includes('APP下载') && linkText.length > 2) {
        title = linkText;
      }
    }
    
    if (!title || title === '') {
      console.log("未找到有效标题，跳过该元素");
      return null;
    }
    
    console.log(`找到视频: ${title} -> ${fullLink}`);
    
    // 获取封面图 - 优先处理懒加载图片
    let posterPath = '';
    const imgElement = $item.find('img').first();
    
    if (imgElement.length > 0) {
      // 优先获取data-src（懒加载的真实图片地址）
      posterPath = imgElement.attr('data-src') || imgElement.attr('data-original') || imgElement.attr('src') || '';
      
      console.log(`图片信息: src="${imgElement.attr('src')}", data-src="${imgElement.attr('data-src')}"`);
      
      // 如果仍然是blank.gif，尝试其他属性
      if (posterPath.includes('blank.gif') || !posterPath) {
        const altAttributes = ['data-lazy-src', 'data-image', 'data-bg'];
        for (const attr of altAttributes) {
          const altSrc = imgElement.attr(attr);
          if (altSrc && !altSrc.includes('blank.gif')) {
            posterPath = altSrc;
            break;
          }
        }
      }
    }
    
    // 处理相对路径
    if (posterPath && !posterPath.startsWith('http') && !posterPath.includes('blank.gif')) {
      posterPath = posterPath.startsWith('//') ? 'https:' + posterPath : 
                   posterPath.startsWith('/') ? baseUrl + posterPath : baseUrl + '/' + posterPath;
    }
    
    // 如果还是blank.gif，尝试从alt属性构建默认图片
    if (posterPath.includes('blank.gif') || !posterPath) {
      const altText = imgElement.attr('alt') || title;
      if (altText) {
        // 使用一个通用的占位符服务或者设置为空
        posterPath = `https://via.placeholder.com/300x450/333333/ffffff?text=${encodeURIComponent(altText)}`;
      }
    }
    
    // 获取评分
    let rating = 0;
    const ratingSelectors = ['.rating', '.score', '.imdb', '.star', '[class*="rate"]'];
    for (const selector of ratingSelectors) {
      const ratingText = $item.find(selector).text().trim();
      const ratingNum = parseFloat(ratingText);
      if (!isNaN(ratingNum)) {
        rating = ratingNum;
        break;
      }
    }
    
    // 获取年份/日期
    const dateSelectors = ['.year', '.date', '.time', '[class*="year"]', '[class*="date"]'];
    let dateText = '';
    for (const selector of dateSelectors) {
      dateText = $item.find(selector).text().trim();
      if (dateText) break;
    }
    
    // 获取描述
    const descSelectors = ['.desc', '.description', '.synopsis', '.summary', 'p', '.content'];
    let description = '';
    for (const selector of descSelectors) {
      description = $item.find(selector).text().trim();
      if (description && description.length > 10) break; // 确保描述有一定长度
    }
    
    // 获取类型信息
    const genreSelectors = ['.genre', '.type', '.category', '.tag', '[class*="genre"]'];
    let genreText = '';
    for (const selector of genreSelectors) {
      genreText = $item.find(selector).text().trim();
      if (genreText) break;
    }
    
    // 生成唯一ID
    const id = link.replace(/[^a-zA-Z0-9]/g, '_');
    
    const videoItem = {
      id: id,
      type: "link", // 链接类型，需要通过loadDetail获取视频URL
      title: title,
      description: description,
      posterPath: posterPath,
      backdropPath: posterPath, // 暂时使用相同图片
      releaseDate: dateText,
      rating: rating,
      genreTitle: genreText,
      link: fullLink,
      mediaType: inferMediaType(title, genreText),
      playerType: "system" // 改为system，表示使用系统播放器播放解析出的直接URL
    };
    
    console.log(`成功解析视频项目: ${title}`);
    return videoItem;
    
  } catch (error) {
    console.error("解析视频项目失败:", error);
    return null;
  }
}

/**
 * 推断媒体类型
 */
function inferMediaType(title, genre) {
  const lowerTitle = title.toLowerCase();
  const lowerGenre = genre.toLowerCase();
  
  // 电影关键词
  if (lowerTitle.includes('电影') || lowerGenre.includes('movie') || lowerGenre.includes('电影')) {
    return 'movie';
  }
  
  // 电视剧关键词
  if (lowerTitle.includes('第') && lowerTitle.includes('季') || 
      lowerTitle.includes('season') || lowerGenre.includes('剧') ||
      lowerTitle.includes('剧')) {
    return 'tv';
  }
  
  return 'tv'; // 默认为电视剧
}

/**
 * 获取热映推荐
 */
async function getHotMovies(params = {}) {
  try {
    console.log("获取热映推荐，页码:", params.page || 1);
    
    // 确保登录状态
    await ensureLogin(params);
    
    const url = `${BASE_URL}`;
    const response = await Widget.http.get(url, {
      headers: getAuthenticatedHeaders()
    });
    
    if (!response || !response.data) {
      throw new Error("获取热映推荐失败");
    }
    
    const $ = Widget.html.load(response.data);
    if (!$) {
      throw new Error("解析HTML失败");
    }
    
    // 查找热映推荐区域的视频项目
    const items = [];
    const selectors = [
      '.hot-list .item',
      '.recommend-list .item', 
      '.movie-item',
      '.video-item',
      '.content-item'
    ];
    
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`找到 ${elements.length} 个项目使用选择器: ${selector}`);
        elements.each((i, element) => {
          const item = parseVideoItem($, element);
          if (item) {
            items.push(item);
          }
        });
        break;
      }
    }
    
    console.log(`解析完成，共获取到 ${items.length} 个热映推荐`);
    return items.slice(0, 20); // 限制返回20个项目
    
  } catch (error) {
    console.error("获取热映推荐失败:", error);
    throw error;
  }
}

/**
 * 获取美剧
 */
async function getDramas(params = {}) {
  return await getCategoryContent('美剧', params.page || 1, params);
}

/**
 * 获取英剧  
 */
async function getBritishDramas(params = {}) {
  return await getCategoryContent('英剧', params.page || 1, params);
}

/**
 * 获取韩剧
 */
async function getKoreanDramas(params = {}) {
  return await getCategoryContent('韩剧', params.page || 1, params);
}

/**
 * 获取真人秀
 */
async function getRealityShows(params = {}) {
  return await getCategoryContent('真人秀', params.page || 1, params);
}

/**
 * 获取纪录片
 */
async function getDocumentaries(params = {}) {
  return await getCategoryContent('纪录片', params.page || 1, params);
}

/**
 * 获取近期更新
 */
async function getRecentUpdates(params = {}) {
  try {
    console.log("获取近期更新，页码:", params.page || 1);
    
    // 确保登录状态
    await ensureLogin(params);
    
    // 使用首页获取最新更新内容
    const url = `${BASE_URL}${params.page > 1 ? `/page/${params.page}` : ''}`;
    console.log(`请求URL: ${url}`);
    
    const response = await Widget.http.get(url, {
      headers: getAuthenticatedHeaders()
    });
    
    if (!response || !response.data) {
      throw new Error("获取近期更新失败");
    }
    
    const $ = Widget.html.load(response.data);
    if (!$) {
      throw new Error("解析HTML失败");
    }
    
    // 查找最新内容的选择器
    const items = [];
    const selectors = [
      // 首页最新内容选择器
      '.recent-posts article',
      '.latest-movies .movie-item', 
      '.new-releases .item',
      '.homepage-content article',
      'main .post',
      '.content-wrapper article',
      // 通用文章选择器
      'article[class*="post"]',
      '.post-item',
      '.entry'
    ];
    
    console.log("解析HTML，查找近期更新内容...");
    
    // 尝试所有可能的选择器
    let foundItems = 0;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`使用选择器 "${selector}" 找到 ${elements.length} 个元素`);
        elements.each((i, element) => {
          const item = parseVideoItem($, element);
          if (item && item.title && item.title !== '未知标题') {
            // 对于近期更新，不进行分类过滤
            items.push(item);
            foundItems++;
          }
        });
        
        // 如果找到了内容就停止
        if (foundItems > 0) {
          break;
        }
      }
    }
    
    console.log(`解析完成，共获取到 ${items.length} 个近期更新内容`);
    return items.slice(0, 20); // 限制返回20个最新项目
    
  } catch (error) {
    console.error("获取近期更新失败:", error);
    throw error;
  }
}

/**
 * 获取分类内容的通用方法
 */
async function getCategoryContent(category, page = 1, params = {}) {
  try {
    console.log(`获取${category}内容，页码: ${page}`);
    
    // 确保登录状态
    await ensureLogin(params);
    
    // 构建分类URL (根据测试结果发现的实际路径)
    const categoryUrlMap = {
      '美剧': '/movie_bt_series/meiju',
      '英剧': '/movie_bt_series/%e8%8b%b1%e5%89%a7', 
      '韩剧': '/movie_bt_series/hanju',
      '真人秀': '/movie_bt_series/%e7%9c%9f%e4%ba%ba%e7%a7%80',
      '纪录片': '/movie_bt_series/jilupian',
      '热门电影': '/movie_bt_tags/dongzuo' // 使用动作片作为热门电影的示例
    };
    
    // 使用发现的分类路径
    let url = `${BASE_URL}`;
    const categoryPath = categoryUrlMap[category];
    
    if (categoryPath) {
      url = `${BASE_URL}${categoryPath}${page > 1 ? `/page/${page}` : ''}`;
    } else {
      // 如果没有找到对应分类，使用首页
      url = `${BASE_URL}${page > 1 ? `/page/${page}` : ''}`;
    }
    
    const response = await Widget.http.get(url, {
      headers: getAuthenticatedHeaders()
    });
    
    if (!response || !response.data) {
      throw new Error(`获取${category}内容失败`);
    }
    
    const $ = Widget.html.load(response.data);
    if (!$) {
      throw new Error("解析HTML失败"); 
    }
    
    // 查找视频项目 - 先分析HTML结构
    const items = [];
    
    // 调试：查找所有可能的视频容器
    console.log("=== HTML结构分析 ===");
    const allLinks = $('a[href*="movie"], a[href*="tv"], a[href*="watch"], a[href*="play"]');
    console.log(`包含影视关键词的链接: ${allLinks.length} 个`);
    
    const allImages = $('img[src], img[data-src]');
    console.log(`所有图片元素: ${allImages.length} 个`);
    
    const allArticles = $('article');
    console.log(`所有article元素: ${allArticles.length} 个`);
    
    const allDivs = $('div[class*="movie"], div[class*="video"], div[class*="item"], div[class*="card"]');
    console.log(`包含相关class的div: ${allDivs.length} 个`);
    
    // 更广泛的选择器，包括所有可能的内容项
    const selectors = [
      'a[href*="movie"]', // 包含movie的链接
      'a[href*="tv"]', // 包含tv的链接  
      'div[class*="movie"]', // 包含movie的div
      'div[class*="video"]', // 包含video的div
      'div[class*="item"]', // 包含item的div
      'article', // 所有文章
      '.post', // 文章类
      '.entry', // 条目类
      '.card' // 卡片类
    ];
    
    console.log(`解析HTML，查找${category}内容...`);
    
    // 调试：输出HTML结构摘要
    const bodyContent = $('body').html() || '';
    console.log(`页面body长度: ${bodyContent.length} 字符`);
    
    // 查找常见的内容容器
    const commonContainers = [
      'main', '.main', '#main',
      '.content', '#content', '.site-content',
      '.container', '.wrapper', '.page-content',
      'article', '.posts', '.entries'
    ];
    
    for (const container of commonContainers) {
      const containerElement = $(container);
      if (containerElement.length > 0) {
        console.log(`找到容器 "${container}": ${containerElement.length} 个`);
      }
    }
    
    // 尝试所有可能的选择器
    let foundItems = 0;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`使用选择器 "${selector}" 找到 ${elements.length} 个元素`);
        elements.each((i, element) => {
          const item = parseVideoItem($, element);
          if (item && item.title && item.title !== '未知标题') {
            // 直接添加所有解析到的内容，因为访问的就是分类页面
            // 奈菲影视的分类页面本身就包含了对应分类的内容
            items.push(item);
            foundItems++;
            console.log(`✅ 添加项目: ${item.title}`);
          }
        });
        
        // 如果找到了内容就停止
        if (foundItems > 0) {
          break;
        }
      }
    }
    
    console.log(`解析完成，共获取到 ${items.length} 个${category}内容`);
    return items;
    
  } catch (error) {
    console.error(`获取${category}内容失败:`, error);
    throw error;
  }
}

/**
 * 搜索内容
 */
async function searchContent(params = {}) {
  try {
    const keyword = params.keyword;
    const page = params.page || 1;
    
    if (!keyword) {
      throw new Error("搜索关键词不能为空");
    }
    
    console.log(`搜索内容: ${keyword}，页码: ${page}`);
    
    // 确保登录状态
    await ensureLogin(params);
    
    // 构建搜索URL - 修正搜索路径
    const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(keyword)}${page > 1 ? `&page=${page}` : ''}`;
    
    const response = await Widget.http.get(searchUrl, {
      headers: getAuthenticatedHeaders()
    });
    
    if (!response || !response.data) {
      throw new Error("搜索请求失败");
    }
    
    const $ = Widget.html.load(response.data);
    if (!$) {
      throw new Error("解析搜索结果失败");
    }
    
    // 查找搜索结果项目
    const items = [];
    const selectors = [
      '.search-results .result-item',
      '.search-list .search-item',
      '.movie-list .movie-item',
      '.content-list .content-item',
      '.list-item',
      '.item'
    ];
    
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`找到 ${elements.length} 个搜索结果使用选择器: ${selector}`);
        elements.each((i, element) => {
          const item = parseVideoItem($, element);
          if (item) {
            items.push(item);
          }
        });
        break;
      }
    }
    
    console.log(`搜索完成，共找到 ${items.length} 个结果`);
    return items;
    
  } catch (error) {
    console.error("搜索失败:", error);
    throw error;
  }
}

/**
 * 画质优先级定义（数值越高优先级越高）
 */
const QUALITY_PRIORITY = {
  '4k': 100,
  '2160p': 100,
  'uhd': 100,
  '1080p': 80,
  'fhd': 80,
  '720p': 60,
  'hd': 60,
  '480p': 40,
  'sd': 40,
  '360p': 20,
  '240p': 10
};

/**
 * 解析视频源信息
 */
function parseVideoSources($, scripts) {
  const videoSources = [];
  
  // 1. 从DOM元素中查找视频源
  const videoSelectors = [
    'video source',
    'video',
    '.video-player iframe',
    '.player iframe', 
    '.player-box iframe',
    '[data-video-url]',
    '[data-src*=".mp4"]',
    '[data-src*=".m3u8"]',
    '[src*=".mp4"]',
    '[src*=".m3u8"]'
  ];
  
  for (const selector of videoSelectors) {
    $(selector).each((i, element) => {
      const $element = $(element);
      const src = $element.attr('src') || $element.attr('data-src') || $element.attr('data-video-url') || '';
      const quality = $element.attr('data-quality') || $element.attr('quality') || '';
      
      if (src && (src.includes('.mp4') || src.includes('.m3u8') || src.includes('.flv'))) {
        videoSources.push({
          url: src,
          quality: quality,
          source: 'dom',
          selector: selector
        });
      }
    });
  }
  
  // 2. 从JavaScript代码中提取视频源
  scripts.each((i, script) => {
    const scriptContent = $(script).html() || '';
    
    // 常见的视频源匹配模式 - 扩展更多模式
    const patterns = [
      // 标准视频链接
      /(https?:\/\/[^"'\s]+\.(?:mp4|m3u8|flv|avi|mkv|ts))(?:\?[^"'\s]*)?/gi,
      // 包含画质信息的视频源
      /["']([^"']*(?:4k|2160p|1080p|720p|480p|360p|240p)[^"']*\.(?:mp4|m3u8|flv|avi|mkv|ts)[^"']*)["']/gi,
      // 播放器配置中的视频源
      /(?:videoUrl|playUrl|src|url|video|play)["']?\s*:\s*["']([^"']+\.(?:mp4|m3u8|flv|avi|mkv|ts)[^"']*)["']/gi,
      // m3u8播放列表
      /["']([^"']*\.m3u8[^"']*)["']/gi,
      // 奈菲影视特有的视频地址模式
      /(?:play_url|video_url|stream_url)["']?\s*:\s*["']([^"']+)["']/gi,
      // iframe嵌入的播放器地址
      /src\s*=\s*["']([^"']*(?:player|play|video)[^"']*)["']/gi,
      // 更宽泛的视频URL匹配
      /(https?:\/\/[^"'\s]*(?:cdn|stream|video|play)[^"'\s]*\.(?:mp4|m3u8|flv)[^"'\s]*)/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(scriptContent)) !== null) {
        const url = match[1] || match[0];
        if (url && url.startsWith('http')) {
          // 过滤掉明显不是视频的URL
          if (url.includes('googleapis.com') || url.includes('analytics') || url.includes('.css') || url.includes('.js')) {
            continue;
          }
          
          // 尝试从URL中推断画质
          let quality = '';
          const qualityMatch = url.match(/(4k|2160p|1080p|720p|480p|360p|240p)/i);
          if (qualityMatch) {
            quality = qualityMatch[1].toLowerCase();
          }
          
          videoSources.push({
            url: url,
            quality: quality,
            source: 'script',
            pattern: pattern.source
          });
          
          console.log(`发现视频源: [${quality || '未知'}] ${url.substring(0, 100)}...`);
        }
      }
    }
    
    // 特殊处理：查找播放器配置对象
    const playerConfigMatch = scriptContent.match(/(?:player|video)Config\s*=\s*(\{[^}]+\})/i);
    if (playerConfigMatch) {
      try {
        const configStr = playerConfigMatch[1];
        // 简单解析配置对象中的视频源
        const urlMatch = configStr.match(/(?:url|src|videoUrl)["']?\s*:\s*["']([^"']+)["']/i);
        if (urlMatch && urlMatch[1]) {
          videoSources.push({
            url: urlMatch[1],
            quality: '',
            source: 'config'
          });
        }
      } catch (e) {
        // 配置解析失败，忽略
      }
    }
  });
  
  return videoSources;
}

/**
 * 选择最佳画质的视频源
 */
function selectBestQuality(videoSources) {
  if (videoSources.length === 0) {
    return null;
  }
  
  // 去重
  const uniqueSources = [];
  const seenUrls = new Set();
  
  for (const source of videoSources) {
    if (!seenUrls.has(source.url)) {
      seenUrls.add(source.url);
      uniqueSources.push(source);
    }
  }
  
  // 按画质排序
  uniqueSources.sort((a, b) => {
    const priorityA = QUALITY_PRIORITY[a.quality.toLowerCase()] || 0;
    const priorityB = QUALITY_PRIORITY[b.quality.toLowerCase()] || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // 降序，高画质优先
    }
    
    // 如果画质相同，优先选择特定格式
    const formatPriorityA = getFormatPriority(a.url);
    const formatPriorityB = getFormatPriority(b.url);
    
    return formatPriorityB - formatPriorityA;
  });
  
  return uniqueSources[0];
}

/**
 * 获取视频格式优先级
 */
function getFormatPriority(url) {
  if (url.includes('.mp4')) return 3;
  if (url.includes('.m3u8')) return 2;
  if (url.includes('.flv')) return 1;
  return 0;
}

/**
 * 加载详情页面获取播放链接
 */
async function loadDetail(link) {
  try {
    console.log("加载详情页面:", link);
    
    const response = await Widget.http.get(link, {
      headers: getAuthenticatedHeaders()
    });
    
    if (!response || !response.data) {
      throw new Error("获取详情页面失败");
    }
    
    const $ = Widget.html.load(response.data);
    if (!$) {
      throw new Error("解析详情页面失败");
    }
    
    // 检查是否为多集内容（电视剧、美剧等）
    // 扩展更多可能的分集选择器
    const episodeSelectors = [
      '.episode-list a', '.play-list a', '.playlist a',
      '[class*="episode"] a', '[class*="play"] a', '[class*="集"] a',
      '.video-list a', '.series-list a', '.chapter-list a',
      'ul li a[href*="play"]', 'ul li a[href*="episode"]', 'ul li a[href*="ep"]',
      '.tabs-content a', '.tab-content a', '.content-tab a',
      'a[title*="第"]', 'a[title*="集"]', 'a[title*="EP"]'
    ];
    
    let episodeElements = $();
    let foundEpisodes = 0;
    
    for (const selector of episodeSelectors) {
      const elements = $(selector);
      console.log(`测试分集选择器 "${selector}": 找到 ${elements.length} 个元素`);
      
      if (elements.length > 1) {
        episodeElements = elements;
        foundEpisodes = elements.length;
        console.log(`✅ 使用选择器 "${selector}" 找到 ${foundEpisodes} 个分集`);
        break;
      }
    }
    
    console.log(`总共找到 ${foundEpisodes} 个分集链接`);
    
    if (foundEpisodes > 1) {
      // 多集内容 - 解析每一集
      console.log(`检测到多集内容，开始解析 ${foundEpisodes} 集`);
      return await parseEpisodesDetail($, link, episodeElements);
    } else {
      // 单集内容（电影）或未找到分集 - 解析视频源
      console.log("检测到单集内容或未找到分集，按单集处理");
      return await parseSingleVideoDetail($, link);
    }
    
  } catch (error) {
    console.error("加载详情失败:", error);
    throw error;
  }
}

/**
 * 提取描述信息
 */
function extractDescription($) {
  const descSelectors = [
    '.description', '.synopsis', '.summary', '.plot', '.intro',
    '.movie-desc', '.content-desc', '.detail-desc',
    'meta[name="description"]', 'meta[property="og:description"]',
    '.entry-content p', '.post-content p', 'p'
  ];
  
  for (const selector of descSelectors) {
    const desc = $(selector).first().text().trim();
    if (desc && desc.length > 20 && !desc.includes('客服') && !desc.includes('下载')) {
      return desc;
    }
  }
  return '';
}

/**
 * 提取海报信息
 */
function extractPoster($, baseUrl) {
  const posterSelectors = [
    '.poster img', '.movie-poster img', '.thumb img',
    'img[alt*="海报"]', 'img[alt*="封面"]', 'meta[property="og:image"]'
  ];
  
  for (const selector of posterSelectors) {
    const element = $(selector).first();
    const poster = element.attr('data-src') || element.attr('src') || element.attr('content');
    if (poster && !poster.includes('blank.gif')) {
      return poster.startsWith('http') ? poster : 
             poster.startsWith('//') ? 'https:' + poster : baseUrl + poster;
    }
  }
  return '';
}

/**
 * 提取评分信息
 */
function extractRating($) {
  const ratingSelectors = ['.rating', '.score', '.imdb', '.douban', '[class*="rate"]'];
  for (const selector of ratingSelectors) {
    const ratingText = $(selector).first().text().trim();
    const rating = parseFloat(ratingText);
    if (!isNaN(rating) && rating > 0 && rating <= 10) {
      return rating;
    }
  }
  return 0;
}

/**
 * 提取年份信息
 */
function extractYear($) {
  const yearSelectors = ['.year', '.date', '.release-date', '[class*="year"]'];
  for (const selector of yearSelectors) {
    const yearText = $(selector).first().text().trim();
    const yearMatch = yearText.match(/(\d{4})/);
    if (yearMatch) {
      return yearMatch[1];
    }
  }
  return '';
}

/**
 * 提取类型信息
 */
function extractGenre($) {
  const genreSelectors = ['.genre', '.category', '.type', '.tag', '[class*="genre"]'];
  for (const selector of genreSelectors) {
    const genre = $(selector).first().text().trim();
    if (genre && genre.length > 0 && genre.length < 20) {
      return genre;
    }
  }
  return '';
}

/**
 * 解析多集内容（电视剧）
 */
async function parseEpisodesDetail($, mainLink, episodeElements) {
  console.log("解析多集内容...");
  
  // 获取剧集的整体信息
  const seriesTitle = $('h1, .title, .movie-title, .series-title').first().text().trim();
  const seriesDescription = extractDescription($);
  const seriesPoster = extractPoster($, BASE_URL);
  const seriesRating = extractRating($);
  const seriesYear = extractYear($);
  const seriesGenre = extractGenre($);
  
  console.log(`剧集信息: ${seriesTitle}`);
  console.log(`剧集描述: ${seriesDescription.substring(0, 100)}...`);
  
  const episodes = [];
  const maxEpisodes = Math.min(episodeElements.length, 50); // 限制最多50集，避免请求过多
  
  for (let i = 0; i < maxEpisodes; i++) {
    const episodeElement = $(episodeElements[i]);
    const episodeTitle = episodeElement.text().trim() || `第${i + 1}集`;
    let episodeLink = episodeElement.attr('href');
    
    if (episodeLink && !episodeLink.startsWith('http')) {
      episodeLink = episodeLink.startsWith('/') ? BASE_URL + episodeLink : BASE_URL + '/' + episodeLink;
    }
    
    console.log(`解析第${i + 1}集: ${episodeTitle} -> ${episodeLink}`);
    
    if (episodeLink) {
      try {
        // 获取该集的播放页面
        const episodeResponse = await Widget.http.get(episodeLink, {
          headers: getAuthenticatedHeaders()
        });
        
        if (episodeResponse && episodeResponse.data) {
          const episode$ = Widget.html.load(episodeResponse.data);
          const scripts = episode$('script');
          const videoSources = parseVideoSources(episode$, scripts);
          const bestSource = selectBestQuality(videoSources);
          
          if (bestSource) {
            // 获取该集的具体描述
            const episodeDescription = extractDescription(episode$) || `${seriesTitle} ${episodeTitle}`;
            
            episodes.push({
              id: `episode_${i + 1}`,
              type: "link",
              title: episodeTitle,
              description: episodeDescription,
              posterPath: seriesPoster,
              backdropPath: seriesPoster,
              releaseDate: seriesYear,
              rating: seriesRating,
              genreTitle: seriesGenre,
              link: episodeLink,
              videoUrl: bestSource.url,
              quality: bestSource.quality || 'auto',
              mediaType: "tv",
              playerType: "system",
              episode: i + 1 // 集数信息
            });
            console.log(`✅ 第${i + 1}集解析成功: ${bestSource.url.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        console.error(`解析第${i + 1}集失败:`, error.message);
      }
      
      // 添加小延迟，避免请求过快
      if (i < maxEpisodes - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  console.log(`成功解析 ${episodes.length} 集内容`);
  
  // 按照ForwardWidgets标准格式返回
  return {
    // 主要信息 - 作为剧集整体信息
    id: mainLink.replace(/[^a-zA-Z0-9]/g, '_'),
    type: "link",
    title: seriesTitle,
    description: seriesDescription,
    posterPath: seriesPoster,
    backdropPath: seriesPoster,
    releaseDate: seriesYear,
    rating: seriesRating,
    genreTitle: seriesGenre,
    mediaType: "tv",
    playerType: "system",
    
    // 第一集作为主播放地址
    link: mainLink,
    videoUrl: episodes.length > 0 ? episodes[0].videoUrl : '',
    quality: episodes.length > 0 ? episodes[0].quality : 'auto',
    
    // ⭐ 关键：每集信息存放在 childItems 中（ForwardWidgets标准）
    childItems: episodes,
    
    // 额外的剧集统计信息
    totalEpisodes: episodes.length,
    currentEpisode: 1
  };
}

/**
 * 解析单集内容（电影）
 */
async function parseSingleVideoDetail($, link) {
  console.log("解析单集内容...");
  
  // 查找所有脚本标签
  const scripts = $('script');
  console.log(`找到 ${scripts.length} 个脚本标签`);
  
  // 解析所有可能的视频源
  const videoSources = parseVideoSources($, scripts);
  console.log(`解析到 ${videoSources.length} 个视频源`);
  
  // 选择最佳画质
  const bestSource = selectBestQuality(videoSources);
  
  if (bestSource) {
    console.log(`选择最佳画质: [${bestSource.quality || '默认'}] ${bestSource.url}`);
    return {
      videoUrl: bestSource.url,
      quality: bestSource.quality || 'auto',
      playerType: "system",
      allSources: videoSources.map(s => ({
        url: s.url,
        quality: s.quality || 'auto'
      }))
    };
  } else {
    console.log("未找到可用的视频源");
    return {
      videoUrl: '',
      quality: '',
      playerType: "app",
      allSources: []
    };
  }
}
