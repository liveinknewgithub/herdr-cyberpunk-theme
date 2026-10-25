#!/bin/sh
# Herdr plugin: show coding agents as Nerd Font logo glyphs instead of text labels.
#
# Herdr renders an agent's name from display-only pane metadata when a reporter
# sets `display_agent` (sidebar rows, mobile view, pane-border labels). This
# script maps the detected agent label to a glyph and reports it with an
# `--agent` guard, so the glyph stops applying as soon as a different agent (or
# none) owns the pane. Semantic state, waits, and notifications are untouched.
#
#   sync   apply glyphs to every live agent (startup hook + "Refresh agent icons")
#   event  apply the glyph for one `pane.agent_detected` hook event
#
# Glyphs need a Nerd Font; cod-claude and cod-openai need Symbols Nerd Font >= 3.5.
# Agents without a mapping keep their text label.
set -eu

HERDR=${HERDR_BIN_PATH:-herdr}
JQ=$(command -v jq || echo /usr/bin/jq)
SOURCE_PREFIX=plugin:local.agent-icons
TAB=$(printf '\t')

# Prints "<key> <glyph>" for a Herdr agent label; fails for unmapped labels.
icon_for() {
	key=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9')
	case $key in
	claude) glyph='' ;;                         # cod-claude               U+EC82
	codex) glyph='' ;;                          # cod-openai               U+EC81
	gemini) glyph='󰫢' ;;                         # md-star_four_points      U+F0AE2
	copilot | githubcopilot) glyph='' ;;        # cod-copilot              U+EC1E
	cursor) glyph='󰆧' ;;                         # md-cube_outline          U+F01A7
	opencode) glyph='󰆍' ;;                       # md-console               U+F018D
	pi) glyph='󰏿' ;;                             # md-pi                    U+F03FF
	omp) glyph='󰐀' ;;                            # md-pi_box                U+F0400
	droid) glyph='󰚩' ;;                          # md-robot                 U+F06A9
	devin) glyph='󰖵' ;;                          # md-account_hard_hat      U+F05B5
	agy | antigravity | antigravitycli) glyph='󱓞' ;; # md-rocket_launch     U+F14DE
	cline) glyph='󱜚' ;;                          # md-robot_happy_outline   U+F171A
	mastracode) glyph='󰬔' ;;                     # md-alpha_m_box           U+F0B14
	kimi | kimicode) glyph='󰽥' ;;                # md-moon_waning_crescent  U+F0F65
	kiro | kirocli) glyph='󰊠' ;;                 # md-ghost                 U+F02A0
	amp) glyph='󱐋' ;;                            # md-lightning_bolt        U+F140B
	grok) glyph='⊘' ;;                              # circled division slash   U+2298
	hermes) glyph='󰛓' ;;                         # md-feather               U+F06D3
	kilo | kilocode) glyph='󰬒' ;;                # md-alpha_k_box           U+F0B12
	qodercli | qoder) glyph='󰬘' ;;               # md-alpha_q_box           U+F0B18
	qwen | qwencode) glyph='󰫈' ;;                # md-hexagon_slice_6       U+F0AC8
	letta | lettacode) glyph='󰍛' ;;              # md-memory                U+F035B
	maki) glyph='󰺕' ;;                           # md-circle_double         U+F0E95
	muse | musecode) glyph='󰛤' ;;                # md-infinity              U+F06E4
	crush) glyph='󰋑' ;;                          # md-heart                 U+F02D1
	commandcode) glyph='󰘳' ;;                    # md-apple_keyboard_command U+F0633
	prime | primeagent) glyph='󰬗' ;;             # md-alpha_p_box           U+F0B17
	*) return 1 ;;
	esac
	printf '%s %s' "$key" "$glyph"
}

# apply PANE_ID AGENT_LABEL
apply() {
	mapping=$(icon_for "$2") || return 0
	# One source per agent keeps a late report for a previous agent from
	# replacing the current agent's glyph in the same pane.
	"$HERDR" pane report-metadata "$1" \
		--source "$SOURCE_PREFIX:${mapping%% *}" \
		--agent "$2" \
		--display-agent "${mapping#* }" >/dev/null
}

sync_all() {
	"$HERDR" agent list |
		"$JQ" -r '.result.agents[] | select(.agent != null) | "\(.pane_id)\t\(.agent)"' |
		while IFS=$TAB read -r pane agent; do
			apply "$pane" "$agent" || echo "agent-icons: failed to label $pane ($agent)" >&2
		done
}

on_event() {
	[ -n "${HERDR_PLUGIN_EVENT_JSON:-}" ] || return 0
	printf '%s' "$HERDR_PLUGIN_EVENT_JSON" |
		"$JQ" -r '.data | select(.released != true and .pane_id != null and .agent != null) | "\(.pane_id)\t\(.agent)"' |
		while IFS=$TAB read -r pane agent; do
			apply "$pane" "$agent"
		done
}

case ${1:-} in
sync) sync_all ;;
event) on_event ;;
*)
	echo "usage: agent-icons.sh sync|event" >&2
	exit 2
	;;
esac
