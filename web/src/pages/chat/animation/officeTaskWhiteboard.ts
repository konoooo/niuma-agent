import { Container, HTMLText, Rectangle } from "pixi.js";
import type { PropViewRegistry } from "@pixoffice/renderer-pixi";

export function officeTaskWhiteboard(
  readMarkup: () => string,
): ReturnType<PropViewRegistry["create"]> {
  const root = new Container();
  const content = new HTMLText({
    text: "",
    resolution: 2,
    style: {
      fontFamily: "system-ui, sans-serif",
      fontSize: 30,
      fill: 0x343b36,
      whiteSpace: "normal",
      wordWrap: true,
      wordWrapWidth: 778,
      cssOverrides: ["font-size:inherit", "line-height:inherit", "color:inherit"],
    },
  });
  content.position.set(71, -157);
  content.scale.set(450 / 778);
  root.addChild(content);
  root.hitArea = new Rectangle(54, -164, 486, 188);
  let previous = "",
    elapsed = 0;
  const paint = () => {
    const markup = readMarkup();
    if (markup === previous) return;
    previous = markup;
    content.text = `<div style="box-sizing:border-box;width:778px;height:314px;padding:8px 24px 8px;color:#343b36;overflow:hidden;white-space:normal">${markup}</div>`;
  };
  return {
    roots: [root],
    hitTarget: root,
    update(prop) {
      root.position.set(prop.position.x * 50, prop.position.y * 50);
      root.zIndex = prop.position.y * 50;
      paint();
    },
    updateFrame(dt) {
      elapsed += dt;
      if (elapsed < 0.25) return;
      elapsed %= 0.25;
      paint();
    },
  };
}
