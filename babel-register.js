require('@babel/register')({
	// These patterns are relative to the project directory (where the `package.json` file lives):
    ignore: [],
    extensions: [".es6", ".es", ".jsx", ".js", ".mjs", ".ts"],
});