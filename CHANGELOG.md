# Changelog

## [2.0.0](https://github.com/sandovaldavid/portfolio/compare/v1.0.0...v2.0.0) (2026-08-03)


### Features

* **ai:** add portfolio project agent profile ([#231](https://github.com/sandovaldavid/portfolio/issues/231)) ([6220c61](https://github.com/sandovaldavid/portfolio/commit/6220c61a53521d1207186fade3204c81e6af753d))
* **content:** add localized professional experience entries ([#167](https://github.com/sandovaldavid/portfolio/issues/167)) ([2b4cbf5](https://github.com/sandovaldavid/portfolio/commit/2b4cbf5f4e07b03c5f6d9782be1b7ca2202d3b88))
* **content:** add localized profile and biography sources ([#165](https://github.com/sandovaldavid/portfolio/issues/165)) ([bd4be1c](https://github.com/sandovaldavid/portfolio/commit/bd4be1c128641b4208eebfdd62dda309582c7ec8))
* **content:** add localized project and case-study entries ([#169](https://github.com/sandovaldavid/portfolio/issues/169)) ([d02bd45](https://github.com/sandovaldavid/portfolio/commit/d02bd450673da190e2749816061ac4f91f66bd3e))
* **content:** pair blog and devlog translations ([#170](https://github.com/sandovaldavid/portfolio/issues/170)) ([f564fd2](https://github.com/sandovaldavid/portfolio/commit/f564fd241a167471783ad146466133abcc5854df))
* **i18n:** implement type-safe granular UI catalogs ([#161](https://github.com/sandovaldavid/portfolio/issues/161)) ([d02d3c6](https://github.com/sandovaldavid/portfolio/commit/d02d3c662033874707f581ed663ccdfdbe839c21))
* **portfolio:** add Yukidoke flagship case study ([#130](https://github.com/sandovaldavid/portfolio/issues/130)) ([60b301d](https://github.com/sandovaldavid/portfolio/commit/60b301dd4c84914293a1d68ba40ec856369f8bd5))
* **projects:** add Kioku as the primary public backend case study ([#211](https://github.com/sandovaldavid/portfolio/issues/211)) ([a51179c](https://github.com/sandovaldavid/portfolio/commit/a51179c9981c4cb86124d9902e968647fb808ccd)), closes [#205](https://github.com/sandovaldavid/portfolio/issues/205)
* **projects:** standardize recruiter evidence, access and status ([#213](https://github.com/sandovaldavid/portfolio/issues/213)) ([dbf6b3b](https://github.com/sandovaldavid/portfolio/commit/dbf6b3b1e41f7353d13bfd7752bf372f99120de2)), closes [#207](https://github.com/sandovaldavid/portfolio/issues/207)
* **typography:** align blog and project case studies with the Identity System ([#247](https://github.com/sandovaldavid/portfolio/issues/247)) ([0094894](https://github.com/sandovaldavid/portfolio/commit/0094894ab4339cefa4a3f025e25168264c5becb9)), closes [#245](https://github.com/sandovaldavid/portfolio/issues/245)
* **ui:** add section scroll controller for home ([#240](https://github.com/sandovaldavid/portfolio/issues/240)) ([160149b](https://github.com/sandovaldavid/portfolio/commit/160149b3846100689923c2d372a641bb7730e739))


### Bug Fixes

* **brand:** align portfolio identity, contact and messaging ([#191](https://github.com/sandovaldavid/portfolio/issues/191)) ([e218a31](https://github.com/sandovaldavid/portfolio/commit/e218a3101a2fb759f7f0470dc74383d8a288f024)), closes [#190](https://github.com/sandovaldavid/portfolio/issues/190)
* **ci:** exclude dist build artifacts from codeql ([#235](https://github.com/sandovaldavid/portfolio/issues/235)) ([67b110c](https://github.com/sandovaldavid/portfolio/commit/67b110cdeb8fafa523c5706411af6cc82c772e66))
* **ci:** follow redirects verifying canonical resume URLs ([#199](https://github.com/sandovaldavid/portfolio/issues/199)) ([5db1003](https://github.com/sandovaldavid/portfolio/commit/5db1003eab0c6a1c4326fabd553666600d702781))
* **devcontainer:** isolate node_modules from host ([1be3ad8](https://github.com/sandovaldavid/portfolio/commit/1be3ad8d6b12c577a6bcc2632b7cde798e670c29)), closes [#153](https://github.com/sandovaldavid/portfolio/issues/153)
* **devcontainer:** repair generated workspace ownership ([#156](https://github.com/sandovaldavid/portfolio/issues/156)) ([da13789](https://github.com/sandovaldavid/portfolio/commit/da137899e0f2953415581e428fe43888230e9252))
* **devcontainer:** use deterministic VS Code port forwarding ([#168](https://github.com/sandovaldavid/portfolio/issues/168)) ([3778a4a](https://github.com/sandovaldavid/portfolio/commit/3778a4a424deb037a6999c56c73e1f22fe704044))
* **e2e:** mount theme toggle and repair stale full-suite drift ([#197](https://github.com/sandovaldavid/portfolio/issues/197)) ([5b894b6](https://github.com/sandovaldavid/portfolio/commit/5b894b619baedbb1328958643f8a6043444d3ee1))
* **fonts:** use font-display optional to eliminate homepage layout shift ([#251](https://github.com/sandovaldavid/portfolio/issues/251)) ([3e45ade](https://github.com/sandovaldavid/portfolio/commit/3e45ade3d43089176c03ead8206ca78ef5907087))
* **i18n:** localize SEO and accessibility metadata ([#172](https://github.com/sandovaldavid/portfolio/issues/172)) ([b2717ec](https://github.com/sandovaldavid/portfolio/commit/b2717ecd00cd2149f424346f35078c4053f21285))
* **nav:** move blog after about-me in the primary nav ([#226](https://github.com/sandovaldavid/portfolio/issues/226)) ([f095ab8](https://github.com/sandovaldavid/portfolio/commit/f095ab84e5fd63c08ebb8fe1be145366e8e0b7eb))
* **release:** promote e2e suite fixes to main ([a116dab](https://github.com/sandovaldavid/portfolio/commit/a116dab724a2a9e48983aad4ebf065a1a6891f52))
* **release:** promote resume-URL redirect fix to main ([9a4b652](https://github.com/sandovaldavid/portfolio/commit/9a4b652b8bc33679ed5329371f7a3a6325663a45))
* **resume:** restore canonical asset delivery ([#183](https://github.com/sandovaldavid/portfolio/issues/183)) ([ef302db](https://github.com/sandovaldavid/portfolio/commit/ef302dba2f9e0069ace529df90e17d4ca733ce24))
* **tooling:** remove Astro and Tailwind diagnostics ([#145](https://github.com/sandovaldavid/portfolio/issues/145)) ([6a6bc72](https://github.com/sandovaldavid/portfolio/commit/6a6bc723c254a87227fecbbcf2aab6ca15a32ce2))
* **ui:** preserve LinkInline composition and separate article header metadata ([#246](https://github.com/sandovaldavid/portfolio/issues/246)) ([a38eaa4](https://github.com/sandovaldavid/portfolio/commit/a38eaa4f6611580ba49afdcd5dc561a1b39ef2f8)), closes [#244](https://github.com/sandovaldavid/portfolio/issues/244)
* **ui:** remove redundant hero actions and use SVG arrows ([#159](https://github.com/sandovaldavid/portfolio/issues/159)) ([be0944f](https://github.com/sandovaldavid/portfolio/commit/be0944fe3015445dcd56d7ed9f0cdfb533cf61b4))


### Performance Improvements

* **ci:** cut Main Quality runtime with parallelism and a lighter gate ([#203](https://github.com/sandovaldavid/portfolio/issues/203)) ([8f9e390](https://github.com/sandovaldavid/portfolio/commit/8f9e3900a71f14cdac5195b04b739fe96bb33c86))
* **ci:** optimize workflow triggers and jobs ([#238](https://github.com/sandovaldavid/portfolio/issues/238)) ([7100d90](https://github.com/sandovaldavid/portfolio/commit/7100d9013dcd6de57975058c68aced422dbe344e))


### Miscellaneous

* **release:** promote develop to main ([fb877ab](https://github.com/sandovaldavid/portfolio/commit/fb877ab7dc311b04479196cd8e1118d35b401811))
