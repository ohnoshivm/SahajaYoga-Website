/**
 * Chakra raga recordings. Source: "Music and Meditation" by Sahaja Artists / USA Collective
 * (sahajsongs.bandcamp.com), All Rights Reserved. We do NOT host these files: playback uses
 * Bandcamp's official embedded player until hosting permission is granted.
 * licenceStatus: "embed" = official embed only · "approved" = may self-host · "pending" · "unavailable"
 */
export type AudioTrack = {
  id: string;
  chakra: string;
  raga: string;
  artist: string;
  title: string;
  sourceUrl: string;
  bandcamp: { album: string; track: string };
  licenceStatus: "embed" | "approved" | "pending" | "unavailable";
  attribution: string;
};

const ALBUM = "4093935180";
const SOURCE = "https://sahajsongs.bandcamp.com/album/music-and-meditation";
const COLLECTIVE = "Sahaja Artists / USA Collective, “Music and Meditation”";

export const TRACKS: AudioTrack[] = [
  { id: "mooladhara-shyam-kalyan", chakra: "mooladhara", raga: "Shyam Kalyan", artist: "Koushik Aithal", title: "Mooladhara: Shyam Kalyan", sourceUrl: SOURCE, bandcamp: { album: ALBUM, track: "1894824669" }, licenceStatus: "embed", attribution: COLLECTIVE },
  { id: "swadisthan-yaman", chakra: "swadisthan", raga: "Yaman", artist: "Shakthidhar Iyer, Paulo Vinícius", title: "Swadhishthana: Yaman", sourceUrl: SOURCE, bandcamp: { album: ALBUM, track: "3871340065" }, licenceStatus: "embed", attribution: COLLECTIVE },
  { id: "nabhi-abhogi", chakra: "nabhi", raga: "Abhogi", artist: "Shakthidhar Iyer", title: "Nabhi: Abhogi", sourceUrl: SOURCE, bandcamp: { album: ALBUM, track: "2013213224" }, licenceStatus: "embed", attribution: COLLECTIVE },
  { id: "anahat-durga", chakra: "anahat", raga: "Durga", artist: "Shakthidhar Iyer, Paulo Vinícius", title: "Anahat: Durga", sourceUrl: SOURCE, bandcamp: { album: ALBUM, track: "375156208" }, licenceStatus: "embed", attribution: COLLECTIVE },
  { id: "vishuddhi-jaijaivanti", chakra: "vishuddhi", raga: "Jaijaivanti", artist: "Koushik Aithal", title: "Vishuddhi: Jaijaivanti", sourceUrl: SOURCE, bandcamp: { album: ALBUM, track: "1900400117" }, licenceStatus: "embed", attribution: COLLECTIVE },
  { id: "agnya-bageshri", chakra: "agnya", raga: "Bageshri", artist: "Shakthidhar Iyer", title: "Agnya: Bageshri", sourceUrl: SOURCE, bandcamp: { album: ALBUM, track: "3652620798" }, licenceStatus: "embed", attribution: COLLECTIVE },
  { id: "sahasrara-bhairavi", chakra: "sahasrara", raga: "Bhairavi", artist: "Shakthidhar Iyer, Paulo Vinícius, Koushik Aithal", title: "Sahasrara: Bhairavi", sourceUrl: SOURCE, bandcamp: { album: ALBUM, track: "554925079" }, licenceStatus: "embed", attribution: COLLECTIVE },
];

export const trackForChakra = (slug: string) => TRACKS.find((t) => t.chakra === slug);

export function bandcampEmbedUrl(t: AudioTrack, colours: { bg: string; link: string }) {
  const bg = colours.bg.replace("#", "");
  const link = colours.link.replace("#", "");
  return `https://bandcamp.com/EmbeddedPlayer/album=${t.bandcamp.album}/size=small/bgcol=${bg}/linkcol=${link}/track=${t.bandcamp.track}/transparent=true/`;
}
