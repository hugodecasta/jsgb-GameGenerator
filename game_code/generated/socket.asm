SECTION "socket_rom_data", ROMX
socket_palette:
	rgb_Set 155, 188, 15
	rgb_Set 139, 172, 15
	rgb_Set 48, 98, 48
	rgb_Set 15, 56, 15
socket_tiles:
	DB $0, $3c, $0, $ff, $7e, $7e, $0, $7e
	DB $5e, $20, $42, $3e, $4, $3c, $76, $76

SECTION "socket_ram_data", WRAMX
socket_x: ds 1
socket_y: ds 1
socket_up_acc: ds 1