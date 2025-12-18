# iOS Glass OS

A high-fidelity, web-based iOS simulator featuring a "liquid glass" aesthetic. This application replicates key iOS interactions and apps including Camera, Siri (powered by Gemini AI), Messages, Music, and Settings.

## Features

*   **Camera App**: Real-time camera access with a simulated UI, flash effect, and photo capture.
*   **Siri**: Integrated with Google Gemini API for intelligent, conversational responses.
*   **Messages**: Interactive chat simulation with AI-generated replies.
*   **Music**: Aesthetic music player interface.
*   **Dynamic Island**: Simulated dynamic island UI element.
*   **System UI**: Functional status bar, home bar, and app grid with "glassmorphism" design.

## Prerequisites

*   Node.js (v16 or higher)
*   npm or yarn
*   A Google Gemini API Key

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/ios-glass-os.git
    cd ios-glass-os
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    *   Create a `.env` file in the root directory.
    *   Add your Gemini API key:
        ```
        API_KEY=your_google_gemini_api_key_here
        ```
    *   *Note*: In a production Vite app, you would typically use `VITE_API_KEY`, but the current setup uses `process.env` define replacement for compatibility with the existing codebase.

## Development

To start the local development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

## Build & Deployment

To build the application for production:

```bash
npm run build
```

This will compile the TypeScript code and bundle assets into the `dist` directory. You can deploy this directory to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

### Preview Production Build

To preview the built application locally:

```bash
npm run preview
```

## Configuration Files

*   **`vite.config.ts`**: Configuration for the Vite bundler.
*   **`tailwind.config.js`**: Configuration for Tailwind CSS styles.
*   **`tsconfig.json`**: TypeScript compiler options.

## Technologies Used

*   **React**: UI Library.
*   **TypeScript**: Type safety.
*   **Tailwind CSS**: Styling.
*   **Google GenAI SDK**: AI integration for Siri and Messages.
*   **Lucide React**: Iconography.
*   **Vite**: Build tool and development server.

## License

MIT
