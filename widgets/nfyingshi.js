WidgetMetadata = {
  id: "forward.nfyingshi",
  title: "奈菲影视",
  version: "1.3.5",
  requiredVersion: "0.0.1",
  description: "奈菲影视(https://www.nfyingshi.com) 美剧/韩剧/电影资源",
  author: "mw99",
  site: "https://www.nfyingshi.com",
  icon: "https://www.nfyingshi.com/wp-content/uploads/2024/08/3dc9330bc1c342.png",
  detailCacheDuration: 300,
  globalParams: [
    { name: "server", title: "站点", type: "input", value: "https://www.nfyingshi.com" },
    { name: "username", title: "用户名", type: "input" },
    { name: "password", title: "密码", type: "input" },
  ],
  modules: [
    {
      id: "loadResource",
      title: "资源",
      functionName: "loadResource",
      type: "stream",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "loadHot",
      title: "热映推荐",
      functionName: "loadHot",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }],
    },
    {
      id: "loadRecent",
      title: "近期更新",
      functionName: "loadRecent",
      cacheDuration: 600,
      params: [{ name: "page", title: "页码", type: "page" }],
    },
    {
      id: "loadCategory",
      title: "分类浏览",
      functionName: "loadCategory",
      cacheDuration: 600,
      params: [
        { name: "category", title: "分类", type: "enumeration", enumOptions: [
          { title: "美剧", value: "meiju" },
          { title: "英剧", value: "yingju" },
          { title: "韩剧", value: "hanju" },
          { title: "真人秀", value: "zhenrenxiu" },
          { title: "纪录片", value: "jilupian" },
          { title: "热门电影", value: "remendianying" },
          { title: "动作", value: "dongzuo" },
          { title: "奇幻", value: "qihuan" },
          { title: "冒险", value: "maoxian" },
          { title: "悬疑", value: "xuanyi" },
          { title: "惊悚", value: "jingsong" },
          { title: "剧情", value: "juqing" },
          { title: "犯罪", value: "fanzui" },
          { title: "动画", value: "donghua" },
        ]},
        { name: "page", title: "页码", type: "page" },
      ],
    },
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input" },
      { name: "page", title: "页码", type: "page" },
    ],
  },
  sourceLoader: {
    title: "解析播放源",
    functionName: "loadSource",
    params: [],
  },
};

// ── Pure JS AES-128-CBC Decrypt (standard implementation) ────────────────

var AES_KEY = "cc69646c7d1233a3";
var AES_IV = "1234567890983456";

// Standard AES S-box
var SBOX = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];

var INV_SBOX = [0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d];

var RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function gfMul(a, b) {
  var r = 0;
  for (var i = 0; i < 8; i++) {
    if (b & 1) r ^= a;
    var hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return r;
}

function keyExpansion(key) {
  var Nk = 4, Nr = 10;
  var w = new Array(4 * (Nr + 1));
  for (var i = 0; i < Nk; i++) {
    w[i] = (key[4*i] << 24) | (key[4*i+1] << 16) | (key[4*i+2] << 8) | key[4*i+3];
  }
  for (var i = Nk; i < 4 * (Nr + 1); i++) {
    var temp = w[i - 1];
    if (i % Nk === 0) {
      temp = ((SBOX[(temp >>> 16) & 0xff] << 24) | (SBOX[(temp >>> 8) & 0xff] << 16) | (SBOX[temp & 0xff] << 8) | SBOX[(temp >>> 24) & 0xff]) ^ (RCON[Math.floor(i / Nk) - 1] << 24);
    }
    w[i] = w[i - Nk] ^ temp;
  }
  var rk = [];
  for (var i = 0; i < w.length; i++) {
    rk.push((w[i] >>> 24) & 0xff, (w[i] >>> 16) & 0xff, (w[i] >>> 8) & 0xff, w[i] & 0xff);
  }
  return rk;
}

function addRoundKey(state, rk, round) {
  for (var i = 0; i < 16; i++) state[i] ^= rk[round * 16 + i];
}

function invSubBytes(state) {
  for (var i = 0; i < 16; i++) state[i] = INV_SBOX[state[i]];
}

function invShiftRows(state) {
  var t = state[13]; state[13] = state[9]; state[9] = state[5]; state[5] = state[1]; state[1] = t;
  t = state[2]; state[2] = state[10]; state[10] = t;
  t = state[6]; state[6] = state[14]; state[14] = t;
  t = state[3]; state[3] = state[7]; state[7] = state[11]; state[11] = state[15]; state[15] = t;
}

function invMixColumns(state) {
  for (var c = 0; c < 4; c++) {
    var i = c * 4;
    var s0 = state[i], s1 = state[i+1], s2 = state[i+2], s3 = state[i+3];
    state[i]   = gfMul(s0, 0x0e) ^ gfMul(s1, 0x0b) ^ gfMul(s2, 0x0d) ^ gfMul(s3, 0x09);
    state[i+1] = gfMul(s0, 0x09) ^ gfMul(s1, 0x0e) ^ gfMul(s2, 0x0b) ^ gfMul(s3, 0x0d);
    state[i+2] = gfMul(s0, 0x0d) ^ gfMul(s1, 0x09) ^ gfMul(s2, 0x0e) ^ gfMul(s3, 0x0b);
    state[i+3] = gfMul(s0, 0x0b) ^ gfMul(s1, 0x0d) ^ gfMul(s2, 0x09) ^ gfMul(s3, 0x0e);
  }
}

function aesDecryptBlock(block, rk) {
  var state = block.slice();
  addRoundKey(state, rk, 10);
  for (var r = 9; r >= 1; r--) {
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, rk, r);
    invMixColumns(state);
  }
  invShiftRows(state);
  invSubBytes(state);
  addRoundKey(state, rk, 0);
  return state;
}

