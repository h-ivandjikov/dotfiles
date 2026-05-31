-- Autocmds are automatically loaded on the VeryLazy event
-- Default autocmds that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/autocmds.lua
--
-- Add any additional autocmds here
-- with `vim.api.nvim_create_autocmd`
--
-- Or remove existing autocmds by their group name (which is prefixed with `lazyvim_` for the defaults)
-- e.g. vim.api.nvim_del_augroup_by_name("lazyvim_wrap_spell")

-- This stops neovim from automatically commenting a new line when you are starting from a commented line.
vim.cmd("autocmd BufEnter * set formatoptions-=cro")
vim.cmd("autocmd BufEnter * setlocal formatoptions-=cro")

-- Force scrolloff to re-apply when switching windows or closing terminals
vim.api.nvim_create_autocmd({ "WinEnter", "VimResized", "TermClose" }, {
  group = vim.api.nvim_create_augroup("force_scrolloff", { clear = true }),
  callback = function()
    vim.opt.scrolloff = 999
  end,
})
