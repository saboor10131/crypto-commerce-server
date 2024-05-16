function getFileExtensionFromDataURL(dataURL) {
    // Extract the substring after 'data:'
    var startIndex = dataURL.indexOf('data:') + 'data:'.length;
    
    // Find the position of the first comma (this separates metadata from actual data)
    var commaIndex = dataURL.indexOf(',', startIndex);
    
    // Extract the substring containing the metadata (including the base64 encoding)
    var metadata = dataURL.substring(startIndex, commaIndex);
    
    // Check if metadata includes information about the media type
    var match = /\/([a-zA-Z]*);/.exec(metadata);
    if (match && match[1]) {
        // Return the extracted file extension
        return match[1];
    } else {
        // If no media type information found in metadata, return null
        return null;
    }
}
module.exports = {
    getFileExtensionFromDataURL
}