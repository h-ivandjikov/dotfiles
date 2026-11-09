return {
	"stevearc/conform.nvim",
	opts = {
		formatters_by_ft = {
			lua = { "stylua" },
			python = { "ruff" },
			typescript = { "biome", "prettierd", stop_after_first = true },
			javascript = { "biome", "prettierd", stop_after_first = true },
			json = { "biome", "jq", stop_after_first = true },
			toml = { "taplo" },
			xml = { "xmlformatter" },
			sql = { "sqruff" },
			yaml = { "yamlfmt" },
			sh = { "shfmt" },
			html = { "prettierd" },
		},
		format_on_save = {
			timeout_ms = 500,
			lsp_format = "fallback",
		},
	},
}
