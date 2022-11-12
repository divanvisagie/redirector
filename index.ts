import axios from "axios";
import jsdom from "jsdom";
import { mkdir, writeFile } from "fs";
import { dirname } from "path";
import { readFile } from "fs/promises";

function writeFileDeep(path: string, contents: string) {
  const cb = (err: any) => {
    console.log("Failed to write:", err);
  };

  mkdir(dirname(path), { recursive: true }, function (err) {
    if (err) return cb(err);

    writeFile(path, contents, cb);
  });
}

async function readTemplate({ post }: { post: string }): Promise<string> {
  const templateContent = await readFile("template/index.html");
  const rawTemplate = templateContent.toString();
  return rawTemplate.replace("{{POST}}", post);
}

async function main() {
  const response = await axios.get(`https://divanv.com`);
  const dom = new jsdom.JSDOM(response.data);

  const postsContainer = dom.window.document.querySelector(".posts-list");
  const aTags = postsContainer?.querySelectorAll("a").entries();

  if (aTags) {
    for await (const [_index, atag] of aTags) {
      const path = `docs/${atag.href}/index.html`;
      const tp = await readTemplate({ post: atag.href });
      writeFileDeep(path, tp);
      console.log("created path", path);
    }
  }
}
main();
