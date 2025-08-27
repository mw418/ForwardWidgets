<p align="center">
  <br>
  <img width="150" src="./icon.png">
  <br>
  <br>
</p>

<div align=center>
    
[**简体中文 🇨🇳**](README.md) / [**English 🇺🇸**](README_EN.md)

</div>

# ForwardWidget

ForwardWidget is a JS component for building modules that provides rich web-related functionality and data models.

## Developing Custom Widgets

ForwardWidget supports extending functionality through JavaScript scripts. Each Widget is an independent JavaScript file that must follow specific structure and specifications.

### Widget Metadata Configuration

Each Widget script must start with a `WidgetMetadata` object that defines the basic information and functional modules:

```javascript
var WidgetMetadata = {
    id: "unique_id",                            // Widget unique identifier
    title: "Widget Title",                      // Widget display title
    description: "Description",                 // Widget description
    author: "Author Name",                      // Author
    site: "https://example.com",                // Website URL
    version: "1.0.0",                           // Widget version
    requiredVersion: "0.0.1",                   // Required ForwardWidget version
    detailCacheDuration: 60,                    // Duration of detail data cache, unit: seconds. default: 60.
    modules: [                                  // List of functional modules
        {
            title: "Module Title",              // Module title
            description: "Description",         // Module description
            requiresWebView: false,             // Whether WebView is required
            functionName: "functionName",       // Handler function name
            sectionMode: false,                 // Whether section mode is supported
            cacheDuration: 3600,                  // module api cache duration, unit: seconds. default: 3600.
            params: [                           // Parameter configuration
                {
                    name: "paramName",          // Parameter name
                    title: "Param Title",       // Parameter display title
                    type: "input",              // Parameter type input | constant | enumeration | count | page | offset
                    description: "Description", // Parameter description
                    value: "defaultValue",      // Default value
                    belongTo: {                 // Triggered only when this condition is met
                        paramName: "param name" // Sub-parameter of the parent parameter
                        value: ["value"]        // Values contained in the parent parameter
                    }
                    placeholders: [             // Placeholder options
                        {
                            title: "Option Title",
                            value: "optionValue"
                        }
                    ],
                    enumOptions: [              // Enumeration options
                        {
                            title: "Option Title",
                            value: "optionValue"
                        }
                    ]
                }
            ]
        }
    ],
    search: {                   // Search function configuration (optional)
        title: "Search",
          functionName: "search",
        params: [/* Search parameter configuration */]
    }
};
```

### Parameter Type Description

Widget supports the following parameter types:

- `input`: Text input field
- `count`: Number counter
- `constant`: Constant value
- `enumeration`: Enumeration selector
- `page`: Page number selector
- `offset`: Current Offset

### Handler Function Specification

Each module needs to implement a corresponding handler function with the same name as `functionName`. The handler function receives a `params` object as a parameter containing all configured parameter values.

```javascript
async function functionName(params = {}) {
    try {
        // 1. Parameter validation
        if (!params.requiredParam) {
            throw new Error("Missing required parameter");
        }

        // 2. Send request
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 ...",
                "Referer": "https://example.com"
            }
        });

        // 3. Parse response
        const docId = Widget.dom.parse(response.data);
        const elements = Widget.dom.select(docId, "selector");

        // 4. Return results
        return elements.map(element => ({
            id: "unique_id",
            type: "type",
            title: "title",
            coverUrl: "url",
            // ... other properties
        }));
    } catch (error) {
        console.error("Processing failed:", error);
        throw error;
    }
}
```

### DOM Operation API

Widget has built-in cheerio for DOM parsing.

```javascript
// Get cheerio handle
const $ = Widget.html.load(htmlContent);
```

### HTTP Request API

Widget provides HTTP request API:

```javascript
// options example
// {
//   allow_redirects: false
//   headers: {
//     "User-Agent": "Mozilla/5.0 ...",
//     Referer: "https://example.com",
//   },
//   params: {
//   }
// }

// GET 请求
const response = await Widget.http.get(url, options);

// POST 请求
const response = await Widget.http.post(url, body, options);

let data = response.data
```

### Loading Detail Data When Type is "link"

```javascript
async function loadDetail(link) {
    // Must return an object containing videoUrl
}
```

### Return Data Format

Handler functions need to return an array of objects that conform to the ForwardWidget data model:

```javascript
// Video list item
{
    id: "unique_id",            // Based on the main value of different types. When type is url, it's the corresponding url. When type is douban, imdb, or tmdb, id is the corresponding id value. For tmdb id, it needs to be composed of type.id, e.g., tv.123 movie.234.
    type: "type",               // Type identifier url, douban, imdb, tmdb
    title: "title",             // Title
    posterPath: "url",          // Vertical cover image URL
    backdropPath: "url",        // Horizontal cover URL
    releaseDate: "date",        // Release date
    mediaType: "tv|movie",      // Media type
    rating: "5",                // Rating
    genreTitle: "genre",        // Genre
    duration: 123,              // Duration number
    durationText: "00:00",      // Duration text
    previewUrl: "url",          // Preview video URL
    videoUrl: "videoUrl",       // Video playback URL
    link: "link",               // Detail page URL
    episode: 1,                 // Episode number
    description: "description", // Description
    playerType: "system",       // player type system | app
    childItems: [VideoItem]     // Nested items of current object, maximum one level
}
```

### Best Practices

1. **Error Handling**
   - Use try-catch to catch exceptions
   - Provide meaningful error messages
   - Output debug information to console

2. **Parameter Validation**
   - Validate required parameters
   - Validate parameter values
   - Handle default values

3. **Performance Optimization**
   - Use appropriate request headers
   - Cache frequently used data
   - Optimize DOM selectors

4. **Code Organization**
   - Use clear function naming
   - Add necessary comments
   - Modularize processing logic

### Debugging

The App has built-in module testing tools

1. Use `console.log()` to output debug information
2. Check network requests and responses
3. Verify DOM parsing results
4. Test different parameter combinations
