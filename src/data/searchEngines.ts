import { SearchEngine } from "../types";

export const searchEngines: SearchEngine[] = [
  {
    name: "Google",
    key: "google",
    url: "https://www.google.com/search?q=",
    icon: "G",
    color: "#4285f4",
  },
  {
    name: "Yandex",
    key: "yandex",
    url: "https://yandex.ru/search/?text=",
    icon: "Я",
    color: "#fc3f1d",
  },
  {
    name: "Bing",
    key: "bing",
    url: "https://www.bing.com/search?q=",
    icon: "/microsoft.svg",
    color: "#008373",
  },
  {
    name: "DuckDuckGo",
    key: "ddg",
    url: "https://duckduckgo.com/?q=",
    icon: "/duck-duck.svg",
    color: "#de5833",
  },
  {
    name: "Brave",
    key: "brave",
    url: "https://search.brave.com/search?q=",
    icon: "/brave.svg",
    color: "#fb542b",
  },
  {
    name: "YouTube",
    key: "youtube",
    url: "https://www.youtube.com/results?search_query=",
    icon: "/you-tube.svg",
    color: "#ff0000",
  },
  {
    name: "GitHub",
    key: "github",
    url: "https://github.com/search?q=",
    icon: "/github.svg",
    color: "#24292e",
  },
];
