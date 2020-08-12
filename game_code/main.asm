; ----------------------------- HARDWARE

INCLUDE "engine/gbc-hw.inc"
INCLUDE "generated/DATA.inc"

; ----------------------------- UTILS

INCLUDE "engine/utils.asm"

; ----------------------------- HEADER

INCLUDE "engine/interrupt.asm"
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

    call init_joypad_engine

    INCLUDE "generated/init.asm"

; ----------------------------- LOOP

loop:
    ; --- wait for vblank interupt
    halt
    nop
    call run_joypad_engine
    INCLUDE "generated/loop.asm"
    jr loop