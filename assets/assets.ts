
// We cannot 'import' images in a native browser ESM environment.
// Instead, we export the path relative to the web root (index.html).
// This assumes the server serves 'assets/avatar.jpg' at this path.
export const DEFAULT_AVATAR_IMAGE = 'assets/avatar.jpg';