function aesDecrypt(ciphertext) {
  var keyBytes = [], ivBytes = [];
  for (var i = 0; i < 16; i++) { keyBytes[i] = AES_KEY.charCodeAt(i) & 0xff; ivBytes[i] = AES_IV.charCodeAt(i) & 0xff; }
  var rk = keyExpansion(keyBytes);
  var result = [];
  var prev = ivBytes;
  for (var b = 0; b < ciphertext.length; b += 16) {
    var block = ciphertext.slice(b, b + 16);
    var dec = aesDecryptBlock(block, rk);
    for (var j = 0; j < 16; j++) result.push(dec[j] ^ prev[j]);
    prev = block;
  }
  var pad = result[result.length - 1];
  if (pad > 0 && pad <= 16) return result.slice(0, result.length - pad);
  return result;
}

function aesDecryptB64(base64str) {
  var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var bytes = [];
  base64str = String(base64str).replace(/[^A-Za-z0-9\+\/=]/g, '');
  var i = 0;
  while (i < base64str.length) {
    var a = b64chars.indexOf(base64str.charAt(i++));
    var b = b64chars.indexOf(base64str.charAt(i++));
    var c = i < base64str.length ? b64chars.indexOf(base64str.charAt(i)) : -1;
    if (c === -1) c = 64;
    i++;
    var d = i < base64str.length ? b64chars.indexOf(base64str.charAt(i)) : -1;
    if (d === -1) d = 64;
    i++;
    bytes.push((a << 2) | (b >> 4));
    if (c !== 64 && c >= 0) bytes.push(((b & 15) << 4) | (c >> 2));
    if (d !== 64 && d >= 0) bytes.push(((c & 3) << 6) | d);
  }
  return aesDecrypt(bytes);
}

// ── Extract video URLs// ── Extract video URLs from play page ────────────────────────────────────

function extractVideoInfo(html) {
  var m = html.match(/var\s+([\w$]+)\s*=\s*"([A-Za-z0-9+\/=]{500,})"/);
  if (!m) return null;
  var encrypted = m[2];
  var decrypted = aesDecryptB64(encrypted);
  var decStr = '';
  for (var i = 0; i < decrypted.length; i++) decStr += String.fromCharCode(decrypted[i]);

  var qualityMatch = decStr.match(/quality:\s*\[([^\]]+)\]/);
  if (!qualityMatch) return null;

  var urls = [];
  var urlRe = /url:\s*'([^']+)'/g;
  var um;
  while ((um = urlRe.exec(qualityMatch[1])) !== null) urls.push(um[1]);

  var names = [];
  var nameRe = /name:\s*'([^']+)'/g;
  var nm;
  while ((nm = nameRe.exec(qualityMatch[1])) !== null) names.push(nm[1]);

  var defaultIdx = 0;
  var defaultMatch = decStr.match(/defaultQuality:\s*(\d+)/);
  if (defaultMatch) defaultIdx = parseInt(defaultMatch[1]) || 0;

  return { urls: urls, names: names, defaultIdx: defaultIdx };
}

