import * as cheerio from 'cheerio';

export function extractLinkFromHtml(html: string) {
  const $ = cheerio.load(html);
  const link = $('a').first().attr('href');

  return link;
}
