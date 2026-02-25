export class StorageService {
  getCookieValue(name) {
    const token = `${name}=`;
    const all = document.cookie ? document.cookie.split(";") : [];
    for (let i = 0; i < all.length; i++) {
      const part = all[i].trim();
      if (part.startsWith(token)) return decodeURIComponent(part.slice(token.length));
    }
    return "";
  }

  loadHighScore(key = "website_game_highscore") {
    const cookieParsed = parseInt(this.getCookieValue(key), 10);
    let best = Number.isFinite(cookieParsed) && cookieParsed > 0 ? cookieParsed : 0;
    try {
      const lsParsed = parseInt(localStorage.getItem(key) || "0", 10);
      if (Number.isFinite(lsParsed) && lsParsed > best) best = lsParsed;
    } catch (_) {
      // Ignore storage access errors.
    }
    return best;
  }

  saveHighScore(score, key = "website_game_highscore") {
    const oneYearSeconds = 60 * 60 * 24 * 365;
    document.cookie = `${key}=${encodeURIComponent(String(score))}; max-age=${oneYearSeconds}; path=/; samesite=lax`;
    try {
      localStorage.setItem(key, String(score));
    } catch (_) {
      // Ignore storage access errors.
    }
  }
}