// ── Base64 encode (for play page URLs) ────────────────────────────────────

function base64Encode(str) {
  var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var result = '';
  var bytes = [];
  for (var i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 0xff);
  var i = 0;
  while (i < bytes.length) {
    var a = bytes[i++];
    var b = i < bytes.length ? bytes[i++] : NaN;
    var c = i < bytes.length ? bytes[i++] : NaN;
    result += b64chars.charAt(a >> 2);
    result += b64chars.charAt(((a & 3) << 4) | ((b >> 4) || 0));
    result += isNaN(b) ? '=' : b64chars.charAt(((b & 15) << 2) | ((c >> 6) || 0));
    result += isNaN(c) ? '=' : b64chars.charAt(c & 63);
  }
  return result;
}

function playPagePath(postId, episode) {
  return base64Encode('mv_' + postId + '-nm_' + episode);
}

// ── Login & Auth helpers ────────────────────────────────────

var LOGIN_CACHE_KEY = '__nfy_login';

function getSiteUrl(params) {
  return (params.server || 'https://www.nfyingshi.com').replace(/\/$/, '');
}

// WordPress login: POST credentials, extract session cookies
async function loginToWP(siteUrl, username, password) {
  try {
    var body = 'log=' + encodeURIComponent(username) +
               '&pwd=' + encodeURIComponent(password) +
               '&wp-submit=' + encodeURIComponent('登录') +
               '&redirect_to=' + encodeURIComponent('/') +
               '&testcookie=1';

    var res = await Widget.http.post(siteUrl + '/wp-login.php', body, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      allow_redirects: false,
    });

    if (res.status === 302 || res.status === 301) {
      var cookies = [];
      var setCookieHeaders = res.headers['set-cookie'] || res.headers['Set-Cookie'] || [];
      if (typeof setCookieHeaders === 'string') setCookieHeaders = [setCookieHeaders];
      for (var i = 0; i < setCookieHeaders.length; i++) {
        var cookiePart = setCookieHeaders[i].split(';')[0];
        if (cookiePart.indexOf('wordpress') !== -1) {
          cookies.push(cookiePart);
        }
      }
      if (cookies.length > 0) {
        return cookies.join('; ');
      }
    }

    console.error('[nfyingshi:login] 登录失败，请检查用户名和密码');
    return null;
  } catch (e) {
    console.error('[nfyingshi:login] 登录异常:', e.message || e);
    return null;
  }
}

// Called by list/search handlers: checks credentials, logs in, caches
async function performAuth(params) {
  if (!params || !params.username || !params.password) return;

  // Check cache first
  var cached = Widget.storage.get(LOGIN_CACHE_KEY);
  if (cached) {
    try {
      var obj = typeof cached === 'string' ? JSON.parse(cached) : cached;
      var age = Date.now() - (obj.time || 0);
      if (age < 3600000 && obj.cookie) return; // 1h cache
    } catch (e) { /* ignore bad cache */ }
  }

  var siteUrl = getSiteUrl(params);
  var cookie = await loginToWP(siteUrl, params.username, params.password);
  if (cookie) {
    Widget.storage.set(LOGIN_CACHE_KEY, JSON.stringify({ cookie: cookie, time: Date.now() }));
  }
}

// ── HTTP helpers ────────────────────────────────────

function buildHeaders() {
  var headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  };

  // Check cached login cookie
  var cached = Widget.storage.get(LOGIN_CACHE_KEY);
  if (cached) {
    try {
      var obj = typeof cached === 'string' ? JSON.parse(cached) : cached;
      if (obj.cookie) {
        headers['Cookie'] = obj.cookie;
      }
    } catch (e) { /* ignore */ }
  }

  return headers;
}

// ── Scrape movie cards from list pages ────────────────────────────────────

