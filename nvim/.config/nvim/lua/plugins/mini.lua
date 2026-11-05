return {
	"nvim-mini/mini.nvim",
	version = "*",
	config = function()
		require("mini.move").setup({
			mappings = {
				left = "H",
				right = "L",
				up = "K",
				down = "J",

				line_left = "H",
				line_right = "L",
				line_up = "K",
				line_down = "J",
			},
			options = {
				reindent_linewise = true,
			},
		})
		require("mini.surround").setup({})
	end,
}
