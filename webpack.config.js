webpack.config.js
module: {
	loaders: [
		{
			test: /^src\/js.*\.js$/,
			loader: "babel-loader"
		}
	]
}