function parseMovieCards($, siteUrl) {
  var items = [];
  $('.bt_img li').each(function () {
    var $li = $(this);
    var $img = $li.find('img.thumb');
    var poster = $img.attr('data-original') || $img.attr('src') || '';
    if (poster && !poster.includes('blank.gif') && poster.startsWith('/')) poster = siteUrl + poster;
    var $a = $li.find('h3.dytit a');
    if (!$a.length) $a = $li.find('a[href]').first();
    var title = $a.text().trim();
    var href = $a.attr('href') || '';
    var idMatch = href.match(/\/movie\/(\d+)\.html/);
    var postId = idMatch ? idMatch[1] : '';
    var ratingEl = $li.find('.rating');
    var rating = ratingEl.length ? parseFloat(ratingEl.text().trim()) || undefined : undefined;
    var cast = '';
    var castEl = $li.find('.inzhuy');
    if (castEl.length) cast = castEl.text().trim().replace(/^主演：/, '');
    if (title && postId) {
      items.push({
        id: 'nf:' + postId,
        type: 'url',
        title: title,
        posterPath: poster,
        link: 'nf:' + postId,
        rating: rating,
        description: cast ? '主演：' + cast : '',
        postId: postId,
      });
    }
  });
  return items;
}

// ── Handler: Resource (stream type) ────────────────────────────────────

// Chinese number to digit for season matching
var CN_NUM = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10 };
var NUM_CN = { 1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'七',8:'八',9:'九',10:'十' };

function toCNSeason(n) {
  if (n <= 10) return NUM_CN[n] || String(n);
  var s = '';
  if (n >= 20) s += NUM_CN[Math.floor(n/10)] + '十';
  else if (n >= 10) s += '十';
  var r = n % 10;
  if (r > 0) s += NUM_CN[r];
  return s;
}

function extractSeasonInfo(seriesName) {
  if (!seriesName) return { baseName: seriesName, seasonNumber: 1 };
  // "第X季"/"第X部"
  var m = seriesName.match(/第\s*([一二三四五六七八九十\d]+)\s*[季部]/);
  if (m) {
    var num = CN_NUM[m[1]] || parseInt(m[1]) || 1;
    return { baseName: seriesName.replace(/第\s*[一二三四五六七八九十\d]+\s*[季部]/, '').trim(), seasonNumber: num };
  }
  // "黑袍纠察队4", "黑袍纠察队 4" — trailing digits
  m = seriesName.match(/^(.+?)\s*(\d{1,2})\s*$/);
  if (m) {
    return { baseName: m[1].trim(), seasonNumber: parseInt(m[2]) || 1 };
  }
  return { baseName: seriesName.trim(), seasonNumber: 1 };
}

async function loadResource(params) {
  try {
    var seriesName = params.seriesName;
    var season = params.season;
    var episode = params.episode;
    if (!seriesName) return [];

    var siteUrl = getSiteUrl(params);
    var isMovie = params.type === 'movie';
    var _b = extractSeasonInfo(seriesName);
    var baseName = _b.baseName;
    var targetSeason = isMovie ? null : (season ? parseInt(season) : _b.seasonNumber);

    // Search with base name only (don't confuse search engine with season suffix)
    var searchQuery = baseName;
    var url = siteUrl + '/?s=' + encodeURIComponent(searchQuery);
    var res = await Widget.http.get(url, { headers: buildHeaders() });
    var $ = Widget.html.load(res.data);
    var cards = parseSearchCards($, siteUrl);

    // Fallback: homepage parsing (site search often returns None Related)
    if (!cards.length) {
      res = await Widget.http.get(siteUrl, { headers: buildHeaders() });
      $ = Widget.html.load(res.data);
      cards = parseMovieCards($, siteUrl);
      if (cards.length) {
        var filtered = [];
        for (var ci = 0; ci < cards.length; ci++) {
          if (cards[ci].title.indexOf(baseName) !== -1) filtered.push(cards[ci]);
        }
        cards = filtered;
      }
    }
    if (!cards.length) return [];

    // Match best card by season
    var best = cards[0];
    if (targetSeason && cards.length > 1) {
      // Prefer exact season match
      for (var ci = 0; ci < cards.length; ci++) {
        var si = extractSeasonInfo(cards[ci].title);
        if (si.season === targetSeason) { best = cards[ci]; break; }
      }
    }
    var detail = await loadDetail(best.link);
    if (!detail || !detail.episodeItems || !detail.episodeItems.length) return [];

    var resources = [];
    for (var i = 0; i < detail.episodeItems.length; i++) {
      var ep = detail.episodeItems[i];
      // Extract episode number for _ep tagging (like VodStream)
      var epMatch = ep.title.match(/第\s*([一二三四五六七八九十\d]+)\s*集?/);
      if (!epMatch) epMatch = ep.title.match(/(\d+)/);
      var epNum = epMatch ? (CN_NUM[epMatch[1]] || parseInt(epMatch[1]) || null) : null;
      // TV: filter by episode if specified (like VodStream)
      if (!isMovie && episode && epNum && epNum !== parseInt(episode)) continue;
      if (ep.childItems && ep.childItems.length > 0) {
        for (var q = 0; q < ep.childItems.length; q++) {
          var child = ep.childItems[q];
          resources.push({
            name: 'nfyingshi',
            description: detail.title + ' - ' + ep.title + ' - ' + child.title,
            url: child.videoUrl || '',
            _ep: isMovie ? null : epNum,  // VodStream-style _ep marker
          });
        }
      } else {
        resources.push({
          name: 'nfyingshi',
          description: detail.title + ' - ' + ep.title,
          url: ep.videoUrl || '',
          _ep: isMovie ? null : epNum,
        });
      }
    }
    return resources;
  } catch (e) {
    console.error('[nfyingshi:loadResource]', e.message || e);
    return [];
  }
}
// ── Handler: Hot Movies ────────────────────────────────────

