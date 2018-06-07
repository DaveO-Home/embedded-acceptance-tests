
module.exports = function (bundler) {
    bundler.addAssetType('js', require.resolve('./stripAsset.js'));
};
