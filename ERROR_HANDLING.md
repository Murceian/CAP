# Error Handling & Debugging Guide

## Overview
The app includes a comprehensive error handling system with error boundaries, logging, and API error management.

## Components

### 1. **ErrorBoundary** (`components/ErrorBoundary.jsx`)
A React error boundary that catches any errors in child components and displays a user-friendly fallback UI.

**Usage:**
```jsx
import { ErrorBoundary } from "../components";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

The error boundary is automatically applied at the app root level in `src/App.jsx`.

**Features:**
- Catches render errors, lifecycle errors, and constructor errors
- Shows error details in development mode only
- Provides a "Return home" button to navigate back

### 2. **Logger** (`src/utils/logger.js`)
A simple logging utility for consistent error and info logging across the app.

**Usage:**
```jsx
import { logger } from "../src/utils";

logger.error("Something went wrong", errorObject);
logger.warn("This is a warning", dataToLog);
logger.info("Info message", optionalData);
logger.debug("Debug message", optionalData); // Only logs in development
```

**Features:**
- Automatic timestamps
- Different log levels (ERROR, WARN, INFO, DEBUG)
- Only logs to console in development (except errors, which always log)

### 3. **API Client** (`src/utils/apiClient.js`)
Pre-configured Axios instance with error interceptors for API requests.

**Usage:**
```jsx
import { apiClient } from "../src/utils";

try {
  const response = await apiClient.get("/products");
  console.log(response.data);
} catch (error) {
  console.error(error.message);
}
```

**Features:**
- Automatic error logging via logger
- Consistent error format: `{ status, message, originalError }`
- Uses `VITE_API_URL` environment variable (defaults to `http://localhost:3001/api`)

## Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:3001/api
```

See `.env.example` for reference.

## Example: Error Handling in Pages

The `pages/Shop.jsx` demonstrates error handling with try-catch blocks:

```jsx
const filteredProducts = useMemo(() => {
  try {
    // Logic here
    return products;
  } catch (err) {
    logger.error("Failed to filter products", err);
    setError("Unable to filter products. Please try again.");
    return fallbackProducts;
  }
}, [dependencies]);
```

## Best Practices

1. **Always log errors with context**
   ```jsx
   logger.error("User signup failed", { email, reason: error.message });
   ```

2. **Provide fallback UI for errors**
   ```jsx
   const [error, setError] = useState(null);
   if (error) return <ErrorMessage message={error} />;
   ```

3. **Use error boundary for route-level errors**
   - The app root is already wrapped; consider wrapping individual routes for granular control

4. **Handle API errors consistently**
   ```jsx
   try {
     const data = await apiClient.get("/endpoint");
   } catch (error) {
     logger.error("API request failed", error);
     // Show user-friendly message
   }
   ```

## Debugging Checklist

- [ ] Check browser console for error messages
- [ ] Open DevTools Network tab to inspect API requests
- [ ] Look for timestamps in console logs
- [ ] Verify `.env.local` has correct `VITE_API_URL`
- [ ] Check React ComponentStack in error boundary details (dev mode)

## Packages Installed

- **axios** (^1.7.5) - HTTP client with interceptor support
- **clsx** (^2.1.1) - Utility for conditional class names (ready for future use)

---

For questions or improvements, refer to the copilot instructions in `.github/copilot-instructions.md`.