async function loadHot(params) {
  try {
    await performAuth(params);
    var siteUrl = getSiteUrl(params);
    var res = await Widget.http.get(siteUrl + '/', { headers: buildHeaders(params) });
    var $ = Widget.html.load(res.data);
    var items = parseMovieCards($, siteUrl);
    return items.slice(0, 12);
  } catch (e) {
    console.error('[nfyingshi:loadHot]', e.message || e);
    throw e;
  }
}

// ── Handler: Recent Updates ────────────────────────────────────

async function loadRecent(params) {
  try {
    await performAuth(params);
    var siteUrl = getSiteUrl(params);
    var res = await Widget.http.get(siteUrl + '/', { headers: buildHeaders(params) });
    var $ = Widget.html.load(res.data);
    var sections = $('.mi_btcon');
    if (sections.length < 2) return loadHot(params);
    var $section = $(sections[1]);
    var items = [];
    $section.find('.bt_img li').each(function () {
      var $li = $(this);
      var $img = $li.find('img.thumb');
      var poster = $img.attr('data-original') || $img.attr('src') || '';
      if (poster && !poster.includes('blank.gif') && poster.startsWith('/')) poster = siteUrl + poster;
      var $a = $li.find('h3.dytit a');
      if (!$a.length) $a = $li.find('a[href]').first();
      var title = $a.text().trim();
      var href = $a.attr('href') || '';
      var idMatch = href.match(/\/movie\/(\d+)\.html/);
      var postId = idMatch ? idMatch[1] : '';
      var ratingEl = $li.find('.rating');
      var rating = ratingEl.length ? parseFloat(ratingEl.text().trim()) || undefined : undefined;
      var cast = '';
      var castEl = $li.find('.inzhuy');
      if (castEl.length) cast = castEl.text().trim().replace(/^主演：/, '');
      if (title && postId) {
        items.push({
          id: 'nf:' + postId,
          type: 'url',
          title: title,
          posterPath: poster,
          link: 'nf:' + postId,
          rating: rating,
          description: cast ? '主演：' + cast : '',
          postId: postId,
        });
      }
    });
    return items;
  } catch (e) {
    console.error('[nfyingshi:loadRecent]', e.message || e);
    throw e;
  }
}

// ── Handler: Category ────────────────────────────────────

var CATEGORY_URLS = {
  'meiju': '/%e7%be%8e%e5%89%a7',
  'yingju': '/movie_bt_series/%e8%8b%b1%e5%89%a7',
  'hanju': '/movie_bt_series/hanju',
  'zhenrenxiu': '/movie_bt_series/%e7%9c%9f%e4%ba%ba%e7%a7%80',
  'jilupian': '/movie_bt_series/jilupian',
  'remendianying': '/%e5%9c%a8%e7%ba%bf%e8%a7%82%e7%9c%8b',
  'dongzuo': '/movie_bt_tags/dongzuo',
  'qihuan': '/movie_bt_tags/qihuan',
  'maoxian': '/movie_bt_tags/maoxian',
  'xuanyi': '/movie_bt_tags/xuanyi',
  'jingsong': '/movie_bt_tags/jingsong',
  'juqing': '/movie_bt_tags/juqing',
  'fanzui': '/movie_bt_tags/fanzui',
  'donghua': '/movie_bt_tags/donghua',
};

