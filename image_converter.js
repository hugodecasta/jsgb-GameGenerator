const fs = require('fs')

function tile_to_bytes(tile_x, tile_y, image) {
    let tile_bytes = []
    for (y_pixel = 0; y_pixel < 8; ++y_pixel) {
        var byte_0 = ''
        var byte_1 = ''
        for (var x_pixel = 0; x_pixel < 8; x_pixel++) {
            let x = tile_x * 8 + x_pixel
            let y = tile_y * 8 + y_pixel
            var pixel = image[x][y]
            byte_0 += pixel == 3 || pixel == 1 ? '1' : '0'
            byte_1 += pixel == 3 || pixel == 2 ? '1' : '0'
        }
        tile_bytes.push(...[parseInt(byte_0, 2), parseInt(byte_1, 2)])
    }
    return tile_bytes
}

module.exports = (image_data_path) => {

    let data = JSON.parse(fs.readFileSync(image_data_path))

    let palettes = data.palettes.map(palette => palette.map(color => color.map(comp => comp * 6)))

    let width = data.pixels.length
    let height = data.pixels[0].length

    let width_tile = width / 8
    let height_tile = height / 8

    let line_end_count = 32 - width_tile

    let tile_count = width_tile * height_tile

    let full_tiles = Array.from(new Array(tile_count))
        .map((_, tile_index) => {
            let tile_x = tile_index % width_tile
            let tile_y = (tile_index / width_tile) << 0
            let bytes = tile_to_bytes(tile_x, tile_y, data.pixels)
            return { bytes, tile_x, tile_y }
        })

    let base_tile = Array.from(new Array(16)).map(_ => 0)

    let tile_str_pool = [base_tile.join(':')]
    let tiles = [base_tile]
    let map_data = []
    full_tiles.forEach((tile_data) => {
        let { bytes, tile_x, tile_y } = tile_data
        let bytes_str = bytes.join(':')
        let tile_index = tile_str_pool.indexOf(bytes_str)
        if (tile_index == -1) {
            tile_index = tile_str_pool.length
            tile_str_pool.push(bytes_str)
            tiles.push(bytes)
        }
        let palette_index = data.palette_map[tile_x][tile_y]
        map_data.push({ tile_index, palette_index })

        // -- append line enders (to complete 32)
        if (tile_x == width_tile - 1) {
            for (let tc = 0; tc < line_end_count; tc++)
                map_data.push({ tile_index: 0, palette_index: 0 })
        }
    })

    return { palettes, map_data, tiles }

}