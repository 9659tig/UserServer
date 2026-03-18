import { Request, Response } from 'express';
import { keywordEngine } from '../search/searchContext';

export const getAutocomplete = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    const type = req.query.type as string;

    if (!q) {
      return res.json({ suggestions: [] });
    }

    if (type !== 'product' && type !== 'influencer') {
      return res.status(400).json({ error: 'type must be "product" or "influencer"' });
    }

    const suggestions = type === 'product'
      ? await keywordEngine.suggestProducts(q)
      : await keywordEngine.suggestInfluencers(q);

    return res.json({ suggestions });
  } catch (err) {
    console.error('[Autocomplete] Error:', err);
    return res.status(500).json({ suggestions: [] });
  }
};
