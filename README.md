# Herdr Cyberpunk Theme

Neon-noir theme for [Herdr](https://herdr.dev): a deep violet palette with neon cyan, hot magenta, and yellow/red status colors, plus a plugin that shows each coding agent as its logo instead of its name.

## What's included

| Path | Purpose |
| --- | --- |
| `config.toml` | Full Herdr config: `[theme.custom]` palette, symbol status indicators, neon pane frames labeled with agent logos, a `NEON//NET` tab-bar readout, and one-line agent rows tinted with each agent's brand color. |
| `plugins/agent-icons/` | `local.agent-icons` plugin. When Herdr detects an agent (and at server startup) it sets the agent's display name to a Nerd Font logo with `herdr pane report-metadata --display-agent`, guarded by `--agent` so the logo goes away when that agent exits. |

## Requirements

- Herdr 0.9.5 or newer.
- A Nerd Font in your terminal. The Claude (`U+EC82`) and OpenAI/Codex (`U+EC81`) logos need Nerd Fonts 3.5 or newer, for example [Symbols Nerd Font](https://github.com/ryanoasis/nerd-fonts/releases).
- `jq` (included with recent macOS).

## Install

```sh
git clone https://github.com/liveinknewgithub/herdr-cyberpunk-theme.git
cd herdr-cyberpunk-theme
cp ~/.config/herdr/config.toml ~/.config/herdr/config.toml.bak   # keep your current config
cp config.toml ~/.config/herdr/config.toml
herdr plugin link "$PWD/plugins/agent-icons"
herdr plugin action invoke local.agent-icons.sync                 # label agents already running
herdr server reload-config
```

`config.toml` mentions `~/.config/herdr/local-plugins/agent-icons`, where the plugin lives on the original machine; `herdr plugin link` works from any path.

## Customize

- Icons: edit the `case` block in `plugins/agent-icons/agent-icons.sh`. Each line names the Nerd Font glyph and codepoint; agents without a mapping keep their text name.
- Agent colors: `[ui.sidebar.agents.rows_by_agent]` in `config.toml`.
- Pane frames: `pane_borders = "always"` frames every pane; `"auto"` frames only splits.

Matching terminal colors: [ghostty-cyberpunk-theme](https://github.com/liveinknewgithub/ghostty-cyberpunk-theme).
