// Static export için image loader
export default function imageLoader({ src, width, quality }) {
  return `${src}?w=${width}&q=${quality || 75}`
}
