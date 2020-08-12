SECTION "utils", ROM0

memcpy::
    ; HL = source address
    ; DE = destination address
    ; B  = block size
.memcpy_loop:
    ld a,[HL]
    ld [DE], a
    dec b
    jr  nz, .update_regs
    ret
.update_regs:
    inc hl
    inc de
    jr .memcpy_loop

; --------------------------- pointer management

make_HL_enter::
    ; --- HL = destination of new HL n16 value
    ld a, [hli]
    ld C, a
    ld a, [hli]
    ld H, a
    ld L, C
    ret

; --------------------------- screen routine

screen_off::
    ld HL, rLCDC
    res 7, [HL]
    ret

screen_on::
    ld HL, rLCDC
    set 7, [HL]
    ret

; --------------------------- palettes

load_palette::
    ; B = palette starting byte (p0 = 0, p1 = 8)
    ; HL = palette source bytes
    ; DE = palette destination
    ld c, 8
.palette_load_loop:
    ld a, b
    ld [DE], a
    ld a, [HL]
    inc DE
    ld [DE], a
    dec DE
    inc b
    inc HL
    dec c
    jr  nz, .palette_load_loop
    ret

rgb_Set: MACRO
	DW	((\3 >> 3) << 10) + ((\2 >> 3) << 5) + (\1 >> 3)
ENDM