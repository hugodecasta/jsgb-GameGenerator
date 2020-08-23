SECTION "init", ROMX
main_init::
	; --- init
	ld b, $0
	ld hl, bg_palette
	ld de, $ff68
	call load_palette
	ld b, $0
	ld hl, socket_palette
	ld de, $ff6a
	call load_palette
	ld hl, socket_tiles
	ld de, $8800
	ld b, $10
	call memcpy
	ld a, $64
	ld [socket_x], a
	ld a, $1e
	ld [socket_y], a
	ld a, $0
	ld [socket_up_acc], a
	ld a, $80
	ld [$fe06], a
	ld a, [socket_y]
	ld [$fe04], a
	ld a, [socket_x]
	ld [$fe05], a
	ld a, $90
	ld [$fe07], a
	ret