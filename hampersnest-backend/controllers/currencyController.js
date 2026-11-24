/**
 * In-memory Currency Exchange Rate Controller
 * Powered by Frankfurter API (Free, no API key, ECB reference rates)
 * Endpoint: GET https://api.frankfurter.dev/v2/rate/INR/USD
 * Returns: {"date":"2026-11-14","base":"INR","quote":"USD","rate":0.010634}
 */

const FRANKFURTER_API_URL = 'https://api.frankfurter.dev/v2/rate/INR/USD';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours cache

// In-memory cache store
let currencyCache = {
  base: 'INR',
  quote: 'USD',
  rate: 0.010634,          // 1 INR = 0.010634 USD
  inrPerUsd: 94.04,        // 1 USD = ~94.04 INR (1 / rate)
  date: new Date().toISOString().split('T')[0],
  lastFetched: 0,
  source: 'frankfurter',
  isFallback: false
};

let isFetching = false;

/**
 * Fetch latest rate from Frankfurter API and update in-memory cache
 */
export async function refreshRateFromAPI() {
  if (isFetching) return currencyCache;
  isFetching = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(FRANKFURTER_API_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HampersNest-Backend/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Frankfurter API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data && typeof data.rate === 'number' && data.rate > 0) {
      const rate = data.rate;
      const inrPerUsd = Number((1 / rate).toFixed(2));

      currencyCache = {
        base: data.base || 'INR',
        quote: data.quote || 'USD',
        rate: rate,
        inrPerUsd: inrPerUsd,
        date: data.date || new Date().toISOString().split('T')[0],
        lastFetched: Date.now(),
        source: 'frankfurter',
        isFallback: false
      };

      console.log(`[Currency] Exchange rate refreshed via Frankfurter: 1 INR = $${rate} USD (1 USD = Rs. ${inrPerUsd})`);
    } else {
      throw new Error('Invalid rate format from Frankfurter');
    }
  } catch (error) {
    console.warn(`[Currency] Failed to refresh exchange rate: ${error.message}. Serving existing in-memory cache.`);
    // If cache has never been fetched successfully, mark as fallback
    if (currencyCache.lastFetched === 0) {
      currencyCache.isFallback = true;
      currencyCache.lastFetched = Date.now();
    }
  } finally {
    isFetching = false;
  }

  return currencyCache;
}

// Initial fetch on server start
refreshRateFromAPI();

// Periodic background refresh every 6 hours
setInterval(() => {
  refreshRateFromAPI();
}, CACHE_TTL_MS);

/**
 * GET /api/currency/rate
 * Responds instantly from memory. Checks TTL and refreshes in background if expired.
 */
export async function getExchangeRate(req, res) {
  try {
    const isExpired = Date.now() - currencyCache.lastFetched > CACHE_TTL_MS;
    if (isExpired && !isFetching) {
      // Trigger background refresh without blocking response
      refreshRateFromAPI().catch(err => console.error('[Currency] Background refresh error:', err));
    }

    return res.status(200).json({
      success: true,
      data: currencyCache
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve exchange rate',
      fallback: currencyCache
    });
  }
}

/**
 * Helper for other backend services if they need current in-memory rate
 */
export function getInMemoryCurrencyRate() {
  return currencyCache;
}
