import { b as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, d as renderScript, a as renderTemplate } from './astro/server_CbsihVi2.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro("https://www.wxjxpp.online");
const $$GrokOrb = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$GrokOrb;
  const {
    size = 96,
    state = "curious",
    mood = "hold",
    follow = true,
    shape = "blob",
    class: className = ""
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(["grok-orb", className], "class:list")} data-grok-orb role="button" tabindex="0" aria-label="点击切换小球形状"${addAttribute(state, "data-state")}${addAttribute(state, "data-base-state")}${addAttribute(mood, "data-mood")}${addAttribute(shape, "data-shape")}${addAttribute(follow ? "1" : "0", "data-follow")}${addAttribute(`--orb-size:${size}px`, "style")}> <svg class="grok-orb-svg" role="img" aria-label="Grok Bot"></svg> </div> ${renderScript($$result, "D:/git/Tencent/astro-lite-blog/src/components/GrokOrb.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/git/Tencent/astro-lite-blog/src/components/GrokOrb.astro", void 0);

export { $$GrokOrb as $ };
