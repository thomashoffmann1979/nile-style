# nile-style

 A png renderer for geojson data, that can be styled with a less-like language.
 This package is a part of [nile](https://github.com/tualo/nile).
 Nile-style compiles a style into an instruction file. A simple javascript file
 with two functions (style and filter). The style function is used by the
 renderer for setting the context draw style during the rendering process. The
 filter function can be used by the tiling service to filter the nessesary
 objects from the database at the requested zoom level.

# Usage

 Nile Style comes with a simple command line tool for testing and compiling
 style files into an instruction file.

 Creating an instruction file:

  nile-style -c <stylefile>
