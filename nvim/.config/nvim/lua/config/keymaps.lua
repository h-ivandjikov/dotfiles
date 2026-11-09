vim.g.mapleader = " "
local map = vim.keymap.set
-- when searching for keyword with '/', pressing ESC in normal mode will remove highlighted words
map("n", "<Esc>", "<cmd>nohlsearch<CR>")

-- ctrl + hjkl navigation between buffers
map("n", "<C-h>", "<C-w>h", { desc = "Go to Left Window" })
map("n", "<C-j>", "<C-w>j", { desc = "Go to Lower Window" })
map("n", "<C-k>", "<C-w>k", { desc = "Go to Upper Window" })
map("n", "<C-l>", "<C-w>l", { desc = "Go to Right Window" })

map({ "n", "x" }, "c", '"_c', {
	desc = "Change without yanking",
})

map("n", "<C-_>", "<cmd>suspend<CR>", { desc = "Suspend Neovim" })

-- grep for files / words
map("n", "<leader><leader>", function()
	Snacks.picker.files()
end, { desc = "Find Files" })
map("n", "<leader>/", function()
	Snacks.picker.grep()
end, { desc = "Live Grep" })
map("n", "<leader>b", function()
	Snacks.picker.buffers()
end, { desc = "Find Buffers" })

-- toggle file picker
map("n", "<leader>e", function()
	if vim.bo.filetype == "oil" then
		require("oil").close()
	else
		require("oil").open()
	end
end, { desc = "Toggle Oil" })

vim.api.nvim_create_autocmd("FileType", {
	pattern = "oil",
	callback = function(args)
		vim.keymap.set("n", "<BS>", function()
			require("oil.actions").parent.callback()
		end, { buffer = args.buf, desc = "Open parent directory" })
	end,
})

-- open config
map("n", "<leader>fc", function()
	require("oil").open(vim.fn.stdpath("config"))
end, { desc = "Open Neovim Config" })
