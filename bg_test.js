// -------------------------------------- REQUIRES

const tile_importer = require('./image_converter')

let {
    init_generation, setup_palette, setup_background, goto_init_sr,
    load_bg_palette, load_background, current_file, generate_game
} = require('./Game')

// -------------------------------------- DATA

let filename = process.argv[2]
let path = filename.split('-')[0]
let full_path = __dirname + '/imgs/' + path + '/' + filename + '.json'

const { tiles: bg_tiles, map_data: bg_map_data, palettes: bg_palettes } = tile_importer(full_path)

// -------------------------------------- INIT GAME FILES

init_generation()

// -------------------------------------- GB SETUP

current_file = 'background' // -- file

bg_palettes.forEach((palette, index) => {
    setup_palette('bg_palette_' + index, palette)
})
setup_background('bg', bg_tiles, bg_map_data)

// -------------------------------------- INIT

goto_init_sr() // -- file

bg_palettes.forEach((_, index) => {
    load_bg_palette(index, 'bg_palette_' + index)
})
load_background('bg', bg_tiles.length * 16, bg_map_data.length)

// -------------------------------------- COMPILE

generate_game('bg_test')