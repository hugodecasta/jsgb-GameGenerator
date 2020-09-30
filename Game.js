
// ----------------------------------------------------------------------- CONVERTERS

function hex(h) { return parseInt(h, 16) }
function bin(b) { return parseInt(b, 2) }
function to_hex(d) { return '$' + d.toString(16) }

// ----------------------------------------------------------------------- CONSTANTS

const CARD_NAME = 'My GAME'

const OAM_start_addr = hex('FE00')
const OAM_tile_start_id = hex('80')

const VRAM_start_addr = hex('8000')
const VRAM_sprite_start_addr = hex('8800')

const BGD_palette_mod_addr = hex('FF68')
const OBJ_palette_mod_addr = hex('FF6A')

const JP_A_BIT = 0
const JP_B_BIT = 1
const JP_SELECT_BIT = 2
const JP_START_BIT = 3
const JP_LEFT_BIT = 4
const JP_RIGHT_BIT = 5
const JP_UP_BIT = 6
const JP_DOWN_BIT = 7

// ----------------------------------------------------------------------- GENERATE GAME

function generate_game(game_name) {

    // --- prepare dirs

    const ENGINE_DIR = `${__dirname}/game_engine`
    const GAME_DIR = `${__dirname}/${game_name}_game_code`
    const GAME_CODE_GEN_DIR = `${GAME_DIR}/generated`

    const fs = require('fs')
    const rimraf = require('rimraf')
    const copydir = require('copy-dir')

    rimraf.sync(GAME_DIR)
    copydir.sync(ENGINE_DIR, GAME_DIR)
    fs.mkdirSync(GAME_CODE_GEN_DIR)

    // --- write files

    let game_files = encode_game()
    for (let file_name in game_files) {
        let file_code = game_files[file_name]
        fs.writeFileSync(`${GAME_CODE_GEN_DIR}/${file_name}`, file_code)
    }

    // --- compile

    const ASM_SH_PATH = `./assemble.sh`
    const shell = require('shelljs')
    shell.config.verbose = false
    shell.cd(GAME_DIR)
    shell.exec(ASM_SH_PATH)
}

// ----------------------------------------------------------------------- CODE MANAGEMENT

// code - file - sections - subroutines
var gb_code = {}
var constants = []
var rom_data = {}
var ram_data = {}
var current_file = null
var current_section = null
var current_subroutine = null

var next_branch_id = 0

function code(operation) {
    let line = `${operation}`
    if (!gb_code[current_file])
        gb_code[current_file] = {}
    if (!gb_code[current_file][current_section])
        gb_code[current_file][current_section] = {}
    if (!gb_code[current_file][current_section][current_subroutine])
        gb_code[current_file][current_section][current_subroutine] = []
    gb_code[current_file][current_section][current_subroutine].push(line)
}

function reserve_rom(name, type, data_array) {
    let line = `${name}:\n\t${type} ${data_array.join(', ')}`
    if (!rom_data[current_file]) rom_data[current_file] = []
    rom_data[current_file].push(line)
}

function reserve_rom_multi(name, type, all_data) {
    line = [`${name}:`]
    for (let dat of all_data) {
        line.push(`\t${type} ${dat.join(', ')}`)
    }
    if (!rom_data[current_file]) rom_data[current_file] = []
    rom_data[current_file].push(line.join('\n'))
}

function new_branch() {
    return `branch_${next_branch_id++}`
}

function set_VRAM_bank(bank_number) {
    load_to_addr(hex('FF4F'), bank_number)
}

function reserve_ram(name, byte_size = 1) {
    let line = `${name}: ds ${byte_size}`
    if (!ram_data[current_file])
        ram_data[current_file] = []
    ram_data[current_file].push(line)
}

function set_constant(name, value) {
    constants.push(`DATA_${name} EQU ${JSON.stringify(value)}`)
}

function encode_game() {
    let gb_generated = {}
    let all_files = Object.keys(gb_code)
        .concat(Object.keys(rom_data))
        .concat(Object.keys(ram_data))
        .filter((file, index, self) => self.indexOf(file) == index)
    for (let file of all_files) {
        let file_code = []
        if (gb_code[file]) {
            let file_data = gb_code[file]
            for (let section in file_data) {
                let section_data = file_data[section]
                let section_code = []
                for (let subroutine in section_data) {
                    section_data[subroutine].push('ret')
                    let subroutine_code = section_data[subroutine].map(line => '\t' + line).join('\n')
                    subroutine_code = subroutine + '::\n' + subroutine_code
                    section_code.push(subroutine_code)
                }
                section_code = `SECTION "${section}", ROMX\n` + section_code.join('\n')
                file_code.push(section_code)
            }
        }
        if (rom_data[file]) {
            let rom_dat_code = rom_data[file].join('\n')
            rom_dat_code = `SECTION "${file}_rom_data", ROMX\n` + rom_dat_code
            file_code.push(rom_dat_code)
        }
        if (ram_data[file]) {
            let ram_code = ram_data[file].join('\n')
            ram_code = `SECTION "${file}_ram_data", WRAMX\n` + ram_code
            file_code.push(ram_code)
        }
        file_code = file_code.join('\n\n')
        gb_generated[file + '.asm'] = file_code
    }
    gb_generated['DATA.inc'] = constants.join('\n')

    gb_generated['global_importer.asm'] = Object.keys(gb_generated).map(name => `INCLUDE "generated/${name}"`).join('\n')

    return gb_generated
}

