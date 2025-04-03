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

ForwardWidget is a JS component for building modules, providing rich web-related functionality and data models.

## Developing Custom Widgets

ForwardWidget supports extending functionality through JavaScript scripts. Each Widget is an independent JavaScript file that must follow a specific structure and specifications.

### Widget Metadata Configuration

Each Widget script must start with a `WidgetMetadata` object that defines the basic information and functional modules of the Widget:

```javascript
var WidgetMetadata = {
    id: "unique_id",           // Widget unique identifier
    title: "Widget Title",     // Widget display title
    description: "Description", // Widget description
    author: "Author Name",     // Author
    site: "https://example.com", // Website URL
    version: "1.0.0",         // Widget version
    requiredVersion: "0.0.1",  // Required ForwardWidget version
    modules: [                 // List of functional modules
        {
            title: "Module Title",     // Module title
            description: "Description", // Module description
            requiresWebView: false,    // Whether WebView is required
            functionName: "functionName", // Handler function name
            sectionMode: false,        // Whether section mode is supported
            params: [                  // Parameter configuration
                {
                    name: "paramName",     // Parameter name
                    title: "Param Title",  // Parameter display title
                    type: "input",         // Parameter type input | constant | enumeration | count | page
                    description: "Description", // Parameter description
                    value: "defaultValue", // Default value
                    belongTo: { // Triggered only when this condition is met
                        paramName: "param name" // Sub-parameter of the parent parameter
                        value: ["value"] // Values contained in the parent parameter
                    }
                    placeholders: [        // Placeholder options
                        {
                            title: "Option Title",
                            value: "optionValue"
                        }
                    ],
                    enumOptions: [         // Enumeration options
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
        requiresWebView: false,
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

### Handler Function Specifications

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

Widget provides the following DOM operation APIs:

```javascript
// Parse HTML
const docId = Widget.dom.parse(htmlString);

// Select elements
const elements = Widget.dom.select(docId, "selector");

// Select first element
const element = Widget.dom.selectFirst(docId, "selector");

// Get element text
const text = Widget.dom.text(elementId);

// Get element attribute
const value = Widget.dom.attr(elementId, "attributeName");
```

### HTTP Request API

Widget provides HTTP request APIs:

```javascript
// GET request
const response = await Widget.http.get(url, {
    headers: {
        "User-Agent": "Mozilla/5.0 ...",
        "Referer": "https://example.com"
    }
});

// POST request
const response = await Widget.http.post(url, {
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
});

let data = response.data
```

### Return Data Format

Handler functions need to return an array of objects that conform to the ForwardWidget data model:

```javascript
// Video list item
{
    id: "unique_id",           // Based on the main value of different types, when type is url, it's the corresponding url, when type is douban or imdb, id is the corresponding id value
    type: "type",             // Type identifier url, douban, imdb
    title: "title",           // Title
    coverUrl: "url",          // Cover image URL
    durationText: "00:00",    // Duration text
    previewUrl: "url",        // Preview video URL
    description: "description" // Description
}

// Section data
{
    title: "Section Title",   // Section title
    items: [/* Array of video list items */]
}
```

### Best Practices

1. **Error Handling**
   - Use try-catch to catch exceptions
   - Provide meaningful error messages
   - Output debug information to the console

2. **Parameter Validation**
   - Validate the existence of required parameters
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

The app has built-in module testing tools

1. Use `console.log()` to output debug information
2. Check network requests and responses
3. Verify DOM parsing results
4. Test different parameter combinations
