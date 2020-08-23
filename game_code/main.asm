; ----------------------------- HARDWARE

INCLUDE "engine/gbc-hw.inc"

; ----------------------------- UTILS

INCLUDE "engine/utils.asm"

; ----------------------------- ENGINE

INCLUDE "engine/joypad_engine.asm"

; ----------------------------- GENERATED

INCLUDE "generated/global_importer.asm"

; ----------------------------- HEADER

INCLUDE "engine/interrupts.asm"
INCLUDE "engine/header.asm"

; ----------------------------- MAIN
SECTION "main", ROM0

main:
    nop
    ld sp, $ffff

    ; --- SETUP VBLANK INTERUPT
    di
	ld	a, IEF_VBLANK
	ld	[rIE], a
	ei

    ld a, LCDCF_OFF
    ld [rLCDC], a

    call init_joypad_engine
    call main_init

    ld a, LCDCF_ON|LCDCF_WIN9800|LCDCF_BG8000|LCDCF_BGON|LCDCF_OBJON|LCDCF_OBJ8
    ld [rLCDC], a

; ----------------------------- LOOP

loop:
    ; --- wait for vblank interupt
    halt
    nop
    call run_joypad_engine
    call main_loop
    jr loop