// ----------------------------------------------------------------------- UTILS

function OAM_addr(OAM_id) {
    return OAM_start_addr + OAM_id * 4
}

function load(to, from) {
    if (typeof from == 'number') from = to_hex(from)
    code(`ld ${to}, ${from}`)
}

function call(sr_name) {
    code(`call ${sr_name}`)
}

function add(adder) {
    if (typeof adder == 'number') adder = to_hex(adder)
    code(`add ${adder}`)
}

function sub(subber) {
    if (typeof subber == 'number') subber = to_hex(subber)
    code(`sub ${subber}`)
}

function add_to_addr(addr, adder) {
    if (typeof adder != 'number' && adder != 'b' && adder != 'a') {
        load_from_addr(adder)
        load('b', 'a')
        adder = 'b'
    }
    load_from_addr(addr)
    add(adder)
    load_to_addr(addr, 'a')
}

function sub_to_addr(addr, subber) {
    load_from_addr(addr)
    sub(subber)
    load_to_addr(addr, 'a')
}

function and(ander) {
    if (typeof ander == 'number') adder = to_hex(ander)
    code(`and ${ander}`)
}

function comment(com) {
    code(`; --- ${com}`)
}

function point_addr(addr) {
    if (typeof addr == 'number') addr = to_hex(addr)
    return `[${addr}]`
}

function load_from_addr(addr) {
    load('a', point_addr(addr))
}

function load_to_addr(addr, value) {
    if (value != 'a') load('a', value)
    load(point_addr(addr), 'a')
}

function load_addr_to_addr(addr_to, addr_from) {
    if (addr_from != 'a') addr_from = point_addr(addr_from)
    load_to_addr(addr_to, addr_from)
}

function set_OAM_xy(OAM_id, x, y) {
    let lym = typeof y == 'number' ? load_to_addr : load_addr_to_addr
    lym(OAM_addr(OAM_id), y)
    let lxm = typeof x == 'number' ? load_to_addr : load_addr_to_addr
    lxm(OAM_addr(OAM_id) + 1, x)
}

function set_OAM_tile_id(OAM_id, tile_id) {
    load_to_addr(OAM_addr(OAM_id) + 2, tile_id)
}

function set_OAM_attributes(OAM_id, attr) {
    load_to_addr(OAM_addr(OAM_id) + 3, attr)
}

// ----------------------------------------------------------------------- ROUTINES

function init_generation() {
    goto_init_sr()
    comment('init')
    goto_loop_sr()
    comment('loop')
    goto_joypad_int()
    comment('joypad intterupt')
    set_constant('CARD_NAME', CARD_NAME)
}

function goto_ints() {
    current_file = 'ints'
    current_section = 'ints'
}

function goto_joypad_int() {
    current_file = 'ints'
    current_section = 'ints'
    current_subroutine = 'joypad_int'
}

function goto_init_sr() {
    current_file = 'init'
    current_section = 'init'
    current_subroutine = 'main_init'
}

function goto_loop_sr() {
    current_file = 'loop'
    current_section = 'loop'
    current_subroutine = 'main_loop'
}

function load_palette(palette_start_byte, source_byte, modifier_addr) {
    load('b', palette_start_byte)
    load('hl', source_byte)
    load('de', modifier_addr)
    call('load_palette')
}

function load_bg_palette(palette_id, from_addr) {
    load_palette(palette_id * 8, from_addr, BGD_palette_mod_addr)
}

function load_obj_palette(palette_id, from_addr) {
    load_palette(palette_id * 8, from_addr, OBJ_palette_mod_addr)
}

function setup_palette(name, color_data_array) {
    reserve_rom_multi(name, 'rgb_Set', color_data_array)
}

function setup_tiles(name, tiles_data) {
    reserve_rom(name, 'DB', tiles_data)
}

function setup_background(name, tiles_data, map_data) {
    reserve_rom(`${name}_tiles`, 'DB', tiles_data)
    reserve_rom(`${name}_tile_map`, 'DB', map_data.map(md => md.tile_index).map(v => to_hex(v)))
    reserve_rom(`${name}_info_map`, 'DB', map_data.map(md => {
        let bin_pal_index = md.palette_index.toString(2)
        let bin_map_formated = ("00" + bin_pal_index).slice(-3);
        let VRAM_bank = 0
        let hflip = 0
        let vflip = 0
        let bgoam_prio = 0
        let final_bin = `${bgoam_prio}${vflip}${hflip}0${VRAM_bank}${bin_map_formated}`
        return bin(final_bin)
    }).map(v => to_hex(v)))
}

