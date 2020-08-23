SECTION "loop", ROMX
main_loop::
	; --- loop
	ld a, [joypad_data]
	bit 4, a
	jr z, .branch_0
	ld a, [socket_x]
	add $2
	ld [socket_x], a
	.branch_0:
	ld a, [joypad_data]
	bit 5, a
	jr z, .branch_1
	ld a, [socket_x]
	sub $2
	ld [socket_x], a
	.branch_1:
	ld a, [joypad_update]
	and 1
	cp 1
	jr nz, .branch_2
	ld a, [joypad_data]
	and 1
	cp 1
	jr nz, .branch_3
	ld a, [socket_up_acc]
	cp 0
	jr nz, .branch_4
	ld a, [socket_up_acc]
	sub $9
	ld [socket_up_acc], a
	.branch_4:
	.branch_3:
	.branch_2:
	ld a, [socket_up_acc]
	cp 10
	jr nz, .branch_5
	ld a, $9
	ld [socket_up_acc], a
	.branch_5:
	ld a, [socket_up_acc]
	add $1
	ld [socket_up_acc], a
	ld a, [socket_up_acc]
	ld b, a
	ld a, [socket_y]
	add b
	ld [socket_y], a
	ld a, [socket_y]
	cp 100
	jr c, .branch_6
	ld a, $63
	ld [socket_y], a
	ld a, $0
	ld [socket_up_acc], a
	.branch_6:
	ld a, [socket_y]
	ld [$fe04], a
	ld a, [socket_x]
	ld [$fe05], a
	ret