# Stardust Weaver

Inspired by: [Stardust Weaver: Shaping 3D Particles](https://codepen.io/VoXelo/pen/PwwXVEY).

Interactive 3D particle simulation built with Three.js (WebGL), JavaScript (ES6), & GLSL shaders. Features shape morphing, post-processing (Bloom, custom effects), OrbitControls.

## Running Locally

To run this project on your local machine, you need to serve the files using a simple HTTP server. This is because the browser restricts loading ES modules (used for Three.js) from the local file system (`file://`).

1.  **Navigate to the project directory:**
    Open your terminal and change into the project's root folder.
    ```bash
    cd path/to/stardust-weaver
    ```

2.  **Start a local server:**
    If you have Python 3 installed, you can use its built-in server.
    ```bash
    python3 -m http.server 8000
    ```
    Alternatively, if you have Node.js, you can use `npx`.
    ```bash
    npx http-server . -p 8000
    ```


The interactive simulation should now be running.