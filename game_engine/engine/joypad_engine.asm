SECTION "joypad_engine", ROMX

; ------------------------------------------------------------------------- JOYPAD ENGINE

init_joypad_engine::
    ld a, 0
    ld [joypad_data], a
    ret

run_joypad_engine::
    ld a, [joypad_data]
    ld c, a
    ld a, $20
    ld [rP1], a
    ld a, [rP1]
    ld a, [rP1]
    cpl
    and $0f
    swap a
    ld b, a
    ld a, $10
    ld [rP1], a
    ld a, [rP1]
    ld a, [rP1]
    ld a, [rP1]
    ld a, [rP1]
    ld a, [rP1]
    ld a, [rP1]
    cpl
    and $0f
    or b
    ld [joypad_data], a
    ld b, a
    xor c
    ld [joypad_update], a
    and b
    ld [joypad_upd_top], a
    ret

a_to_A_btn:
    ld a, [joypad_data]
    and $01
    ret

a_to_B_btn:
    ld a, [joypad_data]
    rrca
    and $01
    ret

a_to_SELECT_btn:
    ld a, [joypad_data]
    rrca
    rrca
    and $01
    ret

a_to_START_btn:
    ld a, [joypad_data]
    rrca
    rrca
    rrca
    and $01
    ret

a_to_RIGHT_btn:
    ld a, [joypad_data]
    swap a
    and $01
    ret

a_to_LEFT_btn:
    ld a, [joypad_data]
    swap a
    rrca
    and $01
    ret

a_to_UP_btn:
    ld a, [joypad_data]
    swap a
    rrca
    rrca
    and $01
    ret

a_to_DOWN_btn:
    ld a, [joypad_data]
    swap a
    rrca
    rrca
    rrca
    and $01
    ret

; ------------------------------------------------------------------------- JOYPAD RAM DATA

SECTION "joypad_engine_data", WRAMX[$D0A0]

joypad_data: ds 01
joypad_update: ds 01
joypad_upd_top: ds 01