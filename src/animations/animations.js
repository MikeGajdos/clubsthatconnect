import { gsap } from "gsap";

export const headerAnimation = () => {
  let tl = gsap.timeline({ delay: 0.25 });
  tl.from(".line .words", {
    yPercent: 110,
    opacity: 0,
    ease: "none",
    stagger: 0.25,
  });

  tl.set(".image-wrapper", { autoAlpha: 1 });
  tl.fromTo(
    ".image-wrapper",
    1.5,
    {
      clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
      webkitClipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
      scale: 1.3,
      ease: "easeInOut",
      ease: "Power2.out",
    },
    {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      webkitClipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      scale: 1.1,
      ease: "easeInOut",
    }
  );

  tl.from(".title-image", 4, {
    scale: 1.3,
    ease: "easeInOut",
    delay: -3,
  });
};
