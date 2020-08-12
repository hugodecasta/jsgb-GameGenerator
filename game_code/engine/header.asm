SECTION "ROM entry point", ROM0[$0100]
	nop
    jp main

SECTION "nintendo check name", ROM0[$0104]
DB $CE, $ED, $66, $66, $CC, $08, $00, $0B
DB $03, $73, $00, $83, $00, $0C, $00, $0D
DB $00, $08, $11, $1F, $88, $89, $00, $0E
DB $DC, $CC, $6E, $E6, $DD, $DD, $D9, $99
DB $BB, $BB, $67, $63, $6E, $0E, $EC, $CC
DB $DD, $DC, $99, $9F, $BB, $B9, $33, $3E

SECTION "card name", ROM0[$0134]
DB DATA_CARD_NAME

SECTION "manufacturer code", ROM0[$013F]
DB "CAME"

SECTION "CGB Compatibility", ROM0[$0143] ; 00 = GB / 80h = retro comp OK / C0h = only CGB
DB $C0

SECTION "new licensee code", ROM0[$0144]
DB 0002 ; (code unused, see table @ https://gbdev.gg8.se/wiki/articles/The_Cartridge_Header#0144-0145_-_New_Licensee_Code)

SECTION "SGB Compatibility", ROM0[$0146] ; 00 = GB or CGB / 03h = supports SGB functions
DB 00

SECTION "Cartridge type", ROM0[$0147] 
DB 00 ; (see table @ https://gbdev.gg8.se/wiki/articles/The_Cartridge_Header#0147_-_Cartridge_Type)

SECTION "ROM & RAM size", ROM0[$0148] 
; (see tables @ https://gbdev.gg8.se/wiki/articles/The_Cartridge_Header#0148_-_ROM_Size)
DB 00
DB 00

SECTION "Selling Destination Code", ROM0[$014A]
DB 01

SECTION "Old Licensee Code", ROM0[$014B]
DB 02 ; (see table @ https://gbdev.gg8.se/wiki/articles/Gameboy_ROM_Header_Info#Licensee)

SECTION "Game Version Number", ROM0[$014C]
DB 00

SECTION "HEADER CHECKSUM (fixed by rgbfix compiler)", ROM0[$014D]
DB $FF

SECTION "GLOBAL CHECKSUM (fixed by rgbfix compiler)", ROM0[$014E]
DW $FACE