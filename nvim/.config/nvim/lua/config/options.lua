-- to not repeat vim.opt on every line
local set = vim.opt

-- numbers column settings
set.number = true
set.relativenumber = true
set.fillchars:append({ eob = " " }) -- overwrite '~' to an empty space

-- scroll settings
set.scrolloff = 999
set.sidescrolloff = 20
set.wrap = false

-- indent settings
set.shiftwidth = 4
set.tabstop = 4
set.expandtab = true

-- search settings
set.ignorecase = true -- ignorecase matches both upper and lowercase characters
set.smartcase = true -- while smartcase changes it when u search just a single uppercase character, to ignorecase = false

-- QOL settings
set.clipboard = "unnamedplus" -- yank copies to clipboard instead of vim only
set.confirm = true -- if closing a buffer that has unsaved writes, pops up a confirm message instead of error
set.matchpairs:append("<:>") -- adds arrows to '%' match jumo
set.cursorline = true -- highlights the whole line you're currently on
set.undofile = true -- saves undo history to a file, so when a file is closed and reopened, undo history is kept
set.iskeyword:append("-") -- when deleting/changing a kebab-case word, considers the whole kebab word a single word
set.updatetime = 50 -- mainly used for faster pop-ups when hovering
set.showmode = false
set.signcolumn = "yes"
set.cmdheight = 0
set.showtabline = 0 -- never show the top tabline, we already have filenames from lualine
require("vim._core.ui2").enable({})
