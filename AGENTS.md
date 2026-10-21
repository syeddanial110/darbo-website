<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The homepage opens with a full-screen video banner (src/components/HeroVideo.tsx, public/videos/hero.mp4 + hero-poster.jpg); the nav overlays it. Media paths live in src/cinematic/config.ts — keeps assets swappable.
- Homepage portraits use the cinematic asset configuration rather than importing a separate portrait — keeps Darbo's likeness consistent throughout the site.
