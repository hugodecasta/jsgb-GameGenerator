# Simple makefile for assembling and linking a GB program.

rwildcard		=	$(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

ASM				:=	rgbasm
LINKER			:=	rgblink
FIX				:=	rgbfix

#EMU				:= wine ~/bgb/bgb.exe
EMU				:= /mnt/c/Users/Hugo/test_bureau/EMU/bgb.exe
#EMU				:= ../../SameBoy-0.13.3/build/bin/SDL/sameboy

PROD_NAME		:= GAME
EXT				:= gbc

ROM_NAME		:= $(PROD_NAME).$(EXT)

ASM_FILES		:=	main.asm #$(wildcard *.z80)
OBJ_FILES		:=	$(addprefix $(PROD_NAME)_,$(addsuffix .o,$(basename $(ASM_FILES))))

.PHONY: all clean

all: fix
	
fix: build
	$(FIX) -p0 -v $(ROM_NAME)

build: $(OBJ_FILES)
	$(LINKER) -m $(PROD_NAME).map -n $(PROD_NAME).sym -o $(ROM_NAME) $(OBJ_FILES)
	
./$(PROD_NAME)_%.o : ./%.asm
	$(ASM) -o $@ $<

run:
	$(EMU) $(ROM_NAME)
	
clean:
	rm -rf *.o
	rm -rf *.map
	rm -rf *.sym

flush:
	make clean
	rm -rf *.gbc
	rm -rf *.gb