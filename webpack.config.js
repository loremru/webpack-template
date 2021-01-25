const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const fs = require('fs')
const webpack = require('webpack')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
	const optimizationObj = {}
	if (isProd) {
		optimizationObj.minimizer = [
			new CssMinimizerPlugin(),
			new TerserPlugin()
		]
	}
	return optimizationObj
}

const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`

const jsLoaders = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: {
				presets: ['@babel/preset-env']
			}
		}
	]

	if (isDev) {
		loaders.push('eslint-loader')
	}

	return loaders
}

const PAGES_DIR = path.resolve(__dirname, 'src', 'pages')
const PAGES = fs.readdirSync(PAGES_DIR).filter(filename => filename.endsWith('.pug'))

module.exports = {
	context: path.resolve(__dirname, 'src'),
	entry: ['@babel/polyfill', './js/index.js'],
	mode: 'development',
	output: {
		filename: filename('js'),
		path: path.resolve(__dirname, 'dist')
	},
	devServer: {
		open: true,
		hot: true,
		contentBase: path.resolve(__dirname, 'src'),
		watchContentBase: true
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@images': path.resolve(__dirname, 'src', 'images')
		}
	},
	devtool: isDev ? 'source-map' : false,
	optimization: optimization(),
	plugins: [
		new CleanWebpackPlugin(),
		...PAGES.map(page => new HtmlWebpackPlugin({
			template: path.resolve(PAGES_DIR, page),
			filename: `./${page.replace(/\.pug/, '.html')}`,
			minify: {
				collapseWhitespace: isProd
			}
		})),
		// new HtmlWebpackPlugin({
		// 	template: path.resolve(__dirname, 'src', 'index.html')
		// }),
		new CopyPlugin({
			patterns:
				[
					{
						from: path.resolve(__dirname, 'src', 'images'),
						to: path.resolve(__dirname, 'dist', 'images')
					},
				]
		}),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
		}),
		new MiniCssExtractPlugin({
			filename: filename('css')
		}),
	],
	module: {
		rules: [
			{
				test: /\.pug$/,
				use: 'pug-loader'
			},
			{
				test: /\.(ttf|eot|woff|woff2)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'fonts',
						publicPath: 'fonts',
					}
				}
			},
			{
				test: /\.(jpg|png|svg|jpf|webp)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'images',
						publicPath: 'images',
					}
				}
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /\.s[ac]ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				],
			},
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: jsLoaders()
			},
		]
	}
}


