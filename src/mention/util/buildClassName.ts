type Parts = (string | false | undefined)[];

export default function buildClassName(...parts: Parts) {
  return parts.filter(Boolean).join(' ');
}