function label(label_name) {
    code(`.${label_name}:`)
}

function jump(label_name) {
    code(`jp .${label_name}`)
}

function cond_jumper(flagger, flag_cp, flag, label_name) {
    if (flagger == 'bit') code(`bit ${flag_cp}, a`)
    if (flagger == 'cp') code(`cp ${flag_cp}`)
    if (flagger == 'bit') flag = flag == 'z' ? 'nz' : 'z'
    code(`jr ${flag}, .${label_name}`)
}

function if_jumper(flagger, flag_cp, if_func, flag = 'nz') {
    let end_branch = new_branch()
    cond_jumper(flagger, flag_cp, flag, end_branch)
    if_func()
    label(end_branch)
}

function if_else_jumper(flagger, cp_value, if_func, else_func = null) {
    if (else_func == null) {
        return if_jumper(flagger, cp_value, if_func)
    }
    let end_branch = new_branch()
    let else_branch = new_branch()
    cond_jumper(flagger, cp_value, 'nz', else_branch)
    if_func()
    jump(end_branch)
    label(else_branch)
    else_func()
    label(end_branch)
}

function mult_code(operation, times) {
    for (let i = 0; i < times; ++i) code(operation)
}

function left_shift(times) {
    mult_code('rlca', times)
}
function right_shift(times) {
    mult_code('rrca', times)
}

function on_joypad_change_button(button_byte, pressed_func, unpressed_func) {
    load_from_addr('joypad_update')
    right_shift(button_byte)
    and(01)
    if_jumper('cp', 1, () => {
        load_from_addr('joypad_data')
        right_shift(button_byte)
        and(01)
        if_else_jumper('cp', 1, pressed_func, unpressed_func)
    })
}

function mem_copy(from, to, size) {
    let size_segments = Math.trunc(size / 250)
    let remaining = size - 250 * size_segments
    let loaders = Array.from(new Array(size_segments)).map(() => 250).concat(remaining).filter(len => len > 0)
    let total_len = 0
    for (let len of loaders) {
        load('hl', from + ' + ' + total_len)
        load('de', to + ' + ' + total_len)
        load('b', len)
        call('memcpy')
        total_len += len
    }
}

function load_background(name, tile_size, map_size) {

    let tiles_pointer = `${name}_tiles`
    let tile_map_pointer = `${name}_tile_map`
    let map_info_pointer = `${name}_info_map`

    mem_copy(tiles_pointer, hex('8000'), tile_size)
    mem_copy(tile_map_pointer, hex('9800'), map_size)
    set_VRAM_bank(1)
    mem_copy(map_info_pointer, hex('9800'), map_size)
    set_VRAM_bank(0)
}

function put_in_vram_sprite(addr, size) {
    mem_copy(addr, VRAM_sprite_start_addr, size)
}

function put_in_vram_bg(addr, size) {
    mem_copy(addr, VRAM_start_addr, size)
}

function on_joypad_change(event_mapper) {
    let all_evt_func_name = [
        'a_down', 'a_release',
        'b_down', 'b_release',
        'select_down', 'select_release',
        'start_down', 'start_release',
        'right_down', 'right_release',
        'left_down', 'left_release',
        'up_down', 'up_release',
        'down_down', 'down_release',
    ]
    let all_funcs = all_evt_func_name.map(name => event_mapper[name])
    for (let bit_to_check = 0; bit_to_check < 8; ++bit_to_check) {
        let d_func = all_funcs[bit_to_check * 2]
        let r_func = all_funcs[bit_to_check * 2 + 1]
        if (d_func || r_func) {
            load_from_addr('joypad_update')
            if_jumper('bit', bit_to_check, () => {
                load_from_addr('joypad_data')
                if (d_func) if_else_jumper('bit', bit_to_check, d_func, r_func)
                else if (r_func) if_jumper('bit', bit_to_check, r_func, 'z')
            })
        }
    }
}

function on_every(time, func) {

}

function hex_to_color(hc) {
    hc = Array.from(hc)
    hc.splice(0, 1)
    let r = hex(hc.slice(0, 2).join(''))
    let g = hex(hc.slice(2, 4).join(''))
    let b = hex(hc.slice(4, 6).join(''))
    return [r, g, b]
}

function hex_palette(hc1, hc2, hc3, hc4) {
    return [hex_to_color(hc1), hex_to_color(hc2), hex_to_color(hc3), hex_to_color(hc4)]
}

// ----------------------------------------------------------------------- EXPORTS

module.exports = {
    init_generation, setup_palette, setup_background, goto_init_sr,
    load_bg_palette, load_background, current_file, generate_game
}