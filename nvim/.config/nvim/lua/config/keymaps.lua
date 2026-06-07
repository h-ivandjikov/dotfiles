-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

-- This keymap makes it so you can move lines of code while in visual mode to specific line numbers,
-- for example 10J will move the selected code 10 lines down.
vim.keymap.set("v", "J", ":<C-u>execute \"'<,'>m '>+\" . v:count1<CR>gv=gv", { desc = "Move down" })
vim.keymap.set("v", "K", ":<C-u>execute \"'<,'>m '<-\" . (v:count1 + 1)<CR>gv=gv", { desc = "Move up" })

-- This keymap searches for my config in my dotfiles directory, not the standard neovim config location
vim.keymap.set("n", "<leader>fc", function()
  Snacks.picker.files({ cwd = "~/.dotfiles/nvim/.config/nvim/" })
end, { desc = "Find Config (dotfiles)" })

vim.keymap.set("n", "<C-\\>", "<C-^>", { desc = "Switch to alternate buffer" })