async function loadCategory(params) {
  try {
    await performAuth(params);
    var siteUrl = getSiteUrl(params);
    var path = CATEGORY_URLS[params.category] || CATEGORY_URLS['meiju'];
    var page = params.page || 1;
    var url = siteUrl + path;
    if (page > 1) url += '/page/' + page;
    var res = await Widget.http.get(url, { headers: buildHeaders(params) });
    var $ = Widget.html.load(res.data);
    var items = parseMovieCards($, siteUrl);
    return items;
  } catch (e) {
    console.error('[nfyingshi:loadCategory]', e.message || e);
    throw e;
  }
}


// Parse search result cards (article-based, fallback to bt_img li)
function parseSearchCards($, siteUrl) {
  var items = [];
  $("article.searart").each(function () {
    var $art = $(this);
    if ($art.find("h1").length) return;
    var $img = $art.find("img.thumb, img.lazy");
    var poster = $img.attr("data-original") || $img.attr("src") || "";
    if (poster && !poster.includes("blank.gif") && poster.startsWith("/")) poster = siteUrl + poster;
    var $a = $art.find(".entry-title a, h3 a, a[href*=\"/movie/\"]").first();
    var title = $a.text().trim();
    var href = $a.attr("href") || "";
    var idMatch = href.match(/\/movie\/(\d+)\.html/);
    var postId = idMatch ? idMatch[1] : "";
    var $rating = $art.find(".rating, .star");
    var rating = $rating.length ? parseFloat($rating.first().text().trim()) || undefined : undefined;
    if (title && postId) {
      items.push({
        id: "nf:" + postId, type: "url", title: title,
        posterPath: poster, link: "nf:" + postId,
        rating: rating, postId: postId,
      });
    }
  });
  if (!items.length) return parseMovieCards($, siteUrl);
  return items;
}

// ── Handler: Search ────────────────────────────────────

async function search(params) {
  try {
    await performAuth(params);
    var siteUrl = getSiteUrl(params);
    var keyword = params.keyword || '';
    var page = params.page || 1;
    var url = siteUrl + '/?s=' + encodeURIComponent(keyword);
    if (page > 1) url += '&paged=' + page;
    var res = await Widget.http.get(url, { headers: buildHeaders(params) });
    var $ = Widget.html.load(res.data);
    var items = parseSearchCards($, siteUrl);
    return items;
  } catch (e) {
    console.error('[nfyingshi:search]', e.message || e);
    throw e;
  }
}

// ── Handler: Detail ────────────────────────────────────

