return {
  'nvim-treesitter/nvim-treesitter',
  lazy = false,
  build = function()
      require("nvim-treesitter").install({
          "bash",
          "c",
          "css",
          "csv",
          "go",
          "html",
          "javascript",
          "json",
          "jsx",
          "lua",
          "markdown",
          "markdown_inline",
          "python",
          "ruby",
          "sql",
          "tsx",
          "typescript",
          "vim",
          "vimdoc",
          "yaml",
          "zsh",
      })
  end,
config = function()
  vim.api.nvim_create_autocmd("FileType", {
    callback = function(args)
      pcall(vim.treesitter.start, args.buf)
    end,
  })
end
}