async function loadDetail(link) {
  try {
    var parts = String(link).split(':');
    var postId = parts[1];
    if (!postId) return null;

    var siteUrl = 'https://www.nfyingshi.com';
    var res = await Widget.http.get(siteUrl + '/movie/' + postId + '.html', {
      headers: buildHeaders(),
    });
    var $ = Widget.html.load(res.data);

    // Title
    var titleEl = $('.dy_tit_big');
    var title = '';
    if (titleEl.length) {
      var clone = titleEl.clone();
      clone.find('var, span').remove();
      title = clone.text().trim();
    }

    // Rating
    var ratingEl = $('.rating');
    var rating = ratingEl.length ? parseFloat(ratingEl.first().text().trim()) || undefined : undefined;

    // Backdrop images
    var backdropPaths = [];
    $('.dyimg img').each(function () {
      var src = $(this).attr('src');
      if (src && !src.includes('blank.gif')) {
        if (src.startsWith('/')) src = siteUrl + src;
        backdropPaths.push(src);
      }
    });

    // Poster
    var poster = backdropPaths[0] || '';
    if (!poster) {
      var ogImg = $('meta[property="og:image"]');
      if (ogImg.length) poster = ogImg.attr('content');
      if (poster && !backdropPaths.length) backdropPaths.push(poster);
    }

    // Description
    var descEl = $('.dycon');
    var description = descEl.length ? descEl.text().trim() : '';

    // Episode items from play links (cheerio + regex fallback for JS-rendered)
    var episodeItems = [];
    var trailerUrl = null;
    var trailerCover = poster;

    function extractEpisodes(html) {
      var eps = [];
      // Fallback: regex extract from raw HTML (handles JS-rendered links)
      var re = /<a[^>]*href="(https?:\/\/[^"]*v_play\/([^."]+)\.html)"[^>]*>([^<]*)<\/a>/g;
      var m;
      while ((m = re.exec(html)) !== null) {
        eps.push({ href: m[1], vid: m[2], title: m[3].trim() });
      }
      return eps;
    }

    $('a[href*="v_play"]').each(function () {
      var epHref = $(this).attr('href') || '';
      var epTitle = $(this).text().trim();
      var epMatch = epHref.match(/v_play\/([^.]+)\.html/);
      if (epMatch) {
        var epVid = epMatch[1];
        var epId = 'nfep:' + postId + ':' + epVid;
        episodeItems.push({
          id: epId, type: 'url', title: epTitle, link: epId,
          videoUrl: siteUrl + '/v_play/' + epVid + '.html',
        });
        if (!trailerUrl) { trailerUrl = siteUrl + '/v_play/' + epVid + '.html'; trailerCover = poster; }
      }
    });

    // Regex fallback when cheerio finds nothing
    if (!episodeItems.length) {
      var rawEps = extractEpisodes(res.data);
      for (var ri = 0; ri < rawEps.length; ri++) {
        var re = rawEps[ri];
        var rId = 'nfep:' + postId + ':' + re.vid;
        episodeItems.push({
          id: rId, type: 'url', title: re.title, link: rId,
          videoUrl: siteUrl + '/v_play/' + re.vid + '.html',
        });
        if (!trailerUrl) { trailerUrl = siteUrl + '/v_play/' + re.vid + '.html'; trailerCover = poster; }
      }
    }

    // Genres
    var genreItems = [];
    $('a[href*="movie_bt_tags"]').each(function () {
      var gTitle = $(this).text().trim();
      var gId = 'nftag:' + encodeURIComponent(gTitle);
      if (!genreItems.some(function (g) { return g.id === gId; })) {
        genreItems.push({ id: gId, title: gTitle });
      }
    });

    // Cast / peoples
    var peoples = [];
    var castEl = $('.inzhuy');
    if (castEl.length) {
      var castText = castEl.text().trim().replace(/^主演：/, '');
      var castArr = castText.split(/[,，、]/);
      castArr.forEach(function (name) {
        name = name.trim();
        if (name)
          peoples.push({ id: 'nfactor:' + encodeURIComponent(name), title: name, role: '' });
      });
    }

    // Release year
    var releaseDate = '';
    var yearEl = $('.dy_tit_big span');
    if (yearEl.length) {
      var yearMatch = yearEl.text().match(/(\d{4})/);
      if (yearMatch) releaseDate = yearMatch[1] + '-01-01';
    }

    // Pre-resolve video URLs in parallel, then expand to per-quality flat items (like VodStream)
    var epTasks = [];
    for (var ei = 0; ei < episodeItems.length; ei++) {
      epTasks.push((function(ep) {
        return Widget.http.get(ep.videoUrl, { headers: buildHeaders() }).then(function(playRes) {
          var info = extractVideoInfo(playRes.data);
          if (info && info.urls.length > 0) {
            ep._qualities = [];
            for (var q = 0; q < info.urls.length; q++) {
              ep._qualities.push({
                url: info.urls[q],
                name: info.names[q] || ('画质' + (q + 1)),
              });
            }
            ep.videoUrl = info.urls[info.defaultIdx] || info.urls[0];
          }
        }).catch(function() { /* keep play-page URL */ });
      })(episodeItems[ei]));
    }
    await Promise.all(epTasks);

    // Expand episodes into flat per-quality items
    var flatEps = [];
    for (var ei = 0; ei < episodeItems.length; ei++) {
      var ep = episodeItems[ei];
      if (ep._qualities && ep._qualities.length > 0) {
        for (var q = 0; q < ep._qualities.length; q++) {
          var qInfo = ep._qualities[q];
          flatEps.push({
            id: ep.id + ':q' + q,
            type: 'url',
            title: ep.title + ' - ' + qInfo.name,
            posterPath: poster,
            videoUrl: qInfo.url,
            link: ep.id + ':q' + q,
          });
        }
      } else {
        flatEps.push(ep);
      }
    }
    episodeItems = flatEps;

    return {
      id: 'nf:' + postId,
      type: 'url',
      title: title,
      posterPath: poster,
      backdropPaths: backdropPaths,
      description: description,
      rating: rating,
      episodeItems: episodeItems,
      genreItems: genreItems,
      peoples: peoples,
      releaseDate: releaseDate,
      link: 'nf:' + postId,
      trailers: trailerUrl ? [{ coverUrl: trailerCover, url: trailerUrl }] : [],
};
  } catch (e) {
    console.error('[nfyingshi:loadDetail]', e.message || e);
    return null;
  }